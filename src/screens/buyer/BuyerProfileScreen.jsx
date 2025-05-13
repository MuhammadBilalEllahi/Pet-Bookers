import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
} from '@ui-kitten/components';
import {Dimensions, Image, ScrollView, StyleSheet, View} from 'react-native';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import { useDispatch } from 'react-redux';
import { logout, setAuthToken, setUserType, UserType } from '../../store/user';
import { delAsyncAuthToken, delAsyncUserType, setAsyncAuthToken, setAsyncUserType } from '../../utils/localstorage';
import { ProfileActionButton } from '../../components/profile';
import { axiosBuyerClient } from '../../utils/axiosClient';
import { useEffect } from 'react';

const { width, height} = Dimensions.get('window')


export const BuyerProfileScreen = ({navigation}) => {

  const dispatch = useDispatch();
  const EditIcon = props => <Icon {...props} name="edit-2-outline" />;
  const LockIcon = props => <Icon {...props} name="lock-outline" />;


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosBuyerClient.get('customer/info');
        console.log(response);
      } catch (error) {
        console.error('Error fetching profile:', error || error?.message || error?.response?.data?.message);
      }
    }
    fetchUserProfile();
  }, []);

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  const navigateToOrdersList = () => {
    navigation.navigate('MyOrders');
  };

  const navigateToWishlist = () => {
    navigation.navigate('MyWishlist');
  };

  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };
  const navigateToPage = (page) => {
    navigation.navigate(page);
  };

  return (
    <Layout
      level="3"
      style={[
        // spacingStyles.px16,
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
          paddingTop: 40,
          paddingBottom: 90,
        }}>
         <Image
        source={require('../../../assets/new/login_page_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
        
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

          <Divider />
        
        <Layout level="1" style={[
          // spacingStyles.p16,
          //  {marginVertical: 4}
           ]}>
          <ProfileActionButton
            title="My Wishlist"
            subtitle="Wishlist are here"
            iconName="cube-outline"
            onPress={navigateToWishlist}
          />
          <Divider />
          <ProfileActionButton
            title="Settings"
            subtitle="Settings are here now"
            iconName="settings-2-outline"
            onPress={navigateToAppSettings}
          />
          <Divider />
          <ProfileActionButton
            title="Cart"
            subtitle="Settings are here now"
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
          />
          <Divider />
          <ProfileActionButton
            title="Logout"
            subtitle="You can log out here"
            iconName="power"
            onPress={() => {
              dispatch(logout())
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
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width:width ,
    height:height *0.9,
    zIndex: 0,
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
})