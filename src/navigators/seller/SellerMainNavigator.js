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

// Screens and Navigation Stacks
import {SellerHomeStack} from './SellerHomeStack';
import {ChatNavigator} from '../ChatNavigator';
import {SellerNewProductStack} from './SellerNewProductStack';
import {SellerProfileStack} from './SellerProfileStack';
import {SellerPostedProductsStack} from './SellerPostedProductsStack';

const {Navigator, Screen} = createBottomTabNavigator();

const BottomTabBar = ({navigation, state}) => {
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
                name="plus-outline"
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
              {t('tabs.add')}
            </Text>
          </View>
        )}
      />
      <BottomNavigationTab
        icon={props => <Icon {...props} name="plus-square-outline" />}
        title={t('tabs.myads')}
      />
      <BottomNavigationTab
        icon={props => <Icon {...props} name="person-outline" />}
        title={t('tabs.account')}
      />
    </BottomNavigation>
  );
};

export const SellerMainNavigator = () => {
  return (
    <Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Screen name="SellerHome" component={SellerHomeStack} />
      <Screen name="SellerChat" component={ChatNavigator} />
      <Screen
        name="SellerPostAd"
        component={SellerNewProductStack}
        options={{
          unmountOnBlur: true,
        }}
      />
      <Screen name="MyPostedAds" component={SellerPostedProductsStack} />
      <Screen name="SellerProfile" component={SellerProfileStack} />
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
