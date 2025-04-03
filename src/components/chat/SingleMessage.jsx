import {Layout, Text, useTheme} from '@ui-kitten/components';
import dayjs from 'dayjs';
import {StyleSheet} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';

export const SingleMessage = ({
  id,
  message,
  selfMessage,
  messageDateTime,
  status,
  attachmentType,
  attachment,
}) => {
  const theme = useTheme();
  return (
    <Layout
      style={[
        {marginVertical: 4, maxWidth: '80%', alignSelf: 'flex-start'},
        selfMessage && {marginLeft: 'auto'},
      ]}>
      <Layout
        style={[
          styles.messageBodyContainer,
          selfMessage && {
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 0,
            backgroundColor: theme['color-primary-default'],
          },
        ]}>
        <Text style={[styles.messageText, selfMessage && styles.textWhite]}>
          {message}
        </Text>
      </Layout>
      <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
        <Text category="p2">{dayjs(messageDateTime).format('hh:mm A')}</Text>
        {selfMessage && (
          <ThemedIcon
            name={status === 'sent' ? 'checkmark-outline' : 'done-all-outline'}
            fill={status === 'read' && theme['color-primary-default']}
            iconStyle={{width: 20, height: 20}}
          />
        )}
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  messageBodyContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    padding: 8,
    marginBottom: 4,
  },
  otherMessage: {},
  selfMessage: {},
  messageText: {fontSize: 16, lineHeight: 24},
  textWhite: {
    color: '#fff',
  },
});
