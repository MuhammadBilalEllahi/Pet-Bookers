import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
} from '@ui-kitten/components';
import {ScrollView} from 'react-native';
import {ProfileActionButton} from '../../components/profile';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import { useDispatch } from 'react-redux';
import { setAuthToken, setUserType, UserType } from '../../store/user';

export const BuyerProfileScreen = ({navigation}) => {

  const dispatch = useDispatch();
  const EditIcon = props => <Icon {...props} name="edit-2-outline" />;
  const LockIcon = props => <Icon {...props} name="lock-outline" />;

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  const navigateToOrdersList = () => {
    navigation.navigate('MyOrders');
  };
  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };

  return (
    <Layout
      level="3"
      style={[
        spacingStyles.px16,
        {
          flex: 1,
          overflow: 'scroll',
        },
      ]}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 10,
          paddingBottom: 90,
        }}>
        <Layout level="1" style={[spacingStyles.p16, {marginVertical: 4}]}>
          <Layout style={[flexeStyles.row, {marginBottom: 10}]}>
            <Avatar
              source={{uri: 'https://randomuser.me/api/portraits/men/1.jpg'}}
              style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                marginRight: 10,
              }}
            />
            <Layout>
              <Text category="h6">John Doe</Text>
              <Text category="p1" style={{marginVertical: 4}}>
                johndoe@gmail.com
              </Text>
              <Text category="p1">+92 340 1234567</Text>
            </Layout>
            <Layout style={{marginLeft: 'auto'}}>
              <Button
                appearance="ghost"
                accessoryLeft={EditIcon}
                onPress={navigateToProfileUpdate}
              />
            </Layout>
          </Layout>
          <Divider />
          <Layout
            style={[
              flexeStyles.row,
              {
                marginTop: 4,
                justifyContent: 'flex-end',
              },
            ]}>
            <Button
              appearance="ghost"
              size="small"
              style={{marginLeft: 8}}
              accessoryLeft={LockIcon}
              onPress={navigateToPasswordUpdate}>
              Change Password
            </Button>
          </Layout>
        </Layout>
        <Layout level="1" style={[spacingStyles.p16, {marginVertical: 4}]}>
          <ProfileActionButton
            title="My Orders"
            iconName="cube-outline"
            onPress={navigateToOrdersList}
          />
          <Divider />
          <ProfileActionButton
            title="Settings"
            iconName="settings-2-outline"
            onPress={navigateToAppSettings}
          />
          <Divider />
          <ProfileActionButton
            title="Logout"
            iconName="power-outline"
            onPress={() => {
              dispatch(setUserType(UserType.ANONYMOUS))
              dispatch(setAuthToken(null))
            }}
          />
        </Layout>
      </ScrollView>
    </Layout>
  );
};
