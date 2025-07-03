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
import { useTheme } from '../../theme/ThemeContext';
import { AppScreens } from '../../navigators/AppNavigator';

const { width, height} = Dimensions.get('window')

export const BuyerProfileScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const { theme, isDark } = useTheme();
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
    navigation.navigate(AppScreens.MY_ORDERS);
  };

  
  const navigateToMyWishlist = () => {
    navigation.navigate(AppScreens.MY_WISHLIST);
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
              <Avatar
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }}
              />
              <View>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 20, 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }}>Osama Tabassum</Text>
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
              </View>
            </View>
          </Layout>

          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
        
        <Layout level="1" style={{ backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)' }}>
          <ProfileActionButton
            title="My Wishlist"
            subtitle="Your saved items"
            iconName="heart-outline"
            onPress={navigateToMyWishlist}
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
            title="Cart"
            subtitle="Settings are here now"
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
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