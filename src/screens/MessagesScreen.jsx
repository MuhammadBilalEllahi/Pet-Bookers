import {Avatar, Input, Layout, Text} from '@ui-kitten/components';
import {Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {BackButton} from '../components/BackButton';
import {MessagesList} from '../components/chat';
import {ThemedIcon} from '../components/Icon';
import {setBottomTabBarVisibility} from '../store/configs';
import {resetActiveRoom} from '../store/chat';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import {useTheme} from '../theme/ThemeContext';
import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated 
} from '../store/user';
import { smartBuyerClient, smartSellerClient, handleAuthError } from '../utils/authAxiosClient';
import Toast from 'react-native-toast-message';

export const MessagesScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const {roomId, recipientProfile, recipientName, chatType} = route.params;
  
  // Authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log('Chat params:', { roomId, recipientProfile, recipientName, chatType });

  // Check authentication based on chat type
  const isAuthenticated = chatType === 'buyer' ? isBuyerAuthenticated : isSellerAuthenticated;
  const client = chatType === 'buyer' ? smartBuyerClient : smartSellerClient;

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        `Please sign in as ${chatType} to continue this conversation.`,
        [
          { text: 'Go Back', onPress: () => navigation.goBack() }
        ]
      );
      return;
    }

    fetchMessages();
  }, [roomId, chatType, isAuthenticated]);

  const fetchMessages = async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      let response;
      
      if (chatType === 'buyer') {
        // Buyer fetching messages with seller (roomId is the seller_id)
        response = await smartBuyerClient.get(`customer/chat/get-messages/seller/${roomId}?limit=50&offset=0`);
      } else {
        // Seller fetching messages with customer (roomId is the customer/user_id)
        response = await smartSellerClient.get(`messages/get-message/customer/${roomId}?limit=50&offset=0`);
      }

      console.log(`${chatType} chat response:`, JSON.stringify(response.data, null, 2));
      
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
          selfMessage: chatType === 'buyer' 
            ? msg.sent_by_customer === 1 
            : msg.sent_by_seller === 1,
          messageDateTime: msg.created_at,
          status: 'sent',
          attachmentType: msg.attachment_type || null,
          attachment: msg.attachment || null,
        }));
        
        // Sort messages by creation time (newest first for display)
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(b.messageDateTime) - new Date(a.messageDateTime)
        );
        
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error(`Error fetching ${chatType} messages:`, error);
      handleAuthError(error, (err) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: `Failed to load messages: ${err?.message || 'Unknown error'}`
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
        response = await smartBuyerClient.post('customer/chat/send-message/seller', {
          id: roomId, // seller_id
          message: newMessage.trim(),
        });
      } else {
        // Seller sending message to customer (roomId is customer/user_id)
        response = await smartSellerClient.post('messages/send/customer', {
          id: roomId, // customer/user_id
          message: newMessage.trim(),
        });
      }

      console.log(`${chatType} send message response:`, JSON.stringify(response.data, null, 2));

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
        
        Toast.show({
          type: 'success',
          text1: 'Message sent',
          text2: 'Your message has been delivered'
        });
        
        // Optionally refresh messages to get the real message with server ID
        // setTimeout(() => fetchMessages(), 1000);
      }
    } catch (error) {
      console.error(`Error sending ${chatType} message:`, error);
      handleAuthError(error, (err) => {
        Toast.show({
          type: 'error',
          text1: 'Failed to send message',
          text2: err?.response?.data?.message || err?.message || 'Please try again'
        });
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPress = () => {
    if (newMessage.trim() && !isSending && isAuthenticated) {
      sendMessage();
    }
  };

  const renderSendIcon = props => (
    <TouchableWithoutFeedback onPress={handleSendPress}>
      <ThemedIcon
        {...props}
        name={isSending ? "clock-outline" : "paper-plane-outline"}
        fill={isSending ? theme['color-shadcn-muted-foreground'] : theme['color-shadcn-primary']}
      />
    </TouchableWithoutFeedback>
  );

  const onGoBack = () => {
    dispatch(setBottomTabBarVisibility(true));
    dispatch(resetActiveRoom());
    navigation.goBack();
  };

  // Show authentication prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout level="3" style={styles.authContainer}>
        <View style={styles.authPrompt}>
          <ThemedIcon
            name="lock-outline"
            style={[styles.authIcon, { 
              fill: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400'] 
            }]}
          />
          <Text style={[styles.authTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            Authentication Required
          </Text>
          <Text style={[styles.authMessage, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            Please sign in as {chatType} to continue this conversation.
          </Text>
          <TouchableOpacity 
            style={[styles.authButton, { backgroundColor: theme['color-shadcn-primary'] }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.authButtonText, { color: theme['color-shadcn-primary-foreground'] }]}>
              Go Back
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
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
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
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
              borderBottomWidth: 1,
              borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            },
          ]}>
          <BackButton onPress={onGoBack} />
          <View
            style={[flexeStyles.row, flexeStyles.itemsCenter, {marginLeft: 4}]}>
            <Avatar
              source={{uri: recipientProfile}}
              style={styles.avatar}
            />
            <View style={{marginLeft: 12}}>
              <Text 
                category="h6" 
                style={{ 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                  fontWeight: '600',
                }}
              >
                {recipientName || 'User'}
              </Text>
              <View style={[flexeStyles.row, flexeStyles.itemsCenter]}>
                <View 
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: theme['color-success-default'] }
                  ]} 
                />
                <Text 
                  category="c2" 
                  style={{ 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                    marginLeft: 4,
                  }}
                >
                  {chatType === 'buyer' ? 'Chatting as Buyer' : 'Chatting as Seller'}
                </Text>
              </View>
            </View>
          </View>
          {/* Chat type indicator */}
          <View style={styles.chatTypeIndicator}>
            <Text style={[styles.chatTypeText, {
              color: chatType === 'buyer' 
                ? theme['color-info-default'] 
                : theme['color-warning-default']
            }]}>
              {chatType === 'buyer' ? 'Buyer' : 'Seller'}
            </Text>
          </View>
        </Layout>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ThemedIcon
              name="loader-outline"
              style={[styles.loadingIcon, { 
                fill: theme['color-shadcn-primary'] 
              }]}
            />
            <Text style={[styles.loadingText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              Loading messages...
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
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderTopWidth: 1,
            borderTopColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
          }
        ]}
      >
        <View style={styles.inputWrapper}>
          <Input
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={`Message as ${chatType}...`}
            style={[
              styles.input,
              { 
                backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
              }
            ]}
            textStyle={{ 
              color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
            }}
            placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
            disabled={isSending}
            onSubmitEditing={handleSendPress}
            multiline
          />
          <TouchableOpacity 
            onPress={handleSendPress} 
            style={[
              styles.sendButton,
              { 
                backgroundColor: isSending ? theme['color-shadcn-muted'] : theme['color-shadcn-primary'],
                opacity: isSending ? 0.7 : 1
              }
            ]}
            disabled={isSending}
          >
            <Text 
              category="s1"
              style={{ 
                color: theme['color-shadcn-primary-foreground'],
                fontWeight: '600'
              }}
            >
              {isSending ? 'Sending...' : 'Send'}
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
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatTypeText: {
    fontSize: 12,
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
});

