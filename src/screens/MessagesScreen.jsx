import {Avatar, Input, Layout, Text} from '@ui-kitten/components';
import {StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {useDispatch} from 'react-redux';
import {BackButton} from '../components/BackButton';
import {MessagesList} from '../components/chat';
import {ThemedIcon} from '../components/Icon';
import {setBottomTabBarVisibility} from '../store/configs';
import {resetActiveRoom} from '../store/chat';
import {flexeStyles, spacingStyles} from '../utils/globalStyles';
import {useTheme} from '../theme/ThemeContext';

const messagesList = [
  {
    id: 12,
    message: 'We should plan to watch it together sometime.',
    selfMessage: false,
    messageDateTime: '2023-05-24T19:40:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 11,
    message: "Not yet, but I heard it's really good.",
    selfMessage: true,
    messageDateTime: '2023-05-24T09:39:00',
    status: 'delivered',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 10,
    message: 'Hey, did you watch that new movie yet?',
    selfMessage: false,
    messageDateTime: '2023-05-24T09:38:00',
    status: 'sent',
    attachmentType: 'video',
    attachment: 'test video',
  },
  {
    id: 9,
    message: "Sure, I'll keep you updated. Have a great evening!",
    selfMessage: true,
    messageDateTime: '2023-05-24T09:37:00',
    status: 'read',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 8,
    message: 'Sounds like a plan. Let me know how it goes.',
    selfMessage: false,
    messageDateTime: '2023-05-24T09:36:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 7,
    message: 'I might go out for dinner with friends. Enjoy the movie!',
    selfMessage: true,
    messageDateTime: '2023-05-24T09:35:00',
    status: 'delivered',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 6,
    message: 'Not really. Just thinking of catching a movie. How about you?',
    selfMessage: false,
    messageDateTime: '2023-05-24T09:34:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 5,
    message: "That's awesome. Any plans for the evening?",
    selfMessage: true,
    messageDateTime: '2023-05-24T09:33:00',
    status: 'read',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 4,
    message: "I'm good too. Just finished work for the day.",
    selfMessage: false,
    messageDateTime: '2023-05-24T09:32:00',
    status: 'read',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 3,
    message: "Hi John! I'm doing great. How about you?",
    selfMessage: true,
    messageDateTime: '2023-05-24T09:31:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 2,
    message: "Hey, how's it going?",
    selfMessage: false,
    messageDateTime: '2023-05-24T09:39:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
  {
    id: 1,
    message: "Hey, how's it going?",
    selfMessage: false,
    messageDateTime: '2023-05-20T09:30:00',
    status: 'sent',
    attachmentType: null,
    attachment: null,
  },
];

export const MessagesScreen = ({navigation}) => {
  const {theme, isDark} = useTheme();
  const dispatch = useDispatch();

  const renderSendIcon = props => (
    <TouchableWithoutFeedback onPress={() => {}}>
      <ThemedIcon
        {...props}
        name="paper-plane-outline"
        fill={theme['color-shadcn-primary']}
      />
    </TouchableWithoutFeedback>
  );

  const onGoBack = () => {
    dispatch(setBottomTabBarVisibility(true));
    dispatch(resetActiveRoom());
    navigation.goBack();
  };

  return (
    <Layout
      level="3"
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        flexGrow: 1,
        backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
      }}>
      <Layout style={{flex: 1}}>
        <Layout
          style={[
            styles.header,
            flexeStyles.row,
            flexeStyles.itemsCenter,
            spacingStyles.px16,
            spacingStyles.py8,
            {
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
              borderBottomWidth: 1,
              borderBottomColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            },
          ]}>
          <BackButton onPress={onGoBack} />
          <View
            style={[flexeStyles.row, flexeStyles.itemsCenter, {marginLeft: 4}]}>
            <Avatar
              source={{uri: 'https://randomuser.me/api/portraits/men/9.jpg'}}
              style={styles.avatar}
            />
            <View style={{marginLeft: 12}}>
              <Text 
                category="h6" 
                style={{ 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
                  fontWeight: '600',
                }}
              >
                John Doe
              </Text>
              <View style={[flexeStyles.row, flexeStyles.itemsCenter]}>
                <View 
                  style={[
                    styles.onlineIndicator,
                    { backgroundColor: theme['color-shadcn-primary'] }
                  ]} 
                />
                <Text 
                  category="c2" 
                  style={{ 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'],
                    marginLeft: 4,
                  }}
                >
                Online
              </Text>
              </View>
            </View>
          </View>
        </Layout>
        <MessagesList messagesList={messagesList} />
      </Layout>
      <Layout 
        level="1" 
        style={[
          styles.inputContainer,
          { 
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100'],
            borderTopWidth: 1,
            borderTopColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
          }
        ]}
      >
        <Input
          value={''}
          placeholder="Your message"
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'],
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            }
          ]}
          textStyle={{ 
            color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900'],
          }}
          placeholderTextColor={isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']}
          accessoryRight={renderSendIcon}
        />
      </Layout>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  input: {
    borderRadius: 24,
    borderWidth: 1,
  },
});
