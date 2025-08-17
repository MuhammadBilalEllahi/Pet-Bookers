import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, View, TouchableOpacity } from 'react-native';
import { 
  Layout, 
  Text, 
  Input,
  Button,
  Card,
  Icon,
  Spinner,
  Divider
} from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { smartBuyerClient } from '../../utils/authAxiosClient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const SupportTicketDetailScreen = ({ route, navigation }) => {
  const { ticketId, ticket } = route.params;
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef(null);

  const fetchConversation = useCallback(async () => {
    try {
      const response = await smartBuyerClient.get(`customer/support-ticket/conv/${ticketId}`);
      setConversation(response.data || []);
    } catch (error) {
      console.error('Error fetching conversation:', error?.response?.data?.message || error?.message || error);
      Alert.alert(
        t('common.error'),
        error?.response?.data?.message || t('supportTickets.alerts.loadError')
      );
    } finally {
      setLoading(false);
    }
  }, [ticketId, t]);

  useFocusEffect(
    useCallback(() => {
      fetchConversation();
    }, [fetchConversation])
  );

  useEffect(() => {
    // Auto scroll to bottom when new messages are added
    if (conversation.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation]);

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      return;
    }

         try {
       setSending(true);
       
       const formData = new FormData();
       formData.append('message', replyText.trim());

       const response = await smartBuyerClient.post(`customer/support-ticket/reply/${ticketId}`, formData, {
         headers: {
           'Content-Type': 'multipart/form-data',
         },
       });

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: response.data.message || t('supportTickets.detail.replySuccess'),
        position: 'top',
      });

      setReplyText('');
      // Refresh conversation to show new reply
      fetchConversation();

    } catch (error) {
      console.error('Error sending reply:', error);
      
      let errorMessage = t('supportTickets.detail.replyError');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(
        t('common.error'),
        errorMessage
      );
    } finally {
      setSending(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FF6D1A';
      case 'open':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'closed':
        return '#757575';
      default:
        return theme['color-basic-600'];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return theme['color-basic-600'];
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderMessage = (message, index) => {
    const isAdminMessage = message.admin_message && message.admin_message.trim() !== '';
    const messageText = isAdminMessage ? message.admin_message : message.customer_message;
    const isCustomer = !isAdminMessage;

    return (
      <View key={index} style={[styles.messageContainer, {
        alignItems: isCustomer ? 'flex-end' : 'flex-start',
      }]}>
        <Card style={[styles.messageCard, {
          backgroundColor: isCustomer 
            ? theme['color-primary-500'] 
            : (isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']),
          borderColor: isCustomer 
            ? theme['color-primary-500'] 
            : (isDark ? theme['color-shadcn-border'] : theme['color-basic-300']),
          maxWidth: '80%',
          shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
        }]}>
          <Text style={[styles.messageText, {
            color: isCustomer 
              ? '#FFFFFF' 
              : (isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'])
          }]}>
            {messageText}
          </Text>
          <Text style={[styles.messageTime, {
            color: isCustomer 
              ? 'rgba(255, 255, 255, 0.7)' 
              : (isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'])
          }]}>
            {formatDate(message.created_at)}
          </Text>
        </Card>
        
        <View style={styles.senderLabel}>
          <Text style={[styles.senderText, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            {isCustomer ? t('common.you') : 'Support Team'}
          </Text>
        </View>
      </View>
    );
  };

  const ShimmerMessage = ({ isCustomer = false }) => {
    const shimmerColors = isDark 
      ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
      : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']];

    return (
      <View style={[styles.messageContainer, {
        alignItems: isCustomer ? 'flex-end' : 'flex-start',
      }]}>
        <Card style={[styles.messageCard, {
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          maxWidth: '80%',
        }]}>
          <ShimmerPlaceholder
            style={{ height: 16, width: '90%', marginBottom: 8, borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={{ height: 16, width: '70%', marginBottom: 8, borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
          <ShimmerPlaceholder
            style={{ height: 12, width: '40%', borderRadius: 4 }}
            LinearGradient={LinearGradient}
            shimmerColors={shimmerColors}
          />
        </Card>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, {
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
      }]}>
        {/* Header Shimmer */}
        <Card style={[styles.headerCard, {
          backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
          borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
        }]}>
          <View style={styles.headerContent}>
            <ShimmerPlaceholder
              style={{ height: 24, width: '60%', marginBottom: 8, borderRadius: 6 }}
              LinearGradient={LinearGradient}
              shimmerColors={isDark 
                ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
                : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]}
            />
            <ShimmerPlaceholder
              style={{ height: 20, width: '80%', marginBottom: 12, borderRadius: 6 }}
              LinearGradient={LinearGradient}
              shimmerColors={isDark 
                ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
                : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]}
            />
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
              <ShimmerPlaceholder
                style={{ height: 14, width: 60, borderRadius: 4 }}
                LinearGradient={LinearGradient}
                shimmerColors={isDark 
                  ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
                  : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]}
              />
              <ShimmerPlaceholder
                style={{ height: 14, width: 80, borderRadius: 4 }}
                LinearGradient={LinearGradient}
                shimmerColors={isDark 
                  ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
                  : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]}
              />
            </View>
          </View>
        </Card>
        
        {/* Messages Shimmer */}
        <View style={styles.conversationContent}>
          <ShimmerPlaceholder
            style={{ height: 20, width: '40%', marginBottom: 16, borderRadius: 6 }}
            LinearGradient={LinearGradient}
            shimmerColors={isDark 
              ? [theme['color-shadcn-card'], theme['color-shadcn-secondary'], theme['color-shadcn-card']]
              : [theme['color-basic-200'], theme['color-basic-300'], theme['color-basic-200']]}
          />
          {[0,1,2].map((_, index) => (
            <ShimmerMessage key={index} isCustomer={index % 2 === 0} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, {
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
      }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Ticket Header */}
      <Card style={[styles.headerCard, {
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300'],
        shadowColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400']
      }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.ticketTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {t('supportTickets.detail.title', { ticketId })}
          </Text>
          <Text style={[styles.ticketSubject, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {ticket?.subject}
          </Text>
          
          <View style={styles.ticketMeta}>
            <View style={styles.metaRow}>
              <View style={styles.statusBadge}>
                <View style={[styles.statusIndicator, {
                  backgroundColor: getStatusColor(ticket?.status)
                }]} />
                <Text style={[styles.statusText, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {t(`supportTickets.status.${ticket?.status?.toLowerCase()}`) || ticket?.status}
                </Text>
              </View>

              <View style={styles.priorityBadge}>
                <Icon name="flag" style={styles.priorityIcon} fill={getPriorityColor(ticket?.priority)} />
                <Text style={[styles.priorityText, {
                  color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                }]}>
                  {t(`supportTickets.priority.${ticket?.priority?.toLowerCase()}`) || ticket?.priority}
                </Text>
              </View>
            </View>

            <Text style={[styles.createdDate, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {t('supportTickets.detail.createdAt', { date: formatDate(ticket?.created_at) })}
            </Text>
          </View>
          
          {ticket?.description && (
            <Text style={[styles.ticketDescription, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-700']
            }]}>
              {ticket.description}
            </Text>
          )}
        </View>
      </Card>

      <Divider style={{
        backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
      }} />

      {/* Conversation */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.conversationContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conversationContent}
      >
        <Text style={[styles.conversationTitle, {
          color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
        }]}>
          {t('supportTickets.detail.conversation')}
        </Text>

        {conversation.length === 0 ? (
          <View style={styles.emptyMessages}>
            <Icon 
              name="message-circle" 
              style={styles.emptyIcon} 
              fill={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400']} 
            />
            <Text style={[styles.emptyText, {
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>
              {t('supportTickets.detail.noMessages')}
            </Text>
          </View>
        ) : (
          conversation.map((message, index) => renderMessage(message, index))
        )}
      </ScrollView>

      {/* Reply Input */}
      <View style={[styles.replyContainer, {
        backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
        borderTopColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-300']
      }]}>
        <View style={styles.replyInputContainer}>
          <Input
            style={styles.replyInput}
            textStyle={styles.replyTextStyle}
            placeholder={t('supportTickets.detail.replyPlaceholder')}
            multiline={true}
            numberOfLines={3}
            value={replyText}
            onChangeText={setReplyText}
            disabled={sending}
          />
          <TouchableOpacity
            style={[styles.sendButton, {
              opacity: (sending || !replyText.trim()) ? 0.5 : 1
            }]}
            onPress={handleSendReply}
            disabled={sending || !replyText.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme['color-shadcn-primary'], theme['color-primary-400']]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendButtonGradient}
            >
              <Icon 
                name={sending ? "activity" : "paper-plane"} 
                style={styles.sendIcon} 
                fill="#FFFFFF" 
              />
              <Text style={styles.sendButtonText}>
                {sending ? t('supportTickets.detail.sending') : t('supportTickets.detail.send')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    padding: 15,
  },
  ticketTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  ticketSubject: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  ticketMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  createdDate: {
    fontSize: 13,
  },
  ticketDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  conversationContainer: {
    flex: 1,
  },
  conversationContent: {
    padding: 16,
    paddingBottom: 20,
  },
  conversationTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageCard: {
    borderRadius: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  senderLabel: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  senderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  replyContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  replyInput: {
    flex: 1,
    borderRadius: 8,
  },
  replyTextStyle: {
    minHeight: 40,
    maxHeight: 80,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  sendButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 2,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  sendIcon: {
    width: 16,
    height: 16,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export { SupportTicketDetailScreen };
