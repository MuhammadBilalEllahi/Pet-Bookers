import React from 'react';
import {Icon, Input, Layout, Text, Button} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {FlatList, StyleSheet, View, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {ConversationItem} from '../components/chat';
import {setActiveRoom} from '../store/chat';
import {setBottomTabBarVisibility} from '../store/configs';
import {spacingStyles} from '../utils/globalStyles';
import {useEffect, useState, useMemo} from 'react';
import { MainScreensHeader } from '../components/buyer';
import { useTheme } from '../theme/ThemeContext';
import { selectBaseUrls } from '../store/configs';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated,
  selectSellerId,
  selectCustomerId 
} from '../store/user';
import { smartBuyerClient, smartSellerClient, setAuthModalHandlers } from '../utils/authAxiosClient';
import { BuyerAuthModal, SellerAuthModal } from '../components/modals';

export const ChatScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const baseUrls = useSelector(selectBaseUrls);
  
  // Authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const currentSellerId = useSelector(selectSellerId);
  const currentCustomerId = useSelector(selectCustomerId);
  
  const [selectedTab, setSelectedTab] = useState(t('chatScreen.tabs.all'));
  const [selectedChip, setSelectedChip] = useState(t('chatScreen.chips.all'));
  const [buyerChatList, setBuyerChatList] = useState([]);
  const [sellerChatList, setSellerChatList] = useState([]);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [showBuyerAuthModal, setShowBuyerAuthModal] = useState(false);
  const [showSellerAuthModal, setShowSellerAuthModal] = useState(false);
  
  const tabs = [t('chatScreen.tabs.all'), t('chatScreen.tabs.buying'), t('chatScreen.tabs.selling')];
  const chips = [t('chatScreen.chips.all'), t('chatScreen.chips.unreadChats'), t('chatScreen.chips.important')];

  const renderIcon = (props) => <Icon {...props} name="search-outline" />;

  // Set up auth modal handlers
  useEffect(() => {
    setAuthModalHandlers({
      showBuyerAuthModal: () => setShowBuyerAuthModal(true),
      showSellerAuthModal: () => setShowSellerAuthModal(true),
    });
  }, []);

  // Ensure bottom tab bar is visible when ChatScreen is focused
  useEffect(() => {
    dispatch(setBottomTabBarVisibility(true));
  }, [dispatch]);

  const fetchBuyerChats = async () => {
    if (!isBuyerAuthenticated) {
      setBuyerChatList([]);
          return;
        }

    try {
      setBuyerLoading(true);
      const response = await smartBuyerClient.get('customer/chat/list/seller?limit=100&offset=0');
      
      // console.log('Buyer chat response:', JSON.stringify(response.data, null, 2));
      
        if (response.data && response.data.chat) {
          const formattedChats = response.data.chat.map(chat => {
          const isSentByUs = chat.sent_by_customer === 1;
          const isSeen = isSentByUs ? chat.seen_by_seller === 1 : chat.seen_by_customer === 1;
          
          // Get seller info (from seller_info field in buyer chat response)
          const seller = chat?.seller_info;
          const shopName = seller?.shops?.[0]?.name || t('common.shop');
          const isOwnAccount = currentSellerId && seller?.id === currentSellerId;
          
          let sellerName;
          let subtitle = null;
          
          if (isOwnAccount) {
            // If it's the user's own seller account
            if (seller?.f_name && seller?.l_name) {
              sellerName = `${seller.f_name} ${seller.l_name} (${t('common.you')})`;
              subtitle = shopName;
            } else {
              sellerName = `${shopName} (${t('common.you')})`;
            }
          } else {
            // If it's another seller
            sellerName = seller?.f_name && seller?.l_name 
              ? `${seller.f_name} ${seller.l_name}` 
              : shopName; // Fallback to shop name if no seller name
            subtitle = seller?.f_name && seller?.l_name ? shopName : null;
          }
            
            return {
            id: `buyer_${chat.id}`,
            originalId: chat.id,
            title: sellerName,
            subtitle: subtitle,
            imgUrl: seller?.image === 'def.png' 
                ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
              : seller?.image 
                ? `https://petbookers.com.pk/storage/app/public/seller/${seller.image}`
                  : 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png',
              msgText: chat.message,
              lastUpdated: chat.updated_at,
            unreadMessages: chat.seen_by_customer === 0 ? 1 : 0, // Fix: 0 means unseen, 1 means seen
            recipientId: seller?.id,
            recipientName: sellerName,
            recipientImage: seller?.image === 'def.png' 
                ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
              : seller?.image 
                ? `https://petbookers.com.pk/storage/app/public/seller/${seller.image}`
                  : 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png',
              isImportant: false,
            type: t('common.buying'),
            chatType: 'buyer',
              messageStatus: {
                isSentByUs,
                isSeen,
                timestamp: chat.updated_at
              }
            };
          });
        setBuyerChatList(formattedChats);
        }
      } catch (error) { 
      console.error('Error fetching buyer chats:', error);
      setBuyerChatList([]);
      } finally {
      setBuyerLoading(false);
    }
  };

  const fetchSellerChats = async () => {
    if (!isSellerAuthenticated) {
      setSellerChatList([]);
      return;
    }

    try {
      setSellerLoading(true);
      const response = await smartSellerClient.get('messages/list/customer?limit=100&offset=0');
      
      // console.log('Seller chat response:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.chat) {
        const formattedChats = response.data.chat.map(chat => {
          const isSentByUs = chat.sent_by_seller === 1;
          const isSeen = isSentByUs ? chat.seen_by_customer === 1 : chat.seen_by_seller === 1;
          
          // Get customer info (some chats might have null customer)
          const customer = chat?.customer;
          const isOwnBuyerAccount = currentCustomerId && (customer?.id === currentCustomerId || chat.user_id === currentCustomerId);
          
          let customerName;
          if (customer) {
            const baseName = `${customer.f_name} ${customer.l_name}`.trim() || customer.name || t('common.customer');
            customerName = isOwnBuyerAccount ? `${baseName} (${t('common.you')})` : baseName;
          } else {
            // For null customer, check if user_id matches current customer ID
            customerName = isOwnBuyerAccount ? t('common.you') : t('common.unknownCustomer');
          }
          
          return {
            id: `seller_${chat.id}`,
            originalId: chat.id,
            title: customerName,
            imgUrl: customer?.image === 'def.png' || !customer?.image
              ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
              : `https://petbookers.com.pk/storage/app/public/profile/${customer.image}`,
            msgText: chat.message,
            lastUpdated: chat.updated_at,
            unreadMessages: chat.seen_by_seller === 0 ? 1 : 0, // Fix: 0 means unseen, 1 means seen
            recipientId: customer?.id || chat.user_id, // Fallback to user_id if customer is null
            recipientName: customerName,
            recipientImage: customer?.image === 'def.png' || !customer?.image
              ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
              : `https://petbookers.com.pk/storage/app/public/profile/${customer.image}`,
            isImportant: false,
            type: t('common.selling'),
            chatType: 'seller',
            messageStatus: {
              isSentByUs,
              isSeen,
              timestamp: chat.updated_at
            }
          };
        });
        setSellerChatList(formattedChats);
      }
    } catch (error) {
      console.error('Error fetching seller chats:', error);
      setSellerChatList([]);
    } finally {
      setSellerLoading(false);
    }
  };

  // Combined chat list for "All" tab
  const allChats = useMemo(() => {
    const combined = [...buyerChatList, ...sellerChatList];
    // Sort by last updated time
    return combined.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  }, [buyerChatList, sellerChatList]);

  const filteredChats = useMemo(() => {
    let chatList = [];
    
    switch (selectedTab) {
      case t('chatScreen.tabs.all'):
        chatList = allChats;
        break;
      case t('chatScreen.tabs.buying'):
        chatList = buyerChatList;
        break;
      case t('chatScreen.tabs.selling'):
        chatList = sellerChatList;
        break;
      default:
        chatList = allChats;
    }

    return chatList.filter(chat => {
      // Chip filtering
      if (selectedChip === t('chatScreen.chips.unreadChats') && chat.unreadMessages === 0) {
        return false;
      }
      if (selectedChip === t('chatScreen.chips.important') && !chat.isImportant) {
        return false;
      }
      
      return true;
    });
  }, [allChats, buyerChatList, sellerChatList, selectedTab, selectedChip]);

  const handleTabPress = (tab) => {
    if (tab === t('chatScreen.tabs.buying') && !isBuyerAuthenticated) {
      const message = isSellerAuthenticated 
        ? t('chatScreen.authRequired.buyerMessageSeller')
        : t('chatScreen.authRequired.buyerMessage');
      
      Alert.alert(
        t('chatScreen.authRequired.buyerTitle'),
        message,
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('chatScreen.authRequired.signInAsBuyer'), onPress: () => setShowBuyerAuthModal(true) }
        ]
      );
      return;
    }
    
    if (tab === t('chatScreen.tabs.selling') && !isSellerAuthenticated) {
      const message = isBuyerAuthenticated 
        ? t('chatScreen.authRequired.sellerMessageBuyer')
        : t('chatScreen.authRequired.sellerMessage');
      
      Alert.alert(
        t('chatScreen.authRequired.sellerTitle'),
        message,
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('chatScreen.authRequired.signInAsSeller'), onPress: () => setShowSellerAuthModal(true) }
        ]
      );
      return;
    }
    
    setSelectedTab(tab);
  };

  const handleBuyerAuthSuccess = () => {
    setShowBuyerAuthModal(false);
    setSelectedTab(t('chatScreen.tabs.buying'));
    fetchBuyerChats();
  };

  const handleSellerAuthSuccess = () => {
    setShowSellerAuthModal(false);
    setSelectedTab(t('chatScreen.tabs.selling'));
    fetchSellerChats();
  };

  // Fetch chats when authentication state changes
  useEffect(() => {
    if (isBuyerAuthenticated) {
      fetchBuyerChats();
    } else {
      setBuyerChatList([]);
    }
  }, [isBuyerAuthenticated]);

  useEffect(() => {
    if (isSellerAuthenticated) {
      fetchSellerChats();
    } else {
      setSellerChatList([]);
    }
  }, [isSellerAuthenticated]);

  const onGoToMessagesList = ({roomId, recipientProfile, recipientName, chatType}) => {
    dispatch(setBottomTabBarVisibility(false));
    dispatch(
      setActiveRoom({
        roomId,
        recipient: {
          name: recipientName,
          profile: recipientProfile,
        },
      }),
    );
    navigation.navigate('Messages', {
      roomId: roomId, // For buyer: seller_id, For seller: customer/user_id
      recipientProfile: recipientProfile,
      recipientName: recipientName,
      chatType: chatType // Pass chat type to Messages screen
    });
  };

  const renderAuthPrompt = (type) => (
    <View style={styles.authPromptContainer}>
      <Icon
        name="message-circle-outline"
        style={[styles.authPromptIcon, { 
          fill: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400'] 
        }]}
      />
      <Text style={[styles.authPromptTitle, {
        color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
      }]}>
        {type === 'buyer' ? t('chatScreen.authPrompt.buyerTitle') : t('chatScreen.authPrompt.sellerTitle')}
      </Text>
      <Text style={[styles.authPromptText, {
        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
      }]}>
        {type === 'buyer' 
          ? t('chatScreen.authPrompt.buyerMessage')
          : t('chatScreen.authPrompt.sellerMessage')
        }
      </Text>
      <Button
        style={styles.authPromptButton}
        onPress={() => type === 'buyer' ? setShowBuyerAuthModal(true) : setShowSellerAuthModal(true)}
      >
        {type === 'buyer' ? t('chatScreen.authPrompt.buyerTitle') : t('chatScreen.authPrompt.sellerTitle')}
      </Button>
    </View>
  );

  const isLoading = buyerLoading || sellerLoading;

  const renderEmptyState = () => {
    if (selectedTab === t('chatScreen.tabs.buying') && !isBuyerAuthenticated) {
      return renderAuthPrompt('buyer');
    }
    
    if (selectedTab === t('chatScreen.tabs.selling') && !isSellerAuthenticated) {
      return renderAuthPrompt('seller');
    }
    
    if (selectedTab === t('chatScreen.tabs.all') && !isBuyerAuthenticated && !isSellerAuthenticated) {
      return (
        <View style={styles.authPromptContainer}>
          <Icon
            name="message-circle-outline"
            style={[styles.authPromptIcon, { 
              fill: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400'] 
            }]}
          />
          <Text style={[styles.authPromptTitle, {
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
          }]}>
            {t('chatScreen.emptyState.signInToViewChats')}
          </Text>
          <Text style={[styles.authPromptText, {
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
          }]}>
            {t('chatScreen.emptyState.signInMessage')}
          </Text>
          <View style={styles.authButtonsColumn}>
            <Button
              style={[styles.authPromptButton, { marginBottom: 12 }]}
              onPress={() => setShowBuyerAuthModal(true)}
            >
              {t('chatScreen.authRequired.signInAsBuyer')}
            </Button>
            <Button
              style={styles.authPromptButton}
              appearance="outline"
              onPress={() => setShowSellerAuthModal(true)}
            >
              {t('chatScreen.authRequired.signInAsSeller')}
            </Button>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="message-circle-outline"
          style={[styles.emptyIcon, { 
            fill: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400'] 
          }]}
        />
        <Text style={[styles.emptyText, { 
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] 
        }]}>
          {t('chatScreen.emptyState.noChatsFound')}
        </Text>
        {selectedTab === t('chatScreen.tabs.all') && (
          <Text style={[styles.emptySubText, { 
            color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] 
          }]}>
            {t('chatScreen.emptyState.startConversation')}
          </Text>
        )}
      </View>
    );
  };

  if (isLoading && allChats.length === 0) {
    return (
      <Layout level="3" style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
        <ActivityIndicator size="large" color={theme['color-shadcn-primary']} />
        <Text style={[styles.loadingText, {
          color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
          marginTop: 16
        }]}>
          {t('chats.loadingChats')}
        </Text>
      </Layout>
    );
  }

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
      <MainScreensHeader navigation={navigation} hideSearch={true}/>
      
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
          >
            <View style={styles.tabContent}>
            <Text 
              style={[
                styles.tabText, 
                { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] },
                selectedTab === tab && { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }
              ]}
            >
              {tab}
            </Text>
              {/* Show badge for tabs that require authentication */}
              {((tab === t('chatScreen.tabs.buying') && !isBuyerAuthenticated) || (tab === t('chatScreen.tabs.selling') && !isSellerAuthenticated)) && (
                <Icon
                  name="lock-outline"
                  style={[styles.lockIcon, { 
                    fill: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-400'] 
                  }]}
                />
              )}
              {/* Show unread count */}
              {tab === t('chatScreen.tabs.buying') && buyerChatList.some(chat => chat.unreadMessages > 0) && (
                <View style={[styles.unreadBadge, { backgroundColor: theme['color-danger-default'] }]}>
                  <Text style={styles.unreadBadgeText}>
                    {buyerChatList.filter(chat => chat.unreadMessages > 0).length}
                  </Text>
                </View>
              )}
              {tab === t('chatScreen.tabs.selling') && sellerChatList.some(chat => chat.unreadMessages > 0) && (
                <View style={[styles.unreadBadge, { backgroundColor: theme['color-danger-default'] }]}>
                  <Text style={styles.unreadBadgeText}>
                    {sellerChatList.filter(chat => chat.unreadMessages > 0).length}
                  </Text>
                </View>
              )}
              {tab === t('chatScreen.tabs.all') && allChats.some(chat => chat.unreadMessages > 0) && (
                <View style={[styles.unreadBadge, { backgroundColor: theme['color-danger-default'] }]}>
                  <Text style={styles.unreadBadgeText}>
                    {allChats.filter(chat => chat.unreadMessages > 0).length}
                  </Text>
                </View>
              )}
            </View>
            {selectedTab === tab && (
              <View 
                style={[
                  styles.tabUnderline,
                  { backgroundColor: theme['color-shadcn-primary'] }
                ]} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Chip Row */}
      <View style={styles.chipRow}>
        {chips.map(chip => (
          <TouchableOpacity
            key={chip}
            onPress={() => setSelectedChip(chip)}
          >
            <View 
              style={[
                selectedChip === chip ? styles.chipActive : styles.chip,
                { 
                  backgroundColor: selectedChip === chip 
                    ? theme['color-shadcn-primary']
                    : isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200']
                }
              ]}
            >
              <Text 
                style={[
                  selectedChip === chip ? styles.chipTextActive : styles.chipText,
                  { 
                    color: selectedChip === chip 
                      ? theme['color-shadcn-primary-foreground']
                      : isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }
                ]}
              >
                {chip}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Chat List */}
      <FlatList
        data={filteredChats}
        style={{marginTop: 10, marginHorizontal: 10}}
        contentContainerStyle={{paddingBottom: 90}}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ConversationItem 
            {...item} 
            onViewRoomMessages={() => onGoToMessagesList({
              roomId: item.recipientId, // Use recipientId: for buyer=seller_id, for seller=customer_id
              recipientProfile: item.imgUrl,
              recipientName: item.title,
              chatType: item.chatType
            })} 
          />
        )}
        ListEmptyComponent={renderEmptyState()}
        refreshing={isLoading}
        onRefresh={() => {
          if (isBuyerAuthenticated) fetchBuyerChats();
          if (isSellerAuthenticated) fetchSellerChats();
        }}
      />
      
      {/* Authentication Modals */}
      <BuyerAuthModal
        visible={showBuyerAuthModal}
        onClose={() => setShowBuyerAuthModal(false)}
        onSuccess={handleBuyerAuthSuccess}
        title={t('chatScreen.authRequired.signInAsBuyer')}
      />
      
      <SellerAuthModal
        visible={showSellerAuthModal}
        onClose={() => setShowSellerAuthModal(false)}
        onSuccess={handleSellerAuthSuccess}
        title={t('chatScreen.authRequired.signInAsSeller')}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tabBar: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabActive: {},
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lockIcon: {
    width: 12,
    height: 12,
    marginLeft: 4,
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabUnderline: {
    height: 3,
    width: '100%',
    marginTop: 4,
    borderRadius: 2,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 5,
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  chipActive: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  chipText: {
    fontWeight: 'bold',
  },
  chipTextActive: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  authPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  authPromptIcon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  authPromptTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  authPromptText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  authPromptButton: {
    minWidth: 200,
  },
  authButtonsColumn: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
