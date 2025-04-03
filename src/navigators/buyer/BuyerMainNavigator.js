import React from 'react';
import {StyleSheet, View} from 'react-native';
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
import {MainScreensHeader} from '../../components/buyer';
import {selectIfAnonymous} from '../../store/user';

// Screens and Navigation Stacks
import {BuyerHomeStack} from './BuyerHomeStack';
import {ChatNavigator} from '../ChatNavigator';
import {MyWishlistScreen} from '../../screens/buyer/MyWishlistScreen';
import {BuyerProfileStack} from './BuyerProfileStack';
import {MyCartScreen} from '../../screens/buyer/MyCartScreen';
import {AuthRestrictedError} from '../../components/auth/AuthRestrictedError';

const {Navigator, Screen} = createBottomTabNavigator();

const BottomTabBar = ({navigation, state, isAnonymous}) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const showBottomTabBar = useSelector(selectShowBottomTabBar);

  return (
    <BottomNavigation
      selectedIndex={state.index}
      appearance="noIndicator"
      style={{
        position: 'absolute',
        bottom: showBottomTabBar ? 0 : -1000,
        overflow: showBottomTabBar ? 'visible' : 'hidden',
      }}
      onSelect={index => navigation.navigate(state.routeNames[index])}>
      <BottomNavigationTab
        icon={props => <Icon {...props} name="home-outline" />}
        title={t('tabs.home')}
      />
      <BottomNavigationTab
        icon={props => <Icon {...props} name="message-circle-outline" />}
        title={t('tabs.chat')}
      />
      <BottomNavigationTab
        icon={props => (
          <View style={styles.addButtonContainer}>
            <View
              style={[
                styles.addButton,
                {
                  borderColor: theme['color-primary-default'],
                },
              ]}>
              <ThemedIcon
                {...props}
                name={isAnonymous ? 'plus-outline' : 'shopping-cart-outline'}
                fill={state.index === 2 && theme['color-primary-default']}
                iconStyle={{width: 30, height: 30}}
              />
            </View>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 12,
                color:
                  state.index === 2
                    ? theme['color-primary-default']
                    : theme['color-basic-600'],
              }}>
              {t(isAnonymous ? 'tabs.add' : 'tabs.cart')}
            </Text>
          </View>
        )}
      />
      <BottomNavigationTab
        icon={props => <Icon {...props} name="heart-outline" />}
        title={t('tabs.wishlist')}
      />
      <BottomNavigationTab
        icon={props => <Icon {...props} name="person-outline" />}
        title={t('tabs.account')}
      />
    </BottomNavigation>
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
});
