import {Icon, Input, Layout, Text, useTheme} from '@ui-kitten/components';
import {useTranslation} from 'react-i18next';
import {FlatList, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {ConversationItem} from '../components/chat';
import {setActiveRoom} from '../store/chat';
import {setBottomTabBarVisibility} from '../store/configs';
import {spacingStyles} from '../utils/globalStyles';

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
    title: 'Jane Smith',
    imgUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
    msgText: 'Consectetur adipiscing elit.',
    attachmentType: 'video',
    lastUpdated: '2023-05-23T08:30:00Z',
    unreadMessages: 2,
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
  const theme = useTheme();
  const dispatch = useDispatch();

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
    <Layout level="3" style={{flex: 1}}>
      <Layout
        style={[
          styles.header,
          spacingStyles.px16,
          spacingStyles.py8,
          {
            backgroundColor: theme['color-primary-default'],
            shadowColor: theme['color-primary-default'],
          },
        ]}>
        <Text
          category="h4"
          style={{color: '#fff', marginBottom: 8, textAlign: 'left'}}>
          {t('inbox')}
        </Text>
        <Input
          value={''}
          placeholder={t('searchConversations')}
          style={{direction: i18n.dir()}}
          accessoryLeft={renderIcon}
        />
      </Layout>
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
});
