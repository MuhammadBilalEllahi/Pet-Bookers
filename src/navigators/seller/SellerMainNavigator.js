import React from 'react';
import {StyleSheet, View, Image} from 'react-native';
import {useTranslation} from 'react-i18next';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useSelector} from 'react-redux';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Text,
  useTheme,
} from '@ui-kitten/components';
import {ThemedIcon} from '../../components/Icon';
import {selectShowBottomTabBar} from '../../store/configs';
import {useTheme as useCustomTheme} from '../../theme/ThemeContext';
import {CommonActions} from '@react-navigation/native';

// Screens and Navigation Stacks
import {SellerHomeStack} from './SellerHomeStack';
import {ChatNavigator} from '../ChatNavigator';
import {SellerNewProductStack} from './SellerNewProductStack';
import {SellerProfileStack} from './SellerProfileStack';
import {SellerPostedProductsStack} from './SellerPostedProductsStack';
import {BuyerMainRoutes} from '../buyer/BuyerMainNavigator';
import LuckyDrawListScreen from '../../screens/buyer/luckydraw/LuckyDrawListScreen';
import {MainScreensHeader} from '../../components/buyer';
import {selectIsSeller} from '../../store/user';
import {AuthRestrictedError} from '../../components/auth/AuthRestrictedError';

const {Navigator, Screen} = createBottomTabNavigator();

// Enum for Seller Tab Navigation
export const SellerTabRoutes = Object.freeze({
  HOME: 'SellerHome',
  CHAT: 'SellerChat',
  POST_AD: 'SellerPostAd',
  MY_POSTED_ADS: 'MyPostedAds',
  PROFILE: 'SellerProfile',
});

const homeIcon = require('../../../assets/new/bottom_nav/home.png');
const chatIcon = require('../../../assets/new/bottom_nav/chat.png');
const sellPlusIcon = require('../../../assets/new/bottom_nav/sell_plus.png');
const myAdsIcon = require('../../../assets/new/bottom_nav/my_adds.png');
const profileUserIcon = require('../../../assets/new/bottom_nav/profile_user.png');
const activeUnderIcon = require('../../../assets/new/bottom_nav/active.png');
const luckyDrawIcon = require('../../../assets/new/bottom_nav/lucky_draw.png');
const ICON_DARK_GREY = '#444444';
const TEXT_BLACK = '#000000';
const ORANGE_ACCENT = '#FF6B00';

const renderTabIconWithActive = (
  iconSource,
  isActive,
  label,
  customIconStyle = {},
) => {
  const {isDark} = useCustomTheme();

  return (
    <View
      style={styles.iconWithActiveContainer}
      key={`iconWithActiveContainer-${label}`}>
      <Image
        source={iconSource}
        style={{
          width: 36,
          height: 36,
          resizeMode: 'contain',
          tintColor: isActive
            ? ORANGE_ACCENT
            : isDark
            ? '#FFFFFF'
            : ICON_DARK_GREY,
          ...customIconStyle,
        }}
        key={`icon-image-${label}`}
      />
      <Text
        style={{
          fontWeight: '700',
          fontSize: 12,
          color: isDark ? '#FFFFFF' : TEXT_BLACK,
          marginTop: 2,
          flexShrink: 0,
          flexGrow: 0,
          minWidth: 0,
        }}
        numberOfLines={1}
        ellipsizeMode="clip"
        allowFontScaling={false}
        key={`icon-label-${label}`}>
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
            tintColor: ORANGE_ACCENT,
          }}
          key={`icon-active-underline-${label}`}
        />
      )}
    </View>
  );
};

const renderAddTabIconWithActive = (isActive, label) => {
  const {isDark} = useCustomTheme();

  return (
    <View style={styles.addButtonContainer} key={`addButtonContainer-${label}`}>
      <View
        style={[
          styles.addButton,
          {
            borderColor: 'transparent',
            backgroundColor: isDark ? '#1F1F1F' : '#fff',
          },
        ]}
        key={`addButton-${label}`}>
        <Image
          source={sellPlusIcon}
          style={{
            width: 70,
            height: 70,
            resizeMode: 'cover',
            tintColor: ORANGE_ACCENT,
          }}
          key={`addButton-image-${label}`}
        />
      </View>
      <Text
        style={{
          fontWeight: '700',
          fontSize: 12,
          color: isDark ? '#FFFFFF' : TEXT_BLACK,
          marginTop: 2,
          flexShrink: 0,
          flexGrow: 0,
          minWidth: 0,
        }}
        numberOfLines={1}
        ellipsizeMode="clip"
        allowFontScaling={false}
        key={`addButton-label-${label}`}>
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
            tintColor: ORANGE_ACCENT,
          }}
          key={`addButton-active-underline-${label}`}
        />
      )}
    </View>
  );
};

const BottomTabBar = ({navigation, state}) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const showBottomTabBar = useSelector(selectShowBottomTabBar);
  const {isDark} = useCustomTheme();

  const handleTabPress = index => {
    const routeName = state.routeNames[index];
    const stackKey = state.routes[index].key;
    navigation.navigate({
      name: routeName,
      key: stackKey,
      merge: true,
    });
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{name: routeName}],
      }),
    );
  };

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
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
        ]}
        onSelect={handleTabPress}
        key="bottomNavigation">
        <BottomNavigationTab
          key="tab-home"
          icon={() =>
            renderTabIconWithActive(homeIcon, state.index === 0, t('tabs.home'))
          }
        />
        <BottomNavigationTab
          key="tab-chat"
          icon={() =>
            renderTabIconWithActive(chatIcon, state.index === 1, t('tabs.chat'))
          }
        />
        <BottomNavigationTab
          key="tab-add"
          icon={() =>
            renderAddTabIconWithActive(state.index === 2, t('tabs.sell'))
          }
        />
        <BottomNavigationTab
          key="tab-luckydraw"
          icon={() =>
            renderTabIconWithActive(
              luckyDrawIcon,
              state.index === 3,
              t('tabs.luckydraw'),
            )
          }
        />

        <BottomNavigationTab
          key="tab-profile"
          icon={() =>
            renderTabIconWithActive(
              profileUserIcon,
              state.index === 4,
              t('tabs.account'),
            )
          }
        />
      </BottomNavigation>
    </View>
  );
};

export const SellerMainNavigator = () => {
  return (
    <Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Screen name={SellerTabRoutes.HOME} component={SellerHomeStack} />
      <Screen name={SellerTabRoutes.CHAT} component={ChatNavigator} />

      <Screen
        name={SellerTabRoutes.POST_AD}
        component={SellerNewProductStack}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Screen
        // key="screen-BuyerLuckyDraw"
        name={BuyerMainRoutes.BUYER_LUCKYDRAW}
        component={LuckyDrawListScreen}
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={true}
              key="header-BuyerLuckyDraw"
            />
          ),
        }}
      />

      <Screen name={SellerTabRoutes.PROFILE} component={SellerProfileStack} />
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
  bottomTabBarContainer: {
    backgroundColor: 'transparent',
  },
  bottomNavigation: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
    overflow: 'hidden',
  },
});
