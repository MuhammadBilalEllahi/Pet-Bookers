import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import {AddProductScreen} from '../../screens/seller/AddProductScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {AddProductSuccessScreen} from '../../screens/seller/AddProductSuccessScreen';
import {PaymentMethodScreen} from '../../screens/seller/PaymentMethodScreen';
import {ProductFeatureCheckoutScreen} from '../../screens/seller/ProductFeatureCheckoutScreen';
import {ProductFeatureSuccessScreen} from '../../screens/seller/ProductFeatureSuccessScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerNewProductStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <ScreenHeaderSecondary {...props} />,
      }}
      initialRouteName="AddProduct">
      <Screen name="AddProduct" component={AddProductScreen} />
      <Screen
        name="AddProductSuccess"
        component={AddProductSuccessScreen}
        options={{
          title: 'MakeFeatured',
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
