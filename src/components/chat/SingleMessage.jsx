import {Layout, Text, useTheme} from '@ui-kitten/components';
import dayjs from 'dayjs';
import {StyleSheet} from 'react-native';
import {flexeStyles} from '../../utils/globalStyles';
import {ThemedIcon} from '../Icon';
import {useTheme as themeContextTheme} from '../../theme/ThemeContext';

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
  const {isDark} = themeContextTheme();

  return (
    <Layout
      style={[
        {marginVertical: 4, maxWidth: '80%', alignSelf: 'flex-start'},
        selfMessage && {marginLeft: 'auto'},
      ]}>
      <Layout
        style={[
          styles.messageBodyContainer,
          {
            backgroundColor: selfMessage
              ? isDark
                ? theme['color-primary-500']
                : theme['color-primary-500']
              : isDark
              ? theme['color-shadcn-card']
              : theme['color-basic-100'],
            borderColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
            borderWidth: 1,
          },
          selfMessage && {
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 0,
          },
          !selfMessage && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 10,
          },
        ]}>
        <Text
          style={[
            styles.messageText,
            {
              color: selfMessage
                ? '#FFFFFF'
                : isDark
                ? theme['color-shadcn-foreground']
                : theme['color-basic-900'],
            },
          ]}>
          {message}
        </Text>
      </Layout>
      <Layout style={[flexeStyles.row, flexeStyles.itemsCenter]}>
        <Text
          category="p2"
          style={{
            color: isDark
              ? theme['color-shadcn-muted-foreground']
              : theme['color-basic-600'],
          }}>
          {dayjs(messageDateTime).format('hh:mm A')}
        </Text>
        {selfMessage && (
          <ThemedIcon
            name={status === 'sent' ? 'checkmark-outline' : 'done-all-outline'}
            fill={
              status === 'read'
                ? theme['color-primary-500']
                : isDark
                ? theme['color-shadcn-muted-foreground']
                : theme['color-basic-600']
            }
            iconStyle={{width: 20, height: 20}}
          />
        )}
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  messageBodyContainer: {
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    padding: 8,
    marginBottom: 4,
  },
  messageText: {fontSize: 16, lineHeight: 24},
});
