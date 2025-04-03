import {Avatar, Card, Text, useTheme} from '@ui-kitten/components';
import dayjs from 'dayjs';
import {StyleSheet, View} from 'react-native';
import {ThemedIcon} from '../Icon';
import {flexeStyles} from '../../utils/globalStyles';

export const ConversationItem = ({
  id,
  title,
  imgUrl,
  msgText,
  attachmentType,
  lastUpdated,
  unreadMessages,
  onViewRoomMessages,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={styles.card}
      onPress={() =>
        onViewRoomMessages({
          roomId: id,
          recipientProfile: imgUrl,
          recipientName: title,
        })
      }>
      <View style={flexeStyles.row}>
        <Avatar
          source={{
            uri: imgUrl,
          }}
          style={styles.avatar}
        />
        <View style={{flexGrow: 1}}>
          <View style={[styles.titleContainer, flexeStyles.row]}>
            <Text style={styles.title}>{title}</Text>
            <Text appearance="hint">{dayjs(lastUpdated).calendar()}</Text>
          </View>
          <View style={[styles.messageContainer, flexeStyles.row]}>
            <View style={[styles.messageInnerContainer, flexeStyles.row]}>
              {attachmentType && (
                <ThemedIcon
                  name={
                    attachmentType === 'image'
                      ? 'image-outline'
                      : 'film-outline'
                  }
                  iconStyle={styles.attachmentIcon}
                />
              )}
              {msgText && <Text style={{flexShrink: 1}}>{msgText}</Text>}
            </View>
            {unreadMessages > 0 && (
              <View
                style={[
                  styles.unreadCounter,
                  {backgroundColor: theme['color-primary-default']},
                ]}>
                <Text style={styles.unreadNumber}>{unreadMessages}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {padding: 10},
  avatar: {width: 60, height: 60, marginRight: 10},
  titleContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexGrow: 1,
  },
  title: {fontSize: 18, fontWeight: '700', marginRight: 4},
  messageContainer: {
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  messageInnerContainer: {
    flex: 1,
    flexGrow: 1,
  },
  attachmentIcon: {marginRight: 2, width: 18, height: 18},
  unreadCounter: {
    width: 24,
    height: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 10,
  },
  unreadNumber: {color: '#fff', fontSize: 12, fontWeight: '700'},
});
