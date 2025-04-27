import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import {
  BottomNavigation,
  BottomNavigationTab,
  Text,
  useTheme,
} from '@ui-kitten/components';
import { ThemedIcon } from '../../components/Icon';
import { selectShowBottomTabBar } from '../../store/configs';
import { MainScreensHeader } from '../../components/buyer';
import { selectIfAnonymous } from '../../store/user';

// Screens and Navigation Stacks
import { BuyerHomeStack } from './BuyerHomeStack';
import { ChatNavigator } from '../ChatNavigator';
import { MyWishlistScreen } from '../../screens/buyer/MyWishlistScreen';
import { BuyerProfileStack } from './BuyerProfileStack';
import { MyCartScreen } from '../../screens/buyer/MyCartScreen';
import { AuthRestrictedError } from '../../components/auth/AuthRestrictedError';

// Import the custom icons for all tabs
const homeIcon = require('../../../assets/new/bottom_nav/home.png');
const chatIcon = require('../../../assets/new/bottom_nav/chat.png');
const sellPlusIcon = require('../../../assets/new/bottom_nav/sell_plus.png');
const luckyDrawIcon = require('../../../assets/new/bottom_nav/lucky_draw.png');
const profileUserIcon = require('../../../assets/new/bottom_nav/profile_user.png');

const activeUnderIcon = require('../../../assets/new/bottom_nav/active.png');

const { Navigator, Screen } = createBottomTabNavigator();

// Navigation route enum for buyer main navigator
export const BuyerMainRoutes = Object.freeze({
  BUYER_HOME: 'BuyerHome',
  BUYER_CHAT: 'BuyerChat',
  BUYER_CART: 'BuyerCart',
  SELLER_POST_AD: 'SellerPostAd',
  BUYER_WISHLIST: 'BuyerWishlist',
  BUYER_PROFILE: 'BuyerProfile',
});

const ICON_DARK_GREY = '#444444';
const TEXT_BLACK = '#000000';

// Ensure text does not wrap by setting flexShrink: 0, flexGrow: 0, minWidth: 0, and allowFontScaling: false
const renderTabIconWithActive = (iconSource, isActive, label, customIconStyle = {}) => (
  <View style={styles.iconWithActiveContainer} key={`iconWithActiveContainer-${label}`}>
    <Image
      source={iconSource}
      style={{
        width: 36,
        height: 36,
        resizeMode: 'contain',
        tintColor: ICON_DARK_GREY,
        ...customIconStyle,
      }}
      key={`icon-image-${label}`}
    />
    <Text
      style={{
        fontWeight: '700',
        fontSize: 12,
        color: TEXT_BLACK,
        marginTop: 2,
        flexShrink: 0,
        flexGrow: 0,
        minWidth: 0,
      }}
      numberOfLines={1}
      ellipsizeMode="clip"
      allowFontScaling={false}
      key={`icon-label-${label}`}
    >
      {label}
    </Text>
    {isActive && (
      <Image
        source={activeUnderIcon}
        style={{
          width: 36,
          height: 6,
          resizeMode: 'contain',
          marginTop: 2,
        }}
        key={`icon-active-underline-${label}`}
      />
    )}
  </View>
);

// Do not change color of plus icon (no tintColor)
const renderAddTabIconWithActive = (isActive, label) => (
  <View style={styles.addButtonContainer} key={`addButtonContainer-${label}`}>
    <View
      style={[
        styles.addButton,
        {
          borderColor: 'transparent',
        },
      ]}
      key={`addButton-${label}`}
    >
      <Image
        source={sellPlusIcon}
        style={{
          width: 70,
          height: 70,
          resizeMode: 'cover',
          // No tintColor here, so the plus icon keeps its original color
        }}
        key={`addButton-image-${label}`}
      />
    </View>
    <Text
      style={{
        fontWeight: '700',
        fontSize: 12,
        color: TEXT_BLACK,
        marginTop: 2,
        flexShrink: 0,
        flexGrow: 0,
        minWidth: 0,
      }}
      numberOfLines={1}
      ellipsizeMode="clip"
      allowFontScaling={false}
      key={`addButton-label-${label}`}
    >
      {label}
    </Text>
    {isActive && (
      <Image
        source={activeUnderIcon}
        style={{
          width: 36,
          height: 6,
          resizeMode: 'contain',
          marginTop: 2,
        }}
        key={`addButton-active-underline-${label}`}
      />
    )}
  </View>
);

const BottomTabBar = ({ navigation, state, isAnonymous }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const showBottomTabBar = useSelector(selectShowBottomTabBar);

  return (
    <View style={styles.bottomTabBarContainer} key="bottomTabBarContainer">
      <BottomNavigation
        selectedIndex={state.index}
        appearance="noIndicator"
        style={[
          styles.bottomNavigation,
          {
            position: 'absolute',
            bottom: showBottomTabBar ? 0 : -1000,
            overflow: showBottomTabBar ? 'visible' : 'hidden',
          },
        ]}
        onSelect={index => navigation.navigate(state.routeNames[index])}
        key="bottomNavigation"
      >
        <BottomNavigationTab
          key="tab-home"
          icon={() =>
            renderTabIconWithActive(
              homeIcon,
              state.index === 0,
              t('tabs.home')
            )
          }
        />
        <BottomNavigationTab
          key="tab-chat"
          icon={() =>
            renderTabIconWithActive(
              chatIcon,
              state.index === 1,
              t('tabs.chat')
            )
          }
        />
        <BottomNavigationTab
          key="tab-add"
          icon={() =>
            renderAddTabIconWithActive(
              state.index === 2,
              t(isAnonymous ? 'tabs.sell' : 'tabs.cart')
            )
          }
        />
        <BottomNavigationTab
          key="tab-luckydraw"
          icon={() =>
            renderTabIconWithActive(
              luckyDrawIcon,
              state.index === 3,
              t('tabs.luckydraw'),
              { width: 48, height: 35 } // Increase size for lucky draw icon
            )
          }
        />
        <BottomNavigationTab
          key="tab-profile"
          icon={() =>
            renderTabIconWithActive(
              profileUserIcon,
              state.index === 4,
              t('tabs.profile')
            )
          }
        />
      </BottomNavigation>
    </View>
  );
};

export const BuyerMainNavigator = () => {
  const isAnonymous = useSelector(selectIfAnonymous);
  return (
    <Navigator
      tabBar={props => <BottomTabBar {...props} isAnonymous={isAnonymous} key="bottomTabBar" />}
      screenOptions={{ headerShown: false }}
    >
      <Screen
        name={BuyerMainRoutes.BUYER_HOME}
        component={BuyerHomeStack}
        key="screen-BuyerHome"
      />
      {isAnonymous
        ? [
            <Screen
              key="screen-BuyerChat-anon"
              name={BuyerMainRoutes.BUYER_CHAT}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="Chat"
                  />
                ),
              }}
            >
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.loginRequired"
                  key="authError-BuyerChat-anon"
                />
              )}
            </Screen>,
            <Screen
              key="screen-SellerPostAd-anon"
              name={BuyerMainRoutes.SELLER_POST_AD}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="AddProduct"
                  />
                ),
              }}
            >
              {props => (
                <AuthRestrictedError
                  {...props}
                  isItSeller= {true}
                  subTitle="messages.sellerLoginRequired"
                  key="authError-SellerPostAd-anon"
                />
              )}
            </Screen>,
            <Screen
              key="screen-BuyerWishlist-anon"
              name={BuyerMainRoutes.BUYER_WISHLIST}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="BuyerWishlist"
                  />
                ),
              }}
            >
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.buyerLoginRequired"
                  key="authError-BuyerWishlist-anon"
                />
              )}
            </Screen>,
            <Screen
              key="screen-BuyerProfile-anon"
              name={BuyerMainRoutes.BUYER_PROFILE}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="Profile"
                  />
                ),
              }}
            >
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.loginRequired"
                  key="authError-BuyerProfile-anon"
                />
              )}
            </Screen>,
          ]
        : [
            <Screen
              key="screen-BuyerChat"
              name={BuyerMainRoutes.BUYER_CHAT}
              component={ChatNavigator}
            />,
            <Screen
              key="screen-BuyerCart"
              name={BuyerMainRoutes.BUYER_CART}
              component={MyCartScreen}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader {...props} hideSearch={true} key="header-BuyerCart" />
                ),
              }}
            />,
            <Screen
              key="screen-BuyerWishlist"
              name={BuyerMainRoutes.BUYER_WISHLIST}
              component={MyWishlistScreen}
              options={{
                headerShown: true,
                header: props => <MainScreensHeader {...props} key="header-BuyerWishlist" />,
              }}
            />,
            <Screen
              key="screen-BuyerProfile"
              name={BuyerMainRoutes.BUYER_PROFILE}
              component={BuyerProfileStack}
            />,
          ]}
    </Navigator>
  );
};

const styles = StyleSheet.create({
  iconWithActiveContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -30,
  },
  addButton: {
    borderWidth: 3,
    backgroundColor: '#fff',
    width: 60,
    height: 60,
    borderRadius: 60,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    marginBottom: 20,
  },
  // New styles for rounded top corners of the bottom nav bar
  bottomTabBarContainer: {
    backgroundColor: 'transparent',
  },
  bottomNavigation: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fff',
    // Optionally add shadow for iOS and elevation for Android for a floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
    // To ensure the rounded corners are visible
    overflow: 'hidden',
  },
});
