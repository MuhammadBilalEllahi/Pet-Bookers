import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
  useTheme,
} from '@ui-kitten/components';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';
import { ProfileActionButton } from '../../components/profile';
import { flexeStyles, spacingStyles } from '../../utils/globalStyles';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/user';
import { getAsyncAuthToken } from '../../utils/localstorage';

const {width, height} = Dimensions.get('window');

export const SellerProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  const navigateToMyPostedAds = () => {
    navigation.navigate('MyPostedAds');
  };

  const navigateToOrdersList = () => {
    navigation.navigate('MyOrders');
  };

  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };
  // navigateToPasswordUpdate

  const data = getAsyncAuthToken()
  console.log("DATA ", data)

  // Senior-level: Memoize icons for performance and consistency
  const EditIcon = (props) => <Icon {...props} name="edit-2-outline" />;
  const LockIcon = (props) => <Icon {...props} name="lock-outline" />;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/new/login_page_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <Layout
        level="3"
        style={[
          // spacingStyles.px16,
          styles.absoluteFill,
          { backgroundColor: 'transparent' },
        ]}
      >
        <ScrollView
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 10,
            paddingBottom: 90,
          }}
        >
          <Layout level="1" style={[spacingStyles.p16, { marginVertical: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }}
              />
              <View>
                <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#222' }}>Osama Tabassum</Text>
                <Text
                  style={{ color: '#121212', fontSize: 14, textDecorationLine: 'underline', marginTop: 2 }}
                  onPress={navigateToProfileUpdate}
                >
                  View and edit profile
                </Text>
              </View>
            </View>
          </Layout>
          <Divider/>
          <Layout
            level="1"
            style={[
              spacingStyles.p16,
              {
                marginVertical: 0,
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
              },
            ]}
          >
            <Layout style={[flexeStyles.row, { marginBottom: 8 }]}>
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
                }}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 50,
                  marginRight: 8,
                }}
              />
              <Layout>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text category="h6">Store Full Name</Text>
                  <Button
                    appearance="ghost"
                    size="small"
                    style={{ marginLeft: 8 }}
                    accessoryLeft={EditIcon}
                    onPress={navigateToPasswordUpdate}
                  />
                </View>
                <Layout
                  style={[
                    flexeStyles.row,
                    flexeStyles.itemsCenter,
                    {
                      marginVertical: 4,
                    },
                  ]}
                >
                  <AirbnbRating
                    count={5}
                    defaultRating={3.4}
                    showRating={false}
                    size={14}
                    isDisabled={true}
                    selectedColor={theme['color-primary-default']}
                  />
                  <Text category="h6" style={{ fontSize: 16, marginHorizontal: 2 }}>
                    3.4
                  </Text>
                  <Text category="s1">(34)</Text>
                </Layout>
              </Layout>
            </Layout>
            <Divider />
            
          </Layout>

          <Layout
            level="1"
            style={[
              
              { marginVertical: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12 },
            ]}
          >
            <ProfileActionButton
              title="My Ads"
              subtitle="All ads you have posted"
              iconName="browser-outline"
              onPress={navigateToMyPostedAds}
            />
            <ProfileActionButton
              title="Farm Details"
              subtitle="Edit your farm details"
              iconName="info-outline"
              onPress={() => {}}
            />
            <ProfileActionButton
              title="Favorites Ads"
              subtitle="All of your favorite ads"
              iconName="heart"
              onPress={() => {}}
            />
            <ProfileActionButton
              title="Settings"
              subtitle="All of your favorite ads"
              iconName="settings-2-outline"
              onPress={navigateToAppSettings}
            />
            <ProfileActionButton
              title="Help & Support"
              subtitle="All of your favorite ads"
              iconName="question-mark-circle-outline"
              onPress={() => {}}

            />
            
            <ProfileActionButton
              title="Logout"
              iconName="power-outline"
              subtitle="log out"
              onPress={() => {
                dispatch(logout());
              }}
              />
          </Layout>
          <View style={styles.bottomBar}>
        <View style={styles.pillButton}><Text style={styles.pillButtonText}>Our Services</Text></View>
        <View style={styles.pillButton}><Text style={styles.pillButtonText}>Term & Conditions</Text></View>
        <View style={styles.pillButton}><Text style={styles.pillButtonText}>Contact us</Text></View>
      </View>
        </ScrollView>
        
      </Layout>
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    position: 'relative',
    // backgroundColor: '#fff',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width:width ,
    height:height *0.9,
    zIndex: 0,
  },
  absoluteFill: {
    // ...StyleSheet.absoluteFillObject,
    // zIndex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  pillButton: {
    borderWidth: 1,
    borderColor:'#636363',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: -30,
    backgroundColor: '#fff',
  },
  pillButtonText: {
    fontSize: 9,
    color: '#646464',
    fontWeight: '500',
  },
});
