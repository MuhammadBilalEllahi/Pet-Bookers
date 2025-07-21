import {Layout, useTheme, Text, Card} from '@ui-kitten/components';
import {Dimensions, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {SwipeListView} from 'react-native-swipe-list-view';
import {ThemedIcon} from '../components/Icon';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import { useEffect } from 'react';
import { axiosBuyerClient } from '../utils/axiosClient';
import { useSelector, useDispatch } from 'react-redux';
import { setNotifications, removeNotification } from '../store/notifications';

const {width: windowWidth} = Dimensions.get('window');

export const NotificationsScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.notifications);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
      const response = await axiosBuyerClient.get('/notifications');
      console.log("notifications",response.data);
        // Map backend notifications to expected shape if needed
        const mapped = (response.data || []).map((notif, idx) => ({
          id: notif.id ?? idx,
          title: notif.title || 'Notification',
          description: notif.description || notif.body || '',
          timestamp: notif.created_at || notif.timestamp || new Date().toISOString(),
          isUnread: notif.is_unread ?? true,
          orderId: notif.order_id || '',
          notificationType: notif.notification_type || 'promotion',
        }));
        dispatch(setNotifications(mapped));
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchNotifications();
  }, [dispatch]);

  const {i18n} = useTranslation();
  const handleSwipeDeletion = swipeData => {
    const {key, value} = swipeData;
    if (i18n.dir() === 'rtl') {
      if (value === windowWidth) {
        dispatch(removeNotification(Number(key)));
      }
    } else {
      if (value === -windowWidth) {
        dispatch(removeNotification(Number(key)));
      }
    }
  };

  return (
    <Layout level="3" style={{flex: 1}}>
      {notifications.length === 0 ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text category="h6">No notifications yet</Text>
        </View>
      ) : (
      <SwipeListView
        data={notifications}
        renderItem={({item, index}, rowMap) => (
          <NotifItem
            notifData={item}
            handlePress={() => {}}
              _key={item.id}
          />
        )}
          keyExtractor={(item) => String(item.id)}
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
      )}
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
          <Text category="c1">{dayjs(notifData.timestamp).format('lll')}</Text>
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
