import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';

// Screens
import {SellerHomeMainScreen} from '../../screens/seller/SellerHomeMainScreen';
import {VandorsListScreen} from '../../screens/buyer/VandorsListScreen';
import {VandorDetailScreen} from '../../screens/buyer/VandorDetailScreen';
import {NotificationsScreen} from '../../screens/NotificationsScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';
import {CategoriesListScreen} from '../../screens/buyer/categories/CategoriesListScreen';
import {ProductPreviewScreen} from '../../screens/seller/ProductPreviewScreen';
import { HomeMainScreen } from '../../screens/buyer/HomeMainScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerHomeStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <MainScreensHeader {...props} />,
      }}
      initialRouteName="SellerHomeMainScreen">
      <Screen
        name="SellerHomeMainScreen"
        component={HomeMainScreen}
        options={{
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={true}
              title="HomeMainScreen"
            />
          ),
        }}
      />
      <Screen name="ProductPreview" component={ProductPreviewScreen} />
      <Screen
        name="CategoriesList"
        component={CategoriesListScreen}
        options={{
          title: 'CategoriesList',
          
        }}
      />
      <Screen
        name="VandorsList"
        component={VandorsListScreen}
        options={{
          title: 'VandorsList',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="VandorsList"
            />
          ),
        }}
      />
      <Screen
        name="VandorDetail"
        component={VandorDetailScreen}
        options={{
          title: 'VandorDetail',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="VandorDetail"
            />
          ),
        }}
      />
      <Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="Notifications"
            />
          ),
        }}
      />
      <Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'Settings',
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="Settings"
            />
          ),
        }}
      />
    </Navigator>
  );
};
