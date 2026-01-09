import React from 'react';
import {Avatar, Input, Layout, Text} from '@ui-kitten/components';
import {
  Button,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  Image,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {BackButton} from '../components/BackButton';
import {MessagesList} from '../components/chat';
import {ThemedIcon} from '../components/Icon';
import {setBottomTabBarVisibility} from '../store/configs';
import {resetActiveRoom} from '../store/chat';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import {useTheme} from '../theme/ThemeContext';
import {useEffect, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  selectCustomerInfo,
  selectSellerInfo,
} from '../store/user';
import {
  smartBuyerClient,
  smartSellerClient,
  handleAuthError,
} from '../utils/authAxiosClient';
import Toast from 'react-native-toast-message';
import {useTranslation} from 'react-i18next';

export const MessagesScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const route = useRoute();
  const {roomId, recipientProfile, recipientName, chatType, productInfo} =
    route.params;

  // Authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const customerInfo = useSelector(selectCustomerInfo);
  const sellerInfo = useSelector(selectSellerInfo);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // console.log('Chat params:', { roomId, recipientProfile, recipientName, chatType, productInfo });

  // Check authentication based on chat type
  const isAuthenticated =
    chatType === 'buyer' ? isBuyerAuthenticated : isSellerAuthenticated;
  const client = chatType === 'buyer' ? smartBuyerClient : smartSellerClient;

  useEffect(() => {
    // Hide bottom tab bar when entering MessagesScreen
    dispatch(setBottomTabBarVisibility(false));

    if (!isAuthenticated) {
      Alert.alert(
        t('messagesScreen.authRequired.title'),
        t('messagesScreen.authRequired.message', {chatType}),
        [
          {
            text: t('messagesScreen.authRequired.goBack'),
            onPress: () => navigation.goBack(),
          },
        ],
      );
      return;
    }

    fetchMessages();
  }, [roomId, chatType, isAuthenticated]);

  // Cleanup effect to ensure bottom tab bar is shown when leaving
  useEffect(() => {
    return () => {
      // Show bottom tab bar when component unmounts
      dispatch(setBottomTabBarVisibility(true));
    };
  }, [dispatch]);

  const fetchMessages = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      let response;

      if (chatType === 'buyer') {
        // Buyer fetching messages with seller (roomId is the seller_id)
        response = await smartBuyerClient.get(
          `customer/chat/get-messages/seller/${roomId}?limit=50&offset=0`,
        );
      } else {
        // Seller fetching messages with customer (roomId is the customer/user_id)
        response = await smartSellerClient.get(
          `messages/get-message/customer/${roomId}?limit=50&offset=0`,
        );
      }

      // console.log(`${chatType} chat response:`, JSON.stringify(response.data, null, 2));

      if (response.data) {
        let messagesData = [];

        if (chatType === 'buyer') {
          // Handle buyer chat response structure
          if (response.data.message && Array.isArray(response.data.message)) {
            messagesData = response.data.message;
          } else if (Array.isArray(response.data)) {
            messagesData = response.data;
          }
        } else {
          // Handle seller chat response structure
          if (response.data.message && Array.isArray(response.data.message)) {
            messagesData = response.data.message;
          } else if (Array.isArray(response.data)) {
            messagesData = response.data;
          }
        }

        const formattedMessages = messagesData.map(msg => ({
          id: msg.id,
          message: msg.message,
          selfMessage:
            chatType === 'buyer'
              ? msg.sent_by_customer === 1
              : msg.sent_by_seller === 1,
          messageDateTime: msg.created_at,
          status: 'sent',
          attachmentType: msg.attachment_type || null,
          attachment: msg.attachment || null,
        }));

        // Sort messages by creation time (newest first for display)
        const sortedMessages = formattedMessages.sort(
          (a, b) => new Date(b.messageDateTime) - new Date(a.messageDateTime),
        );

        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error(`Error fetching ${chatType} messages:`, error);
      handleAuthError(error, err => {
        Toast.show({
          type: 'error',
          text1: t('common.error'),
          text2: `${t('messagesScreen.messages.failedToLoad')}: ${
            err?.message || t('messagesScreen.messages.unknownError')
          }`,
        });
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending || !isAuthenticated) {
      return;
    }

    try {
      setIsSending(true);
      let response;

      if (chatType === 'buyer') {
        // Buyer sending message to seller (roomId is seller_id)
        response = await smartBuyerClient.post(
          'customer/chat/send-message/seller',
          {
            id: roomId, // seller_id
            message: newMessage.trim(),
          },
        );
      } else {
        // Seller sending message to customer (roomId is customer/user_id)
        response = await smartSellerClient.post('messages/send/customer', {
          id: roomId, // customer/user_id
          message: newMessage.trim(),
        });
      }

      // console.log(`${chatType} send message response:`, JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        // Create optimistic message update
        const newMsg = {
          id: Date.now(), // Temporary ID
          message: newMessage.trim(),
          selfMessage: true,
          messageDateTime: new Date().toISOString(),
          status: 'sent',
          attachmentType: null,
          attachment: null,
        };

        // Add message to the top of the list (newest first)
        setMessages(prevMessages => [newMsg, ...prevMessages]);
        setNewMessage('');

        // Toast.show({
        //   type: 'success',
        //   text1: 'Message sent',
        //   text2: 'Your message has been delivered'
        // });

        // Optionally refresh messages to get the real message with server ID
        // setTimeout(() => fetchMessages(), 1000);
      }
    } catch (error) {
      console.error(`Error sending ${chatType} message:`, error);
      handleAuthError(error, err => {
        Toast.show({
          type: 'error',
          text1: t('messagesScreen.messages.failedToSend'),
          text2:
            err?.response?.data?.message ||
            err?.message ||
            t('messagesScreen.messages.pleaseRetry'),
        });
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPress = () => {
    if (!newMessage.trim() || isSending || !isAuthenticated) {
      return;
    }

    // Email regex - detects standard email formats and obfuscated attempts
    // Catches: user@domain.com, user@_gmail_._com_, user@_domain.com, user@domain_tld, etc.
    // Pattern: username@domain_separator_tld (catches any @ followed by text with separator and TLD-like pattern)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9._-]*[A-Za-z0-9]+[A-Za-z0-9._-]*[._][A-Za-z0-9._-]*[A-Za-z]{2,}[A-Za-z0-9._-]*\b/gi;
    
    // Phone regex - catches formats like: 0321900, 0.3.2.1.9.0.0, 0\3\2\1, 0-3-2-1, 0311155382\0, etc.
    // Pattern 1: Standard formats (123-456-7890, +1 123 456 7890)
    // Pattern 2: Obfuscated with repeated separators (0.3.2.1.9.0.0, 0\3\2\1\9\0\0)
    // Pattern 3: 7+ digits with separator followed by digits/characters (0311155382\0, 0311155382.0, 0311155382-0)
    // Pattern 4: 10+ consecutive digits
    const phoneRegex = /(\+?\d{1,3}[-.\s\\\/]?)?\(?\d{3}\)?[-.\s\\\/]?\d{3}[-.\s\\\/]?\d{4}|\b\d{1,4}([-.\s\\\/])\d{1,4}\1\d{1,4}(\1\d{1,4}){0,3}\b|\b\d{7,}[-.\s\\\/][^\w]{0,2}[\d]*|\b\d{10,}\b/gi;

    const hasEmail = emailRegex.test(newMessage);
    const hasPhone = phoneRegex.test(newMessage);

    if (hasEmail || hasPhone) {
      let message = '';
      if (hasEmail && hasPhone) {
        message = t('messagesScreen.messages.emailPhoneNotAllowed') || 'Email addresses and phone numbers are not allowed in messages';
      } else if (hasEmail) {
        message = t('messagesScreen.messages.emailNotAllowed') || 'Email addresses are not allowed in messages';
      } else {
        message = t('messagesScreen.messages.phoneNotAllowed') || 'Phone numbers are not allowed in messages';
      }

      Alert.alert(
        t('common.error') || 'Error',
        message,
        [{ text: t('common.ok') || 'OK' }]
      );
      return;
    }

    sendMessage();
  };

  const renderSendIcon = props => (
    <TouchableWithoutFeedback onPress={handleSendPress}>
      <ThemedIcon
        {...props}
        name={isSending ? 'clock-outline' : 'paper-plane-outline'}
        fill={
          isSending
            ? theme['color-shadcn-muted-foreground']
            : theme['color-shadcn-primary']
        }
      />
    </TouchableWithoutFeedback>
  );

  const onGoBack = () => {
    // Ensure bottom tab bar is visible before going back
    dispatch(setBottomTabBarVisibility(true));
    dispatch(resetActiveRoom());

    // Small delay to ensure Redux state is updated before navigation
    setTimeout(() => {
      navigation.goBack();
    }, 10);
  };

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout level="3" style={styles.authContainer}>
        <View style={styles.authPrompt}>
          <ThemedIcon
            name="lock-outline"
            style={[
              styles.authIcon,
              {
                fill: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-400'],
              },
            ]}
          />
          <Text
            style={[
              styles.authTitle,
              {
                color: isDark
                  ? theme['color-shadcn-foreground']
                  : theme['color-basic-900'],
              },
            ]}>
            {t('messagesScreen.authRequired.title')}
          </Text>
          <Text
            style={[
              styles.authMessage,
              {
                color: isDark
                  ? theme['color-shadcn-muted-foreground']
                  : theme['color-basic-600'],
              },
            ]}>
            {t('messagesScreen.authRequired.message', {chatType})}
          </Text>
          <TouchableOpacity
            style={[
              styles.authButton,
              {backgroundColor: theme['color-shadcn-primary']},
            ]}
            onPress={() => navigation.goBack()}>
            <Text
              style={[
                styles.authButtonText,
                {color: theme['color-shadcn-primary-foreground']},
              ]}>
              {t('messagesScreen.authRequired.goBack')}
            </Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      level="3"
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        flexGrow: 1,
        backgroundColor: isDark
          ? theme['color-shadcn-background']
          : theme['color-basic-100'],
      }}>
      <Layout style={{flex: 1}}>
        <Layout
          style={[
            styles.header,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            spacingStyles.px16,
            spacingStyles.py8,
            {
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : theme['color-basic-100'],
              borderBottomWidth: 1,
              borderBottomColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            },
          ]}>
          <BackButton onPress={onGoBack} />
          <View
            style={[flexeStyles.row, flexeStyles.itemsCenter, {marginLeft: 4}]}>
            <Avatar source={{uri: recipientProfile}} style={styles.avatar} />
            <View style={{marginLeft: 12}}>
              <View
                style={[
                  flexeStyles.row,
                  flexeStyles.itemsCenter,
                  {alignItems: 'baseline'},
                ]}>
                <Text
                  category="h6"
                  style={{
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                    fontWeight: '600',
                  }}>
                  {recipientName || t('common.user')}
                </Text>
                {/* Chat type indicator */}
                <View
                  style={[
                    styles.chatTypeIndicator,
                    {
                      backgroundColor: theme['background-basic-color-2'],
                      borderColor: theme['border-basic-color-1'],
                      borderWidth: 1,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chatTypeText,
                      {
                        color: isDark ? 'white' : '#121212',
                      },
                    ]}>
                    {chatType === 'buyer'
                      ? t('messagesScreen.chatStatus.seller')
                      : t('messagesScreen.chatStatus.buyer')}
                  </Text>
                </View>
              </View>
              <View style={[flexeStyles.row, flexeStyles.itemsCenter]}>
                <View
                  style={[
                    // styles.onlineIndicator,
                    {backgroundColor: theme['color-success-default']},
                  ]}
                />
                <Text
                  category="c2"
                  style={{
                    color: isDark
                      ? theme['color-shadcn-muted-foreground']
                      : theme['color-basic-600'],
                    marginLeft: 0,
                  }}>
                  {chatType === 'seller'
                    ? t('messagesScreen.chatStatus.youAreChattingAsSeller')
                    : t('messagesScreen.chatStatus.youAreChattingAsBuyer')}
                </Text>
              </View>
            </View>
          </View>
        </Layout>

        {/* Account Email Display - Show which account is sending messages */}
        {((chatType === 'buyer' && customerInfo?.email) ||
          (chatType === 'seller' && sellerInfo?.email)) && (
          <View>
            <View
              style={[
                styles.accountEmailContainer,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-card']
                    : theme['color-basic-100'],
                },
              ]}>
              <View style={styles.accountEmailContent}>
                <ThemedIcon
                  name={
                    chatType === 'buyer'
                      ? 'shopping-bag-outline'
                      : 'shopping-bag-outline'
                  }
                  style={[
                    styles.accountEmailIcon,
                    {
                      fill:
                        chatType === 'buyer'
                          ? theme['color-primary-500']
                          : theme['color-warning-500'],
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.accountEmailText,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}
                  numberOfLines={1}>
                  {' '}
                  {t('messagesScreen.accountEmail.yourMailIs')}
                  {': '}
                  {chatType === 'buyer' ? customerInfo.email : sellerInfo.email}
                </Text>
              </View>
            </View>
            {/* Divider */}
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? theme['color-shadcn-border']
                    : theme['color-basic-400'],
                },
              ]}
            />
          </View>
        )}

        {/* Product Info Card - Show when coming from ProductDetailScreen */}
        {productInfo && (
          <View
            style={[
              styles.productInfoCard,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
                borderBottomColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}>
            <View style={styles.productInfoHeader}>
              <ThemedIcon
                name="info-outline"
                style={[
                  styles.productInfoIcon,
                  {
                    fill: theme['color-shadcn-primary'],
                  },
                ]}
              />
              <Text
                style={[
                  styles.productInfoTitle,
                  {
                    color: isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-900'],
                  },
                ]}>
                {t('messagesScreen.productInfo.chattingAbout')}
              </Text>
            </View>
            <View style={styles.productInfoContent}>
              <Image
                source={{uri: productInfo.image}}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text
                  style={[
                    styles.productName,
                    {
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    },
                  ]}>
                  {productInfo.name}
                </Text>
                <Text
                  style={[
                    styles.productPrice,
                    {
                      color: theme['color-shadcn-primary'],
                    },
                  ]}>
                  PKR {productInfo.price?.toLocaleString() || '0'}
                </Text>
                <Text
                  style={[
                    styles.productShop,
                    {
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                    },
                  ]}>
                  {t('messagesScreen.productInfo.from')}:{' '}
                  {productInfo.seller?.shopName || t('common.shop')}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedIcon
              name="loader-outline"
              style={[
                styles.loadingIcon,
                {
                  fill: theme['color-shadcn-primary'],
                },
              ]}
            />
            <Text
              style={[
                styles.loadingText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('messagesScreen.messages.loading')}
            </Text>
          </View>
        ) : (
          <MessagesList
            messagesList={messages}
            keyExtractor={item => item.id.toString()}
          />
        )}
      </Layout>

      <Layout
        level="1"
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderTopWidth: 1,
            borderTopColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          },
        ]}>
        <View style={styles.inputWrapper}>
          <Input
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={t('messagesScreen.messages.placeholder', {
              chatType: chatType
                ? chatType.charAt(0).toUpperCase() + chatType.slice(1)
                : '',
            })}
            style={[
              styles.input,
              {
                backgroundColor: isDark
                  ? theme['color-shadcn-secondary']
                  : theme['color-basic-200'],
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
              },
            ]}
            textStyle={{
              color: isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            }}
            placeholderTextColor={
              isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
            disabled={isSending}
            onSubmitEditing={handleSendPress}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendPress}
            style={[
              styles.sendButton,
              {
                backgroundColor: isSending
                  ? theme['color-shadcn-muted']
                  : theme['color-shadcn-primary'],
                opacity: isSending ? 0.7 : 1,
              },
            ]}
            disabled={isSending}>
            <Text
              category="s1"
              style={{
                color: theme['color-shadcn-primary-foreground'],
                fontWeight: '600',
              }}>
              {isSending
                ? t('messagesScreen.messages.sending')
                : t('messagesScreen.messages.send')}
            </Text>
          </TouchableOpacity>
        </View>
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chatTypeIndicator: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  chatTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  authPrompt: {
    alignItems: 'center',
    maxWidth: 300,
  },
  authIcon: {
    width: 64,
    height: 64,
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  authMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  productInfoCard: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productInfoIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  productInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  productInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productShop: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIcon: {
    width: 40,
    height: 40,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  accountEmailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  accountEmailContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountEmailIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  accountEmailText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
