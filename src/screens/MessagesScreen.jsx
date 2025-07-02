import {Avatar, Input, Layout, Text} from '@ui-kitten/components';
import {Button, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {BackButton} from '../components/BackButton';
import {MessagesList} from '../components/chat';
import {ThemedIcon} from '../components/Icon';
import {setBottomTabBarVisibility} from '../store/configs';
import {resetActiveRoom} from '../store/chat';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import {useTheme} from '../theme/ThemeContext';
import { axiosSellerClient } from '../utils/axiosClient';
import { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';

export const MessagesScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();
  const route = useRoute();
  const {roomId, recipientProfile, recipientName} = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  console.log('roomId in [MessagesScreen]', roomId);
  console.log('recipientProfile in [MessagesScreen]', recipientProfile);
  console.log('recipientName in [MessagesScreen]', recipientName);
  console.log('messages in [MessagesScreen]', messages);
  console.log('newMessage in [MessagesScreen]', newMessage);
  console.log('isSending in [MessagesScreen]', isSending);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axiosSellerClient.get(`messages/get-message/customer/${roomId}?limit=10&offset=0`);
        if (response.data && Array.isArray(response.data)) {
          const formattedMessages = response.data.map(msg => ({
            id: msg.id,
            message: msg.message,
            selfMessage: msg.sender_type === 'seller',
            messageDateTime: msg.created_at,
            status: 'sent',
            attachmentType: msg.attachment_type || null,
            attachment: msg.attachment || null,
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [roomId]);

  const sendMessage = async () => {
    console.log('newMessage in [MessagesScreen] sendMessage', newMessage);
    if (!newMessage.trim() || isSending) {
      return;
    }

    try {
      setIsSending(true);
      const response = await axiosSellerClient.post('messages/send/customer', {
        id: roomId,
        message: newMessage.trim(),
      });
      console.log('response in [MessagesScreen] sendMessage', JSON.stringify(response.data, null, 2));

      if (response.status === 200) {
        const newMsg = {
          id: Date.now(),
          message: newMessage.trim(),
          selfMessage: true,
          messageDateTime: new Date().toISOString(),
          status: 'sent',
          attachmentType: null,
          attachment: null,
        };
        setMessages(prevMessages => [newMsg, ...prevMessages]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendPress = () => {
    if (newMessage.trim() && !isSending) {
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
                    { backgroundColor: theme['color-shadcn-primary'] }
                  ]} 
                />
                <Text 
                  category="c2" 
                  style={{ 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                    marginLeft: 4,
                  }}
                >
                  Online
                </Text>
              </View>
            </View>
          </View>
        </Layout>
        <MessagesList 
          messagesList={messages} 
          keyExtractor={item => item.id.toString()}
        />
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
            placeholder="Your message"
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
  inputContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
});

