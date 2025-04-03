import {Layout, useTheme, Text, Card} from '@ui-kitten/components';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {SwipeListView} from 'react-native-swipe-list-view';
import {ThemedIcon} from '../components/Icon';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';

const {width: windowWidth} = Dimensions.get('window');

const notifications = [
  {
    id: 0,
    title: 'New Message',
    description: 'You have received a new message from John Doe.',
    timestamp: '2023-05-23T08:30:00Z',
    isUnread: true,
    orderId: 'c971d46e-24a8-4c8f-bb8a-69e0f714c5db',
    notificationType: 'order',
  },
  {
    id: 1,
    title: 'New Friend Request',
    description: 'Jane Smith sent you a friend request.',
    timestamp: '2023-05-22T14:45:00Z',
    isUnread: false,
    orderId: '',
    notificationType: 'promotion',
  },
  {
    id: 2,
    title: 'New Comment',
    description: 'Michael Johnson commented on your post.',
    timestamp: '2023-05-21T11:15:00Z',
    isUnread: true,
    orderId: '',
    notificationType: 'promotion',
  },
  {
    id: 3,
    title: 'New Notification',
    description: 'You have a new notification.',
    timestamp: '2023-05-20T17:20:00Z',
    isUnread: false,
    orderId: '',
    notificationType: 'promotion',
  },
  {
    id: 4,
    title: 'New Like',
    description: 'David Wilson liked your photo.',
    timestamp: '2023-05-19T09:10:00Z',
    isUnread: true,
    orderId: '',
    notificationType: 'promotion',
  },
  {
    id: 5,
    title: 'New Event Invitation',
    description: 'You have been invited to an event by Olivia Anderson.',
    timestamp: '2023-05-18T12:35:00Z',
    isUnread: false,
    orderId: '',
    notificationType: 'promotion',
  },
  {
    id: 6,
    title: 'New Message',
    description: 'James Martinez sent you a new message.',
    timestamp: '2023-05-17T16:55:00Z',
    isUnread: true,
    orderId: 'f3e9c7d4-5630-4a1b-af02-86d5b1c16e9d',
    notificationType: 'order',
  },
  {
    id: 7,
    title: 'New Friend Request',
    description: 'Sophia Thompson sent you a friend request.',
    timestamp: '2023-05-16T13:40:00Z',
    isUnread: false,
    orderId: '',
    notificationType: 'order',
  },
  {
    id: 8,
    title: 'New Comment',
    description: 'Daniel Davis commented on your post.',
    timestamp: '2023-05-15T10:25:00Z',
    isUnread: true,
    orderId: '',
    notificationType: 'order',
  },
  {
    id: 9,
    title: 'New Notification',
    description: 'You have a new notification.',
    timestamp: '2023-05-14T15:50:00Z',
    isUnread: false,
    orderId: '',
    notificationType: 'promotion',
  },
];

export const NotificationsScreen = ({navigation}) => {
  const {i18n} = useTranslation();
  const handleSwipeDeletion = swipeData => {
    const {key, value} = swipeData;
    if (i18n.dir() === 'rtl') {
      if (value === windowWidth) {
        // dispatch(removeNotification(key));
      }
    } else {
      if (value === -windowWidth) {
        // dispatch(removeNotification(key));
      }
    }
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      <SwipeListView
        data={notifications}
        renderItem={({item, index}, rowMap) => (
          <NotifItem
            notifData={item}
            handlePress={() => {}}
            _key={`${item.time}_${index.toString()}`}
          />
        )}
        keyExtractor={(item, index) => `${item.time}_${index.toString()}`}
        contentContainerStyle={[
          spacingStyles.p16,
          {
            paddingBottom: 90,
          },
        ]}
        swipeRowStyle={{marginVertical: 4}}
        disableRightSwipe={i18n.dir() === 'ltr'}
        disableLeftSwipe={i18n.dir() === 'rtl'}
        recalculateHiddenLayout={true}
        renderHiddenItem={(data, rowMap) => <RowBackButton />}
        rightOpenValue={-windowWidth}
        leftOpenValue={windowWidth}
        onSwipeValueChange={handleSwipeDeletion}
      />
    </Layout>
  );
};

const NotifItem = ({notifData, handlePress, _key}) => {
  const theme = useTheme();

  return (
    <Card
      style={styles.container}
      onPress={() => handlePress(notifData.orderId, _key, notifData.isUnread)}>
      <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
        <ThemedIcon
          name={
            notifData.notificationType === 'order'
              ? 'cube-outline'
              : 'bell-outline'
          }
          iconStyle={{marginRight: 10}}
        />
        <Layout style={{alignItems: 'flex-start'}}>
          <Text category="c1">{dayjs(notifData.time).format('lll')}</Text>
          <Text style={{marginVertical: 4, fontWeight: '500', fontSize: 18}}>
            {notifData.title}
          </Text>
          <Text style={{fontSize: 15}}>{notifData.description}</Text>
        </Layout>
      </Layout>
      {notifData.isUnread && (
        <View
          style={{
            ...styles.unread,
            backgroundColor: theme['text-primary-color'],
          }}
        />
      )}
    </Card>
  );
};

const RowBackButton = () => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.rowBack,
        flexeStyles.row,
        flexeStyles.itemsCenter,
        flexeStyles.contentBetween,
        {backgroundColor: theme['color-danger-600']},
      ]}>
      <View style={styles.backRightBtn}>
        <ThemedIcon name="trash-2" fill="#FFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  unread: {
    width: 10,
    height: 10,
    borderRadius: 10,
    position: 'absolute',
    right: 0,
    top: 20,
  },
  rowBack: {
    flex: 1,
    marginVertical: 4,
  },
  backRightBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 75,
  },
});
