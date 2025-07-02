import {Icon, Input, Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {FlatList, StyleSheet, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useDispatch} from 'react-redux';
import {ConversationItem} from '../components/chat';
import {setActiveRoom} from '../store/chat';
import {setBottomTabBarVisibility} from '../store/configs';
import {spacingStyles} from '../utils/globalStyles';
import {useEffect, useState, useMemo} from 'react';
import { MainScreensHeader } from '../components/buyer';
import { useTheme } from '../theme/ThemeContext';
import { axiosBuyerClient, axiosSellerClient } from '../utils/axiosClient';
import { selectBaseUrls } from '../store/configs';
import { useSelector } from 'react-redux';
import { UserType } from '../store/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ChatScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const baseUrls = useSelector(selectBaseUrls);
  const [selectedTab, setSelectedTab] = useState('All');
  const [selectedChip, setSelectedChip] = useState('All');
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['All', 'Buying', 'Selling'];
  const chips = ['All', 'Unread Chats', 'Important'];

  const renderIcon = props => <Icon {...props} name="search-outline" />;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        
        setLoading(true);
        let response = null;
        const userType = await AsyncStorage.getItem('user-type');
        console.log('userType in [ChatScreen]', userType);
        if(UserType.BUYER.toString().toLowerCase() === userType.toString().toLowerCase()){
           response = await axiosBuyerClient.get('customer/chat/list/seller?limit=100&offset=0');
        }else{
           response = await axiosSellerClient.get('messages/list/seller?limit=100&offset=0');
        }
        if(!response){
          return;
        }
        console.log('response in [ChatScreen]', JSON.stringify(response.data, null, 2));
        if (response.data && response.data.chat) {
          const formattedChats = response.data.chat.map(chat => {
            // Determine if message was sent by us (seller)
            const isSentByUs = chat.sent_by_seller === 1;
            // Determine if message is seen by recipient (for sent messages) or by us (for received messages)
            const isSeen = isSentByUs ? chat.seen_by_customer === 1 : chat.seen_by_seller === 1;
            
            return {
              id: chat.id,
              title: chat?.customer ? `${chat?.customer?.f_name} ${chat?.customer?.l_name}` : 'Unknown User',
              imgUrl: chat?.customer?.image === 'def.png' 
                ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
                : chat?.customer?.image 
                  ? `https://petbookers.com.pk/storage/app/public/profile/${chat?.customer?.image}`
                  : 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png',
              msgText: chat.message,
              lastUpdated: chat.updated_at,
              unreadMessages: chat.seen_by_seller ? 0 : 1,
              customerId: chat?.customer?.id,
              customerName: chat?.customer ? `${chat?.customer?.f_name} ${chat?.customer?.l_name}` : 'Unknown User',
              customerImage: chat?.customer?.image === 'def.png' 
                ? 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png'
                : chat?.customer?.image 
                  ? `https://petbookers.com.pk/storage/app/public/profile/${chat?.customer?.image}`
                  : 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png',
              isImportant: false,
              type: chat.product_id ? 'Buying' : 'Selling',
              messageStatus: {
                isSentByUs,
                isSeen,
                timestamp: chat.updated_at
              }
            };
          });
          setChatList(formattedChats);
        }
      } catch (error) { 
        console.error('Error fetching messages:', error, error?.response?.data, error?.response?.status, error?.response);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const filteredChats = useMemo(() => {
    return chatList.filter(chat => {
      // Tab filtering
      if (selectedTab !== 'All' && chat.type !== selectedTab) {
        return false;
      }
      
      // Chip filtering
      if (selectedChip === 'Unread Chats' && chat.unreadMessages === 0) {
        return false;
      }
      if (selectedChip === 'Important' && !chat.isImportant) {
        return false;
      }
      
      return true;
    });
  }, [chatList, selectedTab, selectedChip]);

  const onGoToMessagesList = ({roomId, recipientProfile, recipientName}) => {
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
      roomId: roomId,
      recipientProfile: recipientProfile,
      recipientName: recipientName
    });
  };

  if (loading) {
    return (
      <Layout level="3" style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
        <ActivityIndicator size="large" color={theme['color-shadcn-primary']} />
      </Layout>
    );
  }

  return (
    <Layout level="3" style={{flex: 1, backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']}}>
      <MainScreensHeader navigation={navigation} hideSearch={true}/>
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tab, selectedTab === tab && styles.tabActive]}
          >
            <Text 
              style={[
                styles.tabText, 
                { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] },
                selectedTab === tab && { color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'] }
              ]}
            >
              {tab}
            </Text>
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
              roomId: item.id,
              recipientProfile: item.imgUrl,
              recipientName: item.title
            })} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }]}>
              No chats found
            </Text>
          </View>
        }
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
  tabText: {
    fontWeight: 'bold',
    fontSize: 16,
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
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
