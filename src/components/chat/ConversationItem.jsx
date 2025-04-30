import {Avatar, Card, Text, useTheme} from '@ui-kitten/components';
import {StyleSheet, View, Image} from 'react-native';
import {ThemedIcon} from '../Icon';
import {flexeStyles} from '../../utils/globalStyles';

export const ConversationItem = (props) => {
  const theme = useTheme();
  // Support both old and new data structures
  const {
    id,
    name,
    pet,
    status,
    lastMessage,
    avatar,
    adStatus,
    // fallback for old structure
    title,
    imgUrl,
    msgText,
    attachmentType,
    lastUpdated,
    unreadMessages,
    onViewRoomMessages,
  } = props;

  // If new structure (name exists), use new UI
  if (name) {
    return (
      <View style={styles.chatItem}>
        {avatar ? (
          <Image source={avatar} style={styles.avatar} />
        ) : (
          <Avatar source={{ uri: imgUrl }} style={styles.avatar} />
        )}
        <View style={styles.chatInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.pet}>{pet}</Text>
          <Text style={status === 'available' ? styles.available : styles.inactive}>
            {lastMessage}
          </Text>
          {adStatus === 'inactive' && <Text style={styles.adInactive}>Ad Inactive</Text>}
        </View>
      </View>
    );
  }

  // Fallback to old UI for old data
  return (
    <Card
      style={styles.card}
      onPress={() =>
        onViewRoomMessages &&
        onViewRoomMessages({
          roomId: id,
          recipientProfile: imgUrl,
          recipientName: title,
        })
      }>
      <View style={{ flexDirection: 'row' }}>
        <Avatar
          source={{ uri: imgUrl }}
          style={styles.avatar}
        />
        <View style={{ flexGrow: 1 }}>
          <View style={[styles.titleContainer, { flexDirection: 'row' }]}>
            <Text style={styles.title}>{title}</Text>
            {/* Optionally show lastUpdated here */}
          </View>
          <View style={[styles.messageContainer, { flexDirection: 'row' }]}>
            <View style={[styles.messageInnerContainer, { flexDirection: 'row' }]}>
              {attachmentType && (
                <Text style={{ marginRight: 4 }}>[{attachmentType}]</Text>
              )}
              {msgText && <Text style={{ flexShrink: 1 }}>{msgText}</Text>}
            </View>
            {unreadMessages > 0 && (
              <View
                style={[
                  styles.unreadCounter,
                  { backgroundColor: theme['color-primary-default'] },
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
  card: { padding: 10 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    color: '#27AE60',
    fontSize: 16,
  },
  pet: {
    color: '#222',
    fontSize: 14,
  },
  available: {
    color: '#27AE60',
    fontSize: 13,
  },
  inactive: {
    color: '#888',
    fontSize: 13,
  },
  adInactive: {
    color: '#3498db',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Old styles for fallback
  titleContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    flexGrow: 1,
  },
  title: { fontSize: 18, fontWeight: '700', marginRight: 4 },
  messageContainer: {
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  messageInnerContainer: {
    flex: 1,
    flexGrow: 1,
  },
  unreadCounter: {
    width: 24,
    height: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 10,
  },
  unreadNumber: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
    color: '#888',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#000',
  },
  tabUnderline: {
    height: 3,
    backgroundColor: '#000',
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
    backgroundColor: '#eee',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  chipText: {
    color: '#888',
    fontWeight: 'bold',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
