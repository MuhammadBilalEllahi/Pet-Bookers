import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {
  BottomNavigation,
  BottomNavigationTab,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {ThemedIcon} from '../../components/Icon';
import {selectShowBottomTabBar} from '../../store/configs';
import {MainScreensHeader} from '../../components/buyer';
import {selectIfAnonymous} from '../../store/user';

// Screens and Navigation Stacks
import {BuyerHomeStack} from './BuyerHomeStack';
import {ChatNavigator} from '../ChatNavigator';
import {MyWishlistScreen} from '../../screens/buyer/MyWishlistScreen';
import {BuyerProfileStack} from './BuyerProfileStack';
import {MyCartScreen} from '../../screens/buyer/MyCartScreen';
import {AuthRestrictedError} from '../../components/auth/AuthRestrictedError';

// Import the custom icons for all tabs
const homeIcon = require('../../../assets/new/bottom_nav/home.png');
const chatIcon = require('../../../assets/new/bottom_nav/chat.png');
const sellPlusIcon = require('../../../assets/new/bottom_nav/sell_plus.png');
const luckyDrawIcon = require('../../../assets/new/bottom_nav/lucky_draw.png');
const profileUserIcon = require('../../../assets/new/bottom_nav/profile_user.png');

const activeUnderIcon = require('../../../assets/new/bottom_nav/active.png');

const {Navigator, Screen} = createBottomTabNavigator();

// Use a fixed dark grey for icon and black for text
const ICON_DARK_GREY = '#444444';
const TEXT_BLACK = '#000000';

// Ensure text does not wrap by setting flexShrink: 0, flexGrow: 0, minWidth: 0, and allowFontScaling: false
const renderTabIconWithActive = (iconSource, isActive, label, customIconStyle = {}) => (
  <View style={styles.iconWithActiveContainer}>
    <Image
      source={iconSource}
      style={{
        width: 36,
        height: 36,
        resizeMode: 'contain',
        tintColor: ICON_DARK_GREY,
        ...customIconStyle,
      }}
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
      />
    )}
  </View>
);

// Do not change color of plus icon (no tintColor)
const renderAddTabIconWithActive = (isActive, label) => (
  <View style={styles.addButtonContainer}>
    <View
      style={[
        styles.addButton,
        {
          borderColor: 'transparent',
        },
      ]}>
      <Image
        source={sellPlusIcon}
        style={{
          width: 70,
          height: 70,
          resizeMode: 'cover',
          // No tintColor here, so the plus icon keeps its original color
        }}
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
      />
    )}
  </View>
);

const BottomTabBar = ({navigation, state, isAnonymous}) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const showBottomTabBar = useSelector(selectShowBottomTabBar);

  return (
    <View style={styles.bottomTabBarContainer}>
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
        onSelect={index => navigation.navigate(state.routeNames[index])}>
        <BottomNavigationTab
          icon={() =>
            renderTabIconWithActive(
              homeIcon,
              state.index === 0,
              t('tabs.home')
            )
          }
        />
        <BottomNavigationTab
          icon={() =>
            renderTabIconWithActive(
              chatIcon,
              state.index === 1,
              t('tabs.chat')
            )
          }
        />
        <BottomNavigationTab
          icon={() =>
            renderAddTabIconWithActive(
              state.index === 2,
              t(isAnonymous ? 'tabs.sell' : 'tabs.cart')
            )
          }
        />
        <BottomNavigationTab
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
      tabBar={props => <BottomTabBar {...props} isAnonymous={isAnonymous} />}
      screenOptions={{headerShown: false}}>
      <Screen name="BuyerHome" component={BuyerHomeStack} />
      {isAnonymous
        ? [
            <Screen
              key="BuyerChat"
              name="BuyerChat"
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="Chat"
                  />
                ),
              }}>
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.loginRequired"
                />
              )}
            </Screen>,
            <Screen
              key="SellerPostAd"
              name="SellerPostAd"
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="AddProduct"
                  />
                ),
              }}>
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.sellerLoginRequired"
                />
              )}
            </Screen>,
            <Screen
              key="BuyerWishlist"
              name="BuyerWishlist"
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="BuyerWishlist"
                  />
                ),
              }}>
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.buyerLoginRequired"
                />
              )}
            </Screen>,
            <Screen
              key="BuyerProfile"
              name="BuyerProfile"
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={true}
                    title="Profile"
                  />
                ),
              }}>
              {props => (
                <AuthRestrictedError
                  {...props}
                  subTitle="messages.loginRequired"
                />
              )}
            </Screen>,
          ]
        : [
            <Screen
              key="BuyerChat"
              name="BuyerChat"
              component={ChatNavigator}
            />,
            <Screen
              name="BuyerCart"
              component={MyCartScreen}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader {...props} hideSearch={true} />
                ),
              }}
            />,
            <Screen
              key="BuyerWishlist"
              name="BuyerWishlist"
              component={MyWishlistScreen}
              options={{
                headerShown: true,
                header: props => <MainScreensHeader {...props} />,
              }}
            />,
            <Screen
              key="BuyerProfile"
              name="BuyerProfile"
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
