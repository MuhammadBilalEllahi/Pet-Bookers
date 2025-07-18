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
import { useDispatch, useSelector } from 'react-redux';
import { 
  logout, 
  setAuthToken, 
  setUserType, 
  UserType,
  fetchCustomerInfo,
  selectCustomerInfo,
  selectCustomerLoading,
  selectCustomerError,
  selectIsBuyer,
  selectAuthToken
} from '../../store/user';
import { delAsyncAuthToken, delAsyncUserType, setAsyncAuthToken, setAsyncUserType } from '../../utils/localstorage';
import { ProfileActionButton } from '../../components/profile';
import { useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { AppScreens } from '../../navigators/AppNavigator';

const { width, height} = Dimensions.get('window')

export const BuyerProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const { theme, isDark } = useTheme();
  
  // Redux selectors
  const customerInfo = useSelector(selectCustomerInfo);
  const customerLoading = useSelector(selectCustomerLoading);
  const customerError = useSelector(selectCustomerError);
  const isBuyer = useSelector(selectIsBuyer);
  const authToken = useSelector(selectAuthToken);
  
  const EditIcon = props => <Icon {...props} name="edit-2-outline" />;
  const LockIcon = props => <Icon {...props} name="lock-outline" />;

  useEffect(() => {
    // Fetch customer info if user is buyer and authenticated
    if (isBuyer && authToken) {
      dispatch(fetchCustomerInfo());
    }
  }, [dispatch, isBuyer, authToken]);

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
  };

  const navigateToOrdersList = () => {
    navigation.navigate(AppScreens.CART);
  };

  
  const navigateToMyWishlist = () => {
    navigation.navigate(AppScreens.MY_WISHLIST);
  };

  const navigateToAddressList = () => {
    navigation.navigate(AppScreens.ADDRESS_LIST);
  };

  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };
  const navigateToPage = (page) => {
    navigation.navigate(page);
  };
  const navigateToMyOrderList = () => {
    navigation.navigate(AppScreens.MY_ORDER_LIST);
  };

  return (
    <Layout
      level="3"
      style={[
        {
          flex: 1,
          overflow: 'scroll',
          backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100'],
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
         
          source={isDark ? require('../../../assets/new/login_page_bg_dark.png') :require('../../../assets/new/login_page_bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <Layout level="1" style={[spacingStyles.p16, { 
          marginVertical: 0, 
          backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)', 
          borderRadius: 12 
        }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {customerLoading ? (
                <View style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14, backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name="loader-outline" fill={isDark ? theme['color-shadcn-foreground'] : theme['color-basic-600']} style={{ width: 24, height: 24 }} />
                </View>
              ) : (
                <Avatar
                  source={{ 
                    uri: customerInfo?.image 
                      ? `https://petbookers.com/storage/app/public/profile/${customerInfo.image}`
                      : 'https://randomuser.me/api/portraits/men/1.jpg'
                  }}
                  style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }}
                />
              )}
              <View style={{ flex: 1 }}>
                {customerLoading ? (
                  <>
                    <View style={{ width: '60%', height: 20, backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], borderRadius: 4, marginBottom: 4 }} />
                    <View style={{ width: '40%', height: 14, backgroundColor: isDark ? theme['color-shadcn-secondary'] : theme['color-basic-200'], borderRadius: 4 }} />
                  </>
                ) : customerError ? (
                  <>
                    <Text style={{ 
                      fontWeight: 'bold', 
                      fontSize: 20, 
                      color: isDark ? theme['color-danger-500'] : theme['color-danger-600']
                    }}>Error loading profile</Text>
                    <Text
                      style={{ 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                        fontSize: 14, 
                        textDecorationLine: 'underline', 
                        marginTop: 2 
                      }}
                      onPress={() => dispatch(fetchCustomerInfo())}
                    >
                      Tap to retry
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ 
                      fontWeight: 'bold', 
                      fontSize: 20, 
                      color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                    }}>
                      {customerInfo ? `${customerInfo.f_name || ''} ${customerInfo.l_name || ''}`.trim() || customerInfo.name || 'Unknown User' : 'Guest User'}
                    </Text>
                    <Text
                      style={{ 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                        fontSize: 14, 
                        textDecorationLine: 'underline', 
                        marginTop: 2 
                      }}
                      onPress={navigateToProfileUpdate}
                    >
                      View and edit profile
                    </Text>
                    {customerInfo?.email && (
                      <Text style={{ 
                        color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                        fontSize: 12,
                        marginTop: 2
                      }}>
                        {customerInfo.email}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          </Layout>

          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
        
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="Cart"
            subtitle="Settings are here now"
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
          />
        <Layout level="1" style={{ backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)' }}>
          <ProfileActionButton
            title="My Wishlist"
            subtitle="Your saved items"
            iconName="heart-outline"
            onPress={navigateToMyWishlist}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="My Orders"
            subtitle="Your saved items"
            iconName="map-outline"
            onPress={navigateToMyOrderList}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="Manage Addresses"
            subtitle="Add and edit delivery addresses"
            iconName="map-outline"
            onPress={navigateToAddressList}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="Settings"
            subtitle="Settings are here now"
            iconName="settings-2-outline"
            onPress={navigateToAppSettings}
          />
          
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
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
          <View style={[styles.pillButton, { 
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <Text style={[styles.pillButtonText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>Our Services</Text>
          </View>
          <View style={[styles.pillButton, { 
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <Text style={[styles.pillButtonText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>Term & Conditions</Text>
          </View>
          <View style={[styles.pillButton, { 
            borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
            backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
          }]}>
            <Text style={[styles.pillButtonText, { 
              color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
            }]}>Contact us</Text>
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height * 0.9,
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
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: -30,
  },
  pillButtonText: {
    fontSize: 9,
    fontWeight: '500',
  },
});