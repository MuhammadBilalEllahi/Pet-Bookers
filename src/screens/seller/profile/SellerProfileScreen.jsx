import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
  Modal,
} from '@ui-kitten/components';
import { Dimensions, Image, ScrollView, StyleSheet, View, Alert, Linking, TouchableOpacity } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';

import { flexeStyles, spacingStyles } from '../../../utils/globalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { getAsyncAuthToken } from '../../../utils/localstorage';
import { AppScreens } from '../../../navigators/AppNavigator';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ProfileActionButton, ProfileToggler } from '../../../components/profile';
import { BASE_URL } from '../../../utils/constants';
import { BuyerAuthModal } from '../../../components/modals';
import { axiosSellerClient } from '../../../utils/axiosClient';
import { useEffect, useState } from 'react';
import { selectBaseUrls } from '../../../store/configs';
import { 
  selectSellerProfileData, 
  selectSellerProfileLoading, 
  selectSellerProfileError,
  fetchSellerProfileData,
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  logoutBuyer,
  logoutSeller,
  logout
} from '../../../store/user';

const {width, height} = Dimensions.get('window');

export const SellerProfileScreen = ({ navigation, onProfileSwitch, currentProfileType = 'seller' }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // Get seller profile data from Redux store
  const sellerData = useSelector(selectSellerProfileData);
  const sellerLoading = useSelector(selectSellerProfileLoading);
  const sellerError = useSelector(selectSellerProfileError);
  const baseUrls = useSelector(selectBaseUrls);
  
  // Get authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  
  // Modal states
  const [showBuyerAuthModal, setShowBuyerAuthModal] = useState(false);

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToShopSettings = () => {
    navigation.navigate(AppScreens.SHOP_SETTINGS);
  };

  const navigateToMyPostedAds = () => {
    navigation.navigate(AppScreens.MY_POSTED_ADS);
  };

  const navigateToFarmDetails = () => {
    navigation.navigate(AppScreens.FARM_DETAILS_EDIT);
  };

  const navigateToFarmManagement = () => {
    navigation.navigate(AppScreens.FARM_MANAGEMENT);
  };

  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };
  const navigateToBuyerOptionsInSellerProfile =()=>{
    navigation.navigate(AppScreens.BUYER_OPTIONS_IN_SELLER_PROFILE);
  }

  const EditIcon = (props) => <Icon {...props} name="edit-2-outline" />;

  useEffect(() => {
    // Fetch seller profile data from Redux store
    dispatch(fetchSellerProfileData());
  }, [dispatch]);

  const handleProfileSwitch = (newProfileType) => {
    if (onProfileSwitch) {
      onProfileSwitch(newProfileType);
    }
  };

  const handleBuyerAuthSuccess = () => {
    setShowBuyerAuthModal(false);
    // Optionally switch to buyer profile after successful login
    if (onProfileSwitch) {
      onProfileSwitch('buyer');
    }
  };

  const renderSignInButton = (accountType) => (
    <Button
      size="small"
      appearance="outline"
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderColor: isDark ? theme['color-primary-500'] : theme['color-primary-600'],
      }}
      textStyle={{
        fontSize: 12,
        color: isDark ? theme['color-primary-400'] : theme['color-primary-600'],
      }}
      onPress={() => {
        if (accountType === 'buyer') {
          setShowBuyerAuthModal(true);
        }
      }}
    >
      {t('auth.signInAsBuyer')}
    </Button>
  );

  const handleLogout = () => {
    // Check if user is authenticated with both accounts
    if (isBuyerAuthenticated && isSellerAuthenticated) {
      Alert.alert(
        t('profile.logout'),
        t('profile.logoutBothAccountsMessage', 'You are logged in with both Seller and Buyer accounts. Which account would you like to log out from?'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('profile.logoutSeller', 'Logout Seller'),
            onPress: () => {
              dispatch(logoutSeller());
              // If only buyer remains, switch to buyer profile
              if (onProfileSwitch) {
                onProfileSwitch('buyer');
              }
            },
          },
          {
            text: t('profile.logoutBuyer', 'Logout Buyer'),
            onPress: () => {
              dispatch(logoutBuyer());
            },
          },
          {
            text: t('profile.logoutBoth', 'Logout Both'),
            style: 'destructive',
            onPress: () => {
              dispatch(logout());
              navigation.navigate(AppScreens.BUYER_HOME_MAIN);
            },
          },
        ]
      );
    } else {
      // Single account logout
      Alert.alert(
        t('profile.logout'),
        t('profile.logoutConfirmMessage', 'Are you sure you want to log out?'),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('profile.logout'),
            style: 'destructive',
            onPress: () => {
              if (isSellerAuthenticated) {
                dispatch(logoutSeller());
              } else {
                dispatch(logout());
              }
              navigation.navigate(AppScreens.BUYER_HOME_MAIN);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: isDark ? theme['color-shadcn-background'] : theme['color-basic-100']
    }]}>
      <Image
        source={isDark ? require('../../../../assets/new/login_page_bg_dark.png') : require('../../../../assets/new/login_page_bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <Layout
        level="3"
        style={[
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
          <Layout level="1" style={[spacingStyles.p16, { 
            marginVertical: 0, 
            backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)', 
            borderRadius: 12 
          }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Avatar
                source={{ uri: sellerData.profileImage || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontWeight: 'bold', 
                  fontSize: 20, 
                  color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                }}>{sellerData.name || 'Loading...'}</Text>
                <Text
                  style={{ 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600'], 
                    fontSize: 14, 
                    textDecorationLine: 'underline', 
                    marginTop: 2 
                  }}
                  onPress={navigateToProfileUpdate}
                >
                  {t('profile.viewAndEditProfile')}
                </Text>
                
                {/* Profile Toggler - only shows when both profiles are authenticated */}
                <View style={{ marginTop: 8 }}>
                  <ProfileToggler
                    currentProfileType={currentProfileType}
                    onProfileSwitch={handleProfileSwitch}
                    style={{ alignSelf: 'flex-start' }}
                  />
                </View>
              </View>
            </View>
          </Layout>
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }}/>
          <Layout
            level="1"
            style={[
              spacingStyles.p16,
              {
                marginVertical: 0,
                backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)',
                borderRadius: 12,
              },
            ]}
          >
            <Layout style={[flexeStyles.row, { marginBottom: 8 }]}>
              <Image
                source={{
                  uri: sellerData.storeImage || 'https://randomuser.me/api/portraits/thumb/men/75.jpg',
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
                  <Text category="h6" style={{ 
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }}>{sellerData.storeName || t('profile.storeFullName')}</Text>
                  <Button
                    appearance="ghost"
                    size="small"
                    style={{ marginLeft: 8 }}
                    accessoryLeft={EditIcon}
                    onPress={navigateToShopSettings}
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
                    defaultRating={sellerData.rating}
                    showRating={false}
                    size={14}
                    isDisabled={true}
                    selectedColor={theme['color-shadcn-primary']}
                  />
                  <Text category="h6" style={{ 
                    fontSize: 16, 
                    marginHorizontal: 2,
                    color: isDark ? theme['color-shadcn-foreground'] : theme['color-basic-900']
                  }}>
                    {sellerData.rating}
                  </Text>
                  <Text category="s1" style={{ 
                    color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
                  }}>({sellerData.totalRatings})</Text>
                </Layout>
              </Layout>
            </Layout>
            <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }}/>
          </Layout>

          {/* Rest of the component remains the same */}
          <Layout
            level="1"
            style={[
              { 
                marginVertical: 0, 
                backgroundColor: isDark ? theme['color-shadcn-card'] : 'rgba(255,255,255,0.95)', 
                borderRadius: 12 
              },
            ]}
          >
              <ProfileActionButton
              title={t('profile.farmManagement')}
              subtitle={t('profile.farmManagementSubtitle')}
              iconName="info-outline"
              onPress={navigateToFarmManagement}
            />
            <ProfileActionButton
              title={t('profile.myAds')}
              subtitle={t('profile.myAdsSubtitle')}
              iconName="browser-outline"
              onPress={navigateToMyPostedAds}
            />
            <ProfileActionButton
              title={t('profile.buyerOptions')}
              subtitle={isBuyerAuthenticated ? t('profile.buyerOptionsSubtitle') : t('profile.buyerAuthRequired', 'Sign in as buyer to access buyer features')}
              iconName="person-outline"
              onPress={isBuyerAuthenticated ? navigateToBuyerOptionsInSellerProfile : undefined}
              disabled={!isBuyerAuthenticated}
              rightButton={!isBuyerAuthenticated ? renderSignInButton('buyer') : null}
            />
          
            <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
            {/* <ProfileActionButton
              title={t('profile.farmDetails')}
              subtitle={t('profile.farmDetailsSubtitle')}
              iconName="info-outline"
              onPress={navigateToFarmDetails}
            /> */}

            <ProfileActionButton
              title={t('profile.settings')}
              subtitle={t('profile.settingsSubtitle')}
              iconName="settings-2-outline"
              onPress={navigateToAppSettings}
            />
            {/* <ProfileActionButton
              title={t('profile.helpSupport')}
              subtitle={t('profile.helpSupportSubtitle')}
              iconName="question-mark-circle-outline"
              onPress={() => navigation.navigate(AppScreens.SUPPORT_TICKETS)}
            /> */}
            <ProfileActionButton
              title={t('profile.logout')}
              subtitle={t('profile.logoutSubtitle')}
              iconName="power-outline"
              onPress={handleLogout}
            />
          </Layout>
          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={[styles.pillButton, { 
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
              }]}
              onPress={() => Linking.openURL(`${BASE_URL}about-us`)}
            >
              <Text style={[styles.pillButtonText, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{t('profile.ourServices')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.pillButton, { 
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
              }]}
              onPress={() => Linking.openURL(`${BASE_URL}terms`)}
            >
              <Text style={[styles.pillButtonText, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{t('profile.termsConditions')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.pillButton, { 
                borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
                backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
              }]}
              onPress={() => Linking.openURL(`${BASE_URL}account-tickets`)}
            >
              <Text style={[styles.pillButtonText, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{t('profile.contactUs')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Layout>
      
      {/* Auth Modals */}
      <BuyerAuthModal
        visible={showBuyerAuthModal}
        onClose={() => setShowBuyerAuthModal(false)}
        onSuccess={handleBuyerAuthSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: height * 0.9,
    zIndex: 0,
  },
  absoluteFill: {
    zIndex: 1,
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
