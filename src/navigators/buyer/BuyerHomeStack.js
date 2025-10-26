import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {MainScreensHeader} from '../../components/buyer';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {selectIfAnonymous, selectUserType} from '../../store/user';

// Screens
import {HomeMainScreen} from '../../screens/buyer/HomeMainScreen';

import {VandorsListScreen} from '../../screens/buyer/VandorsListScreen';
import {VandorDetailScreen} from '../../screens/buyer/VandorDetailScreen';
import {NotificationsScreen} from '../../screens/NotificationsScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';
import {CategoriesListScreen} from '../../screens/buyer/categories/CategoriesListScreen';
import {SubCategoryProductsScreen} from '../../screens/buyer/categories/SubCategoryProductsScreen';
import {ProductsSearchScreen} from '../../screens/buyer/ProductsSearchScreen';
import {ProductDetailScreen} from '../../screens/buyer/product/ProductDetailScreen';
import {AllProductsScreen} from '../../screens/buyer/AllProductsScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const BuyerHomeStack = () => {
  const isAnonymous = useSelector(selectIfAnonymous);
  const userType = useSelector(selectUserType);
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <MainScreensHeader {...props} />,
        contentStyle: {
          backgroundColor: 'white',
        },
      }}
      initialRouteName="HomeMainScreen">
      <Screen
        name="HomeMainScreen"
        component={HomeMainScreen}
        options={{
          header: props => (
            <MainScreensHeader
              title={userType}
              hideCart={false}
              hideNotification={false}
              {...props}
            />
          ), // show notification only on home
          contentStyle: {
            backgroundColor: 'white',
          },
        }}
      />
      <Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="ProductDetail"
              hideNotification={true}
            />
          ),
          contentStyle: {
            backgroundColor: 'white',
          },
        }}
      />
      <Screen
        name="ProductsSearch"
        component={ProductsSearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Screen
        name="CategoriesList"
        component={CategoriesListScreen}
        options={{
          title: 'CategoriesList',
          header: props => (
            <MainScreensHeader
              {...props}
              activateGoBack={true}
              hideNotification={true}
            />
          ),
        }}
      />
      <Screen
        name="SubCategoryProducts"
        component={SubCategoryProductsScreen}
        options={{
          title: 'SubCategoryProducts',
          header: props => (
            <MainScreensHeader
              {...props}
              activateGoBack={true}
              hideNotification={true}
            />
          ),
        }}
      />
      <Screen
        name="AllProducts"
        component={AllProductsScreen}
        options={{
          title: 'AllProducts',
          header: props => (
            <MainScreensHeader
              {...props}
              activateGoBack={true}
              hideNotification={true}
            />
          ),
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
              hideNotification={true}
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
              hideNotification={true}
            />
          ),
        }}
      />
      {isAnonymous ? (
        <Screen
          key="Notifications"
          name="Notifications"
          options={{
            header: props => (
              <MainScreensHeader
                {...props}
                hideSearch={false}
                title="Notifications"
                hideNotification={true}
              />
            ),
            title: 'Notifications',
            contentStyle: {
              backgroundColor: 'white',
            },
          }}>
          {props => (
            <AuthRestrictedError {...props} subTitle="messages.loginRequired" />
          )}
        </Screen>
      ) : (
        <Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            header: props => (
              <MainScreensHeader
                {...props}
                hideSearch={false}
                hideCart={true}
                hideWishlist={true}
                hideNotification={true}
                title="Notifications"
              />
            ),
            title: 'Notifications',
            contentStyle: {
              backgroundColor: 'white',
            },
          }}
        />
      )}
      <Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          header: props => (
            <MainScreensHeader
              {...props}
              hideSearch={false}
              title="Settings"
              hideNotification={true}
            />
          ),
          title: 'Settings',
        }}
      />
    </Navigator>
  );
};
