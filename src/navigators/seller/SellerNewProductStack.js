import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import {AddProductScreen} from '../../screens/seller/add_product/AddProductScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {PaymentMethodScreen} from '../../screens/seller/PaymentMethodScreen';
import {ProductFeatureCheckoutScreen} from '../../screens/seller/ProductFeatureCheckoutScreen';
import {ProductFeatureSuccessScreen} from '../../screens/seller/ProductFeatureSuccessScreen';
import { ScreenHeaderAd } from '../../components/ScreenHeaderAd';
import { MainScreensHeader } from '../../components/buyer';
import AddProductSuccessAndShowFeaturedButton from '../../screens/seller/add_product/AddProductSuccessAndShowFeaturedButton';
import { AddProductSuccessScreen } from '../../screens/seller/add_product/AddProductSuccessScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerNewProductStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <MainScreensHeader {...props} />,
      }}
      initialRouteName="AddProduct">
      <Screen name="CreateYourAd" component={AddProductScreen}
       />
      <Screen
        name="AddProductSuccess"
        component={AddProductSuccessScreen}
        options={{
          title: 'MakeFeatured',
        }}
      />
      <Screen
        name="AddProductSuccessAndShowFeaturedButton"
        component={AddProductSuccessAndShowFeaturedButton}
        options={{
          title: 'Success',
        }}
      />
      <Screen
        name="PaymentMethodSelection"
        component={PaymentMethodScreen}
        options={{
          title: 'PaymentMethodSelection',
        }}
      />
      <Screen
        name="ProductFeatureCheckout"
        component={ProductFeatureCheckoutScreen}
        options={{
          title: 'Checkout',
        }}
      />
      <Screen
        name="ProductFeatureSuccess"
        component={ProductFeatureSuccessScreen}
        options={{
          title: 'FeaturedSuccessfully',
        }}
      />
    </Navigator>
  );
};

