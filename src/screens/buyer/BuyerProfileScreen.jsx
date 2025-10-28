import {
  Avatar,
  Button,
  Divider,
  Icon,
  Layout,
  Text,
  Modal,
} from '@ui-kitten/components';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Linking,
} from 'react-native';
import {flexeStyles, spacingStyles} from '../../utils/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
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
  selectAuthToken,
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  logoutBuyer,
  logoutSeller,
} from '../../store/user';
import {
  delAsyncAuthToken,
  delAsyncUserType,
  setAsyncAuthToken,
  setAsyncUserType,
} from '../../utils/localstorage';
import {ProfileActionButton, ProfileToggler} from '../../components/profile';
import {useEffect, useState} from 'react';
import {useTheme} from '../../theme/ThemeContext';
import {AppScreens} from '../../navigators/AppNavigator';
import {useTranslation} from 'react-i18next';
import {BASE_URL} from '../../utils/constants';
import {BASE_URLS} from '../../store/configs';

const {width, height} = Dimensions.get('window');

export const BuyerProfileScreen = ({
  navigation,
  onProfileSwitch,
  currentProfileType = 'buyer',
}) => {
  const dispatch = useDispatch();
  const {theme, isDark} = useTheme();
  const {t} = useTranslation();
  // Redux selectors
  const customerInfo = useSelector(selectCustomerInfo);
  const customerLoading = useSelector(selectCustomerLoading);
  const customerError = useSelector(selectCustomerError);
  const isBuyer = useSelector(selectIsBuyer);
  const authToken = useSelector(selectAuthToken);

  // Get authentication states
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);

  // Modal states

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
  const navigateToPage = page => {
    navigation.navigate(page);
  };
  const navigateToMyOrderList = () => {
    navigation.navigate(AppScreens.MY_ORDER_LIST);
  };

  const handleProfileSwitch = newProfileType => {
    if (onProfileSwitch) {
      onProfileSwitch(newProfileType);
    }
  };

  const renderSignInButton = accountType => (
    <Button
      size="small"
      appearance="outline"
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderColor: isDark
          ? theme['color-primary-500']
          : theme['color-primary-600'],
      }}
      textStyle={{
        fontSize: 12,
        color: isDark ? theme['color-primary-400'] : theme['color-primary-600'],
      }}
      onPress={() => {
        if (accountType === 'seller') {
          navigation.navigate(AppScreens.LOGIN, {isItSeller: true});
        }
      }}>
      {t('auth.signInAsSeller', 'Sign in as Seller')}
    </Button>
  );

  const handleLogout = () => {
    // Check if user is authenticated with both accounts
    if (isBuyerAuthenticated && isSellerAuthenticated) {
      Alert.alert(
        t('profile.logout'),
        t(
          'profile.logoutBothAccountsMessage',
          'You are logged in with both Seller and Buyer accounts. Which account would you like to log out from?',
        ),
        [
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
          {
            text: t('profile.logoutBuyer', 'Logout Buyer'),
            onPress: () => {
              dispatch(logoutBuyer());
              // If only seller remains, switch to seller profile
              if (onProfileSwitch) {
                onProfileSwitch('seller');
              }
            },
          },
          {
            text: t('profile.logoutSeller', 'Logout Seller'),
            onPress: () => {
              dispatch(logoutSeller());
            },
          },
          {
            text: t('profile.logoutBoth', 'Logout Both'),
            style: 'destructive',
            onPress: () => {
              dispatch(logout());
            },
          },
        ],
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
              if (isBuyerAuthenticated) {
                dispatch(logoutBuyer());
              } else {
                dispatch(logout());
              }
            },
          },
        ],
      );
    }
  };

  return (
    <Layout
      level="3"
      style={[
        {
          flex: 1,
          overflow: 'scroll',
          backgroundColor: isDark
            ? theme['color-shadcn-background']
            : theme['color-basic-100'],
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
          source={
            isDark
              ? require('../../../assets/new/login_page_bg_dark.png')
              : require('../../../assets/new/login_page_bg.png')
          }
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <Layout
          level="1"
          style={[
            spacingStyles.p16,
            {
              marginVertical: 0,
              backgroundColor: isDark
                ? theme['color-shadcn-card']
                : 'rgba(255,255,255,0.95)',
              borderRadius: 12,
            },
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {customerLoading ? (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 14,
                  backgroundColor: isDark
                    ? theme['color-shadcn-secondary']
                    : theme['color-basic-200'],
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Icon
                  name="loader-outline"
                  fill={
                    isDark
                      ? theme['color-shadcn-foreground']
                      : theme['color-basic-600']
                  }
                  style={{width: 24, height: 24}}
                />
              </View>
            ) : (
              <Avatar
                source={{
                  uri: customerInfo?.image
                    ? `${BASE_URLS.customer_image_url}/${
                        customerInfo?.image || ''
                      }`
                    : 'https://randomuser.me/api/portraits/men/1.jpg',
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  marginRight: 14,
                }}
              />
            )}
            <View style={{flex: 1}}>
              {customerLoading ? (
                <>
                  <View
                    style={{
                      width: '60%',
                      height: 20,
                      backgroundColor: isDark
                        ? theme['color-shadcn-secondary']
                        : theme['color-basic-200'],
                      borderRadius: 4,
                      marginBottom: 4,
                    }}
                  />
                  <View
                    style={{
                      width: '40%',
                      height: 14,
                      backgroundColor: isDark
                        ? theme['color-shadcn-secondary']
                        : theme['color-basic-200'],
                      borderRadius: 4,
                    }}
                  />
                </>
              ) : customerError ? (
                <>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 20,
                      color: isDark
                        ? theme['color-danger-500']
                        : theme['color-danger-600'],
                    }}>
                    {t('profile.errorLoadingProfile')}
                  </Text>
                  <Text
                    style={{
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                      textDecorationLine: 'underline',
                      marginTop: 2,
                    }}
                    onPress={() => dispatch(fetchCustomerInfo())}>
                    {t('auth.tapToRetry')}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 20,
                      color: isDark
                        ? theme['color-shadcn-foreground']
                        : theme['color-basic-900'],
                    }}>
                    {customerInfo
                      ? `${customerInfo.f_name || ''} ${
                          customerInfo.l_name || ''
                        }`.trim() ||
                        customerInfo.name ||
                        'Unknown User'
                      : 'Guest User'}
                  </Text>
                  <Text
                    style={{
                      color: isDark
                        ? theme['color-shadcn-muted-foreground']
                        : theme['color-basic-600'],
                      fontSize: 14,
                      textDecorationLine: 'underline',
                      marginTop: 2,
                    }}
                    onPress={navigateToProfileUpdate}>
                    {t('profile.viewAndEditProfile')}
                  </Text>
                  {customerInfo?.email && (
                    <Text
                      style={{
                        color: isDark
                          ? theme['color-shadcn-muted-foreground']
                          : theme['color-basic-600'],
                        fontSize: 12,
                        marginTop: 2,
                      }}>
                      {customerInfo.email}
                    </Text>
                  )}

                  {/* Profile Toggler - only shows when both profiles are authenticated */}
                  <View style={{marginTop: 8}}>
                    <ProfileToggler
                      currentProfileType={currentProfileType}
                      onProfileSwitch={handleProfileSwitch}
                      style={{alignSelf: 'flex-start'}}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </Layout>

        <Divider
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-border']
              : theme['color-basic-400'],
          }}
        />

        <Layout
          level="1"
          style={{
            backgroundColor: isDark
              ? theme['color-shadcn-card']
              : 'rgba(255,255,255,0.95)',
          }}>
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />

          {/* Seller Options */}
          <ProfileActionButton
            title={t('profile.sellerOptions', 'Seller Options')}
            subtitle={
              isSellerAuthenticated
                ? t(
                    'profile.sellerOptionsSubtitle',
                    'Manage your selling activities',
                  )
                : t(
                    'profile.sellerAuthRequired',
                    'Sign in as seller to access seller features',
                  )
            }
            iconName="person-outline"
            onPress={
              isSellerAuthenticated
                ? () => navigation.navigate(AppScreens.SELLER_OPTIONS)
                : undefined
            }
            disabled={!isSellerAuthenticated}
            rightButton={
              !isSellerAuthenticated ? renderSignInButton('seller') : null
            }
          />
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />

          <ProfileActionButton
            title={t('profile.cart')}
            subtitle={t('profile.cartSubtitle')}
            iconName="shopping-cart-outline"
            onPress={navigateToOrdersList}
          />
          <ProfileActionButton
            title={t('profile.myWishlist')}
            subtitle={t('profile.myWishlistSubtitle')}
            iconName="heart-outline"
            onPress={navigateToMyWishlist}
          />
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />
          <ProfileActionButton
            title={t('profile.myOrders')}
            subtitle={t('profile.myOrdersSubtitle')}
            iconName="map-outline"
            onPress={navigateToMyOrderList}
          />
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />
          <ProfileActionButton
            title={t('profile.manageAddresses')}
            subtitle={t('profile.manageAddressesSubtitle')}
            iconName="map-outline"
            onPress={navigateToAddressList}
          />
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />
          <ProfileActionButton
            title={t('profile.settings')}
            subtitle={t('profile.settingsSubtitleGeneric')}
            iconName="settings-2-outline"
            onPress={navigateToAppSettings}
          />
          <ProfileActionButton
            title={t('profile.helpSupport')}
            subtitle={t('profile.helpSupportSubtitle')}
            iconName="question-mark-circle-outline"
            onPress={() => navigation.navigate(AppScreens.SUPPORT_TICKETS)}
          />
          <Divider
            style={{
              backgroundColor: isDark
                ? theme['color-shadcn-border']
                : theme['color-basic-400'],
            }}
          />
          <ProfileActionButton
            title={t('profile.logout')}
            subtitle={t('profile.logoutSubtitleGeneric')}
            iconName="power"
            onPress={handleLogout}
          />
        </Layout>
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.pillButton,
              {
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}
            onPress={() => Linking.openURL(`${BASE_URL}about-us`)}>
            <Text
              style={[
                styles.pillButtonText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('profile.ourServices')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pillButton,
              {
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}
            onPress={() => Linking.openURL(`${BASE_URL}terms`)}>
            <Text
              style={[
                styles.pillButtonText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('profile.termsConditions')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pillButton,
              {
                borderColor: isDark
                  ? theme['color-shadcn-border']
                  : theme['color-basic-400'],
                backgroundColor: isDark
                  ? theme['color-shadcn-card']
                  : theme['color-basic-100'],
              },
            ]}
            onPress={() => Linking.openURL(`${BASE_URL}account-tickets`)}>
            <Text
              style={[
                styles.pillButtonText,
                {
                  color: isDark
                    ? theme['color-shadcn-muted-foreground']
                    : theme['color-basic-600'],
                },
              ]}>
              {t('profile.contactUs')}
            </Text>
          </TouchableOpacity>
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
