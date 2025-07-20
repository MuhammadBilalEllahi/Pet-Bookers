import React, { useEffect, useReducer, useState } from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import {MainScreensHeader} from '../../components/buyer';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';

// Screens
import {SellerHomeMainScreen} from '../../screens/seller/SellerHomeMainScreen';
import {VandorsListScreen} from '../../screens/buyer/VandorsListScreen';
import {VandorDetailScreen} from '../../screens/buyer/VandorDetailScreen';
import {NotificationsScreen} from '../../screens/NotificationsScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';
import {CategoriesListScreen} from '../../screens/buyer/categories/CategoriesListScreen';
import {SubCategoryProductsScreen} from '../../screens/buyer/categories/SubCategoryProductsScreen';
import {ProductPreviewScreen} from '../../screens/seller/ProductPreviewScreen';
import { HomeMainScreen } from '../../screens/buyer/HomeMainScreen';

import { UserType } from '../../store/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductDetailScreen } from '../../screens/buyer/product/ProductDetailScreen';
import { MainScreensHeader } from '../../components/buyer';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerHomeStack = () => {
  const [userType, setUserType]= useState(false);
   useEffect(() => {
    const fetchUserType = async () => {
      const type = await AsyncStorage.getItem('user-type');
      console.log("USER TYPE", type)
      setUserType(type);
    };
    fetchUserType();
  }, []);
  
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
              // hideSearch={tr}
              hideWishlist={false}
              hideCart={false}
              // title="HomeMainScreen"
              title={UserType.SELLER === userType ? 'Seller': UserType.BUYER === userType   ? 'Customer' : 'Guest'}

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
        name="SubCategoryProducts"
        component={SubCategoryProductsScreen}
        options={{
          title: 'SubCategoryProducts',
          header: props=>(<MainScreensHeader {...props }  
            activateGoBack={true}
            />)
        }}
      />
      <Screen name="ProductDetail" component={ProductDetailScreen}
              options={{
                header: props => (
                  <MainScreensHeader
                    {...props}
                    hideSearch={false}
                  />
                ),
                  contentStyle: {
                backgroundColor: 'white'
                
              }
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
              hideNotification={false}
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
