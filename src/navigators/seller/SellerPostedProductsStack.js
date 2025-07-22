import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';

// Screens
import MyPostedAdsScreen from '../../screens/seller/ads/MyPostedAdsScreen';
import {ProductPreviewScreen} from '../../screens/seller/ProductPreviewScreen';
import {ProductDetailScreen} from '../../screens/seller/ads/ProductDetailScreen';
import {EditProductScreen} from '../../screens/seller/EditProductScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerPostedProductsStack = () => {
  return (
    <Navigator
      screenOptions={{
        header: props => <ScreenHeaderSecondary {...props} />,
      }}
      initialRouteName="SellerPostedProductsList">
      <Screen
        name="SellerPostedProductsList"
        component={MyPostedAdsScreen}
        options={{
          header: props => (
            <MainScreensHeader
              {...props}
              title="MyPostedAds"
              hideSearch={true}
              // hideCart={true}
              // hideNotification={true}
              // hideSettings={true}
              // hideWishlist
            />
          ),
        }}
      />
      <Screen
        name="ProductPreview"
        component={ProductPreviewScreen}
        options={{
          title: 'ProductPreview',
        }}
      />
      <Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'ProductDetail',
          header: props => (
            <MainScreensHeader
              {...props}
              title="ProductDetail"
              hideSearch={true}
            />
          ),
        }}
      />
      <Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{
          title: 'EditProduct',
          header: props => (
            <MainScreensHeader
              {...props}
              title="Edit Product"
              hideSearch={true}
            />
          ),
        }}
      />
    </Navigator>
  );
};
