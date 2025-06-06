import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { loadAppConfigs } from '../store/configs';

// Navigators
import { AuthLoaderScreen } from '../screens/AuthLoaderScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { BuyerMainNavigator } from './buyer/BuyerMainNavigator';
import { SellerMainNavigator } from './seller/SellerMainNavigator';
import { LoginScreen } from '../screens/auth/Login';
import { RegisterScreen } from '../screens/auth/Register';
import LuckyDrawInstance from '../screens/buyer/luckydraw/LuckyDrawInstance';
import ShipingDetails from '../screens/buyer/checkout/ShipingDetails';
import PaymentPage from '../screens/buyer/checkout/PaymentPage';
import { MyCartScreen } from '../screens/buyer/checkout/MyCartScreen';
import { MyPostedAdsScreen } from '../screens/seller/ads/MyPostedAdsScreen';
import { ProductDetailScreen } from '../screens/seller/ads/ProductDetailScreen';
import { MainScreensHeader } from '../components/buyer';
import { EditProductScreen } from '../screens/seller/EditProductScreen';

const { Navigator, Screen } = createNativeStackNavigator();

// Enum for App Screens
export const AppScreens = Object.freeze({
  SPLASH: 'Splash',
  LOGIN: 'Login',
  REGISTER: 'Register',
  AUTH_LOADER: 'AuthLoader',
  AUTH: 'Auth',
  SELLER_HOME_MAIN: 'SellerHomeMain',
  BUYER_HOME_MAIN: 'BuyerHomeMain',
  
  LUCKYDRAW_INSTANCE: 'LuckyDrawInstance',
  SHIPING_DETAILS: 'ShipingDetails',
  PAYMENT_PAGE: 'PaymentPage',
  CART: 'MyCartScreen',
  MY_POSTED_ADS: 'MyPostedAdsScreen',
  PRODUCT_DETAIL: 'ProductDetail',
  PRODUCT_DETAIL_EDIT: 'ProductDetailEdit',

});

export const AppNavigator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadAppConfigs());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Navigator
      
        screenOptions={{ headerShown: false, gestureEnabled: false,
                      // cardStyle: { backgroundColor: '#fff' },

        //   contentStyle: {
        //   backgroundColor: 'white'
          
        // }
       }}
        
        initialRouteName={AppScreens.AUTH_LOADER}
      >
        <Screen name={AppScreens.SPLASH} component={SplashScreen} />
        <Screen name={AppScreens.LOGIN} component={LoginScreen} />
        <Screen name={AppScreens.REGISTER} component={RegisterScreen} />
        <Screen name={AppScreens.AUTH_LOADER} component={AuthLoaderScreen} />
        <Screen name={AppScreens.AUTH} component={AuthNavigator} />
        <Screen name={AppScreens.SELLER_HOME_MAIN} component={SellerMainNavigator} />
        <Screen name={AppScreens.BUYER_HOME_MAIN} component={BuyerMainNavigator} />
        <Screen name={AppScreens.CART} component={MyCartScreen} />

        <Screen name={AppScreens.MY_POSTED_ADS} component={MyPostedAdsScreen} />
        <Screen name={AppScreens.PRODUCT_DETAIL} component={ProductDetailScreen} />
        <Screen name={AppScreens.PRODUCT_DETAIL_EDIT} component={EditProductScreen} options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader {...props} hideSearch={true} key="header-EditProductScreen" />
              ),
            }} />
        
        <Screen
              key="screen-ShipingDetails"
              name={AppScreens.SHIPING_DETAILS}
              component={ShipingDetails}
            />
            <Screen
            key="screen-LuckyDrawInstance"
            name={AppScreens.LUCKYDRAW_INSTANCE}
            component={LuckyDrawInstance}
            // options={{
            //   headerShown: true,
            //   header: props => (
            //     <MainScreensHeader {...props} hideSearch={true} key="header-LuckyDrawInstance" />
            //   ),
            // }}
          />
          <Screen
            key="screen-PaymentPage"
            name={AppScreens.PAYMENT_PAGE}
            component={PaymentPage}
          />

      </Navigator>
      
    </NavigationContainer>
  );
};