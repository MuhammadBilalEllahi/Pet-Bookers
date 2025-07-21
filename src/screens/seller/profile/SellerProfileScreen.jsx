import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
} from '@ui-kitten/components';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';

import { flexeStyles, spacingStyles } from '../../../utils/globalStyles';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/user';
import { getAsyncAuthToken } from '../../../utils/localstorage';
import { AppScreens } from '../../../navigators/AppNavigator';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ProfileActionButton } from '../../../components/profile';
import { axiosSellerClient } from '../../../utils/axiosClient';
import { useEffect, useState } from 'react';
import { selectBaseUrls } from '../../../store/configs';
import { 
  selectSellerProfileData, 
  selectSellerProfileLoading, 
  selectSellerProfileError,
  fetchSellerProfileData 
} from '../../../store/user';

const {width, height} = Dimensions.get('window');

export const SellerProfileScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  // Get seller profile data from Redux store
  const sellerData = useSelector(selectSellerProfileData);
  const sellerLoading = useSelector(selectSellerProfileLoading);
  const sellerError = useSelector(selectSellerProfileError);
  const baseUrls = useSelector(selectBaseUrls);

  const navigateToProfileUpdate = () => {
    navigation.navigate('UpdateProfile');
  };

  const navigateToPasswordUpdate = () => {
    navigation.navigate('UpdatePassword');
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

  const navigateToOrdersList = () => {
    navigation.navigate(AppScreens.CART);
  };

  const navigateToMyWishlist = () => {
    navigation.navigate(AppScreens.MY_WISHLIST);
  };
  
  const navigateToMyOrderList = () => {
    navigation.navigate(AppScreens.MY_ORDER_LIST);
  };

  const navigateToAppSettings = () => {
    navigation.navigate('AppSettings');
  };

  const EditIcon = (props) => <Icon {...props} name="edit-2-outline" />;

  useEffect(() => {
    // Fetch seller profile data from Redux store
    dispatch(fetchSellerProfileData());
  }, [dispatch]);

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
              <View>
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
              title={t('profile.myAds')}
              subtitle={t('profile.myAdsSubtitle')}
              iconName="browser-outline"
              onPress={navigateToMyPostedAds}
            />
            <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
          <ProfileActionButton
            title="Cart"
            subtitle="Settings are here now"
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
          />
           <ProfileActionButton
            title="My Orders"
            subtitle="Your saved items"
            iconName="map-outline"
            onPress={navigateToMyOrderList}
          />
          <Divider style={{ backgroundColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'] }} />
         
            <ProfileActionButton
              title={t('profile.farmDetails')}
              subtitle={t('profile.farmDetailsSubtitle')}
              iconName="info-outline"
              onPress={navigateToFarmDetails}
            />
            <ProfileActionButton
              title={t('profile.farmManagement')}
              subtitle={t('profile.farmManagementSubtitle')}
              iconName="info-outline"
              onPress={navigateToFarmManagement}
            />
            <ProfileActionButton
              title={t('profile.favoritesAds')}
              subtitle={t('profile.favoritesAdsSubtitle')}
              iconName="heart"
              onPress={navigateToMyWishlist}
            />
            <ProfileActionButton
              title={t('profile.settings')}
              subtitle={t('profile.settingsSubtitle')}
              iconName="settings-2-outline"
              onPress={navigateToAppSettings}
            />
            <ProfileActionButton
              title={t('profile.helpSupport')}
              subtitle={t('profile.helpSupportSubtitle')}
              iconName="question-mark-circle-outline"
              onPress={() => {}}
            />
            <ProfileActionButton
              title={t('profile.logout')}
              subtitle={t('profile.logoutSubtitle')}
              iconName="power-outline"
              onPress={() => {
                dispatch(logout());
                navigation.navigate(AppScreens.BUYER_HOME_MAIN);
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
              }]}>{t('profile.ourServices')}</Text>
            </View>
            <View style={[styles.pillButton, { 
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
            }]}>
              <Text style={[styles.pillButtonText, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{t('profile.termsConditions')}</Text>
            </View>
            <View style={[styles.pillButton, { 
              borderColor: isDark ? theme['color-shadcn-border'] : theme['color-basic-400'],
              backgroundColor: isDark ? theme['color-shadcn-card'] : theme['color-basic-100']
            }]}>
              <Text style={[styles.pillButtonText, { 
                color: isDark ? theme['color-shadcn-muted-foreground'] : theme['color-basic-600']
              }]}>{t('profile.contactUs')}</Text>
            </View>
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
