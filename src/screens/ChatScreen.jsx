import {Icon, Input, Layout, Text} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {FlatList, StyleSheet, View, TouchableOpacity} from 'react-native';
import {useDispatch} from 'react-redux';
import {ConversationItem} from '../components/chat';
import {setActiveRoom} from '../store/chat';
import {setBottomTabBarVisibility} from '../store/configs';
import {spacingStyles} from '../utils/globalStyles';
import {useState} from 'react';
import { MainScreensHeader } from '../components/buyer';
import { useTheme } from '../theme/ThemeContext';

const chatList = [
  {
    id: 0,
    title: 'John Doe',
    imgUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    msgText: 'Lorem ipsum dolor sit amet.',
    attachmentType: 'image',
    lastUpdated: '2023-05-24T00:45:00Z',
    unreadMessages: 7,
  },
  {
    id: 1,
    name: 'Hamza Chohan',
    pet: 'Small Cute dark grey rabbit',
    status: 'available',
    lastMessage: 'Yes sir still available',
    avatar: require('../../assets/easypaisa-logo.png'),
    adStatus: 'active',
  },
  {
    id: 2,
    title: 'Michael Johnson',
    imgUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
    msgText: 'Sed do eiusmod tempor incididunt.',
    attachmentType: null,
    lastUpdated: '2023-05-21T11:15:00Z',
    unreadMessages: 10,
  },
  {
    id: 3,
    title: 'Emily Davis',
    imgUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
    msgText: null,
    attachmentType: 'video',
    lastUpdated: '2023-05-20T17:20:00Z',
    unreadMessages: 5,
  },
  {
    id: 4,
    title: 'David Wilson',
    imgUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
    msgText: 'Lorem ipsum dolor sit amet.',
    attachmentType: 'image',
    lastUpdated: '2023-05-19T09:10:00Z',
    unreadMessages: 0,
  },
  {
    id: 5,
    title: 'Olivia Anderson',
    imgUrl: 'https://randomuser.me/api/portraits/women/6.jpg',
    msgText: 'Consectetur adipiscing elit.',
    attachmentType: 'video',
    lastUpdated: '2023-05-18T12:35:00Z',
    unreadMessages: 8,
  },
  {
    id: 6,
    title: 'James Martinez',
    imgUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
    msgText: 'Sed do eiusmod tempor incididunt.',
    attachmentType: 'image',
    lastUpdated: '2023-05-17T16:55:00Z',
    unreadMessages: 0,
  },
  {
    id: 7,
    title: 'Sophia Thompson',
    imgUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
    msgText: 'Ut labore et dolore magna aliqua.',
    attachmentType: 'video',
    lastUpdated: '2023-05-16T13:40:00Z',
    unreadMessages: 0,
  },
  {
    id: 8,
    title: 'Daniel Davis',
    imgUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
    msgText: 'Lorem ipsum dolor sit amet.',
    attachmentType: 'image',
    lastUpdated: '2023-05-15T10:25:00Z',
    unreadMessages: 0,
  },
];

export const ChatScreen = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState('All');
  const tabs = ['All', 'Buying', 'Selling'];

  const renderIcon = props => <Icon {...props} name="search-outline" />;

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
    navigation.navigate('Messages');
  };

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
        <View 
          style={[
            styles.chipActive,
            { backgroundColor: theme['color-shadcn-primary'] }
          ]}
        >
          <Text style={[styles.chipTextActive, { color: theme['color-shadcn-primary-foreground'] }]}>
            All
          </Text>
        </View>
        <View 
          style={[
            styles.chip,
            { backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'] }
          ]}
        >
          <Text 
            style={[
              styles.chipText,
              { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }
            ]}
          >
            Unread Chats
          </Text>
        </View>
        <View 
          style={[
            styles.chip,
            { backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'] }
          ]}
        >
          <Text 
            style={[
              styles.chipText,
              { color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'] }
            ]}
          >
            Important
          </Text>
        </View>
      </View>
      <FlatList
        data={chatList}
        style={{marginTop: 10, marginHorizontal: 10}}
        contentContainerStyle={{paddingBottom: 90}}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <ConversationItem {...item} onViewRoomMessages={onGoToMessagesList} />
        )}
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
});
