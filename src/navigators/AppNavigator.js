import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { loadAppConfigs } from '../store/configs';

// Navigators
import { AuthLoaderScreen } from '../screens/AuthLoaderScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { BuyerMainNavigator, BuyerMainRoutes } from './buyer/BuyerMainNavigator';
import { SellerMainNavigator } from './seller/SellerMainNavigator';
import { LoginScreen } from '../screens/auth/Login';
import { RegisterScreen } from '../screens/auth/Register';
import LuckyDrawInstance from '../screens/buyer/luckydraw/LuckyDrawInstance';
import ShipingDetails from '../screens/buyer/checkout/ShipingDetails';
import PaymentPage from '../screens/buyer/checkout/PaymentPage';
import { MyCartScreen } from '../screens/buyer/checkout/MyCartScreen';
import MyPostedAdsScreen from '../screens/seller/ads/MyPostedAdsScreen';
import { ProductDetailScreen } from '../screens/seller/ads/ProductDetailScreen';
import { ProductDetailScreen as ProductDetailScreenBuyer } from '../screens/buyer/product/ProductDetailScreen';
import { MainScreensHeader } from '../components/buyer';
import { EditProductScreen } from '../screens/seller/EditProductScreen';
import { FarmDetailsEditScreen } from '../screens/seller/profile/farmdetails/FarmDetailsEditScreen';
import { SellerPostedProductsStack } from './seller/SellerPostedProductsStack';
import { MyWishlistScreen } from '../screens/buyer/product/MyWishlistScreen';
import { MyOrderList, MyOrders } from '../screens/buyer/product/MyOrders';
import { AddressListScreen } from '../screens/profile/AddressListScreen';
import { AddAddressScreen } from '../screens/profile/AddAddressScreen';
import { EditAddressScreen } from '../screens/profile/EditAddressScreen';
import { ChatNavigator, ChatRoutes } from './ChatNavigator';
import { MessagesScreen } from '../screens/MessagesScreen';
import { SellerInfoScreen } from '../screens/seller/profile/farmdetails/SellerInfoScreen';
import { VandorDetailScreen } from '../screens/buyer/VandorDetailScreen';
import { RefundScreen } from '../screens/buyer/product/RefundScreen';
import { AddProductScreen } from '../screens/seller/add_product/AddProductScreen';
import { AllProductsScreen } from '../screens/buyer/AllProductsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RefundHandle } from '../screens/seller/profile/farmdetails/pages/RefundHandle';

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
  MY_ORDER_LIST: 'MyOrderList',
  LUCKYDRAW_INSTANCE: 'LuckyDrawInstance',
  SHIPING_DETAILS: 'ShipingDetails',
  PAYMENT_PAGE: 'PaymentPage',
  CART: 'MyCartScreen',
  MY_POSTED_ADS: 'MyPostedAdsScreen',
  PRODUCT_DETAIL: 'ProductDetail',
  PRODUCT_DETAIL_EDIT: 'ProductDetailEdit',
  FARM_DETAILS_EDIT: 'FarmDetailsEdit',
  MY_WISHLIST: 'MyWishlist',  
  PRODUCT_DETAIL_BUYER: 'ProductDetailBuyer',
  ADDRESS_LIST: 'AddressList',
  ADD_ADDRESS: 'AddAddress',
  EDIT_ADDRESS: 'EditAddress',
  SELLER_INFO: 'SellerInfoScreen',
  VANDOR_DETAIL: 'VandorDetailScreen',  
  REFUND_SCREEN: 'RefundScreen',
  SELLER_ADD_PRODUCT: 'AddProductScreen',
  ALL_PRODUCTS: 'AllProductsScreen',
  NOTIFICATIONS: 'NotificationsScreen',
  REFUND_HANDLE: 'RefundHandle',
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
        <Screen name={AppScreens.SELLER_ADD_PRODUCT} component={AddProductScreen} />
        {/* <Screen name={AppScreens.NOTIFICATIONS} component={NotificationsScreen} 
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-NotificationsScreen" />
          ),
        }} /> */}
        <Screen name={AppScreens.ALL_PRODUCTS} component={AllProductsScreen} 
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-AllProductsScreen" />
          ),
        }}
        />
        <Screen name={AppScreens.CART} component={MyCartScreen} 
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-MyCartScreen" />
          ),
        }}
        />
        <Screen name={AppScreens.MY_WISHLIST} component={MyWishlistScreen}
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-MyWishlistScreen" />
          ),
        }}
        />
        <Screen name={AppScreens.MY_ORDER_LIST} component={MyOrderList}
          options={
            {
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-MyOrderListScreen" />
              ),
            }
          } />
{/* <Screen name={SellerTabRoutes.MY_POSTED_ADS} component={SellerPostedProductsStack} /> */}
        <Screen name={AppScreens.MY_POSTED_ADS} component={SellerPostedProductsStack} 
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-MyPostedAdsScreen" />
          ),
        }}
        />
        <Screen name={AppScreens.VANDOR_DETAIL} component={VandorDetailScreen}
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-VandorDetailScreen" />
          ),
        }}
        />
        <Screen name={ChatRoutes.ROOMS_LIST} component={ChatNavigator} />
        <Screen name={ChatRoutes.MESSAGES} component={MessagesScreen} />
        <Screen
            key="screen-BuyerWishlist"
            name={BuyerMainRoutes.BUYER_WISHLIST}
            component={MyWishlistScreen}
            options={{
              headerShown: true,
              header: props => <MainScreensHeader activateGoBack={true} {...props} hideWishlist={true}
               title="My Wishlist" key="header-BuyerWishlist" />,
            }}
          />
          <Screen name={AppScreens.ADDRESS_LIST} component={AddressListScreen}
          options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-AddressListScreen" />
              ),
            }}
          />
          <Screen name={AppScreens.ADD_ADDRESS} component={AddAddressScreen}
          options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-AddAddressScreen" />
              ),
            }}
          />
          <Screen name={AppScreens.EDIT_ADDRESS} component={EditAddressScreen}
          options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-EditAddressScreen" />
              ),
            }}
          />

        <Screen name={AppScreens.PRODUCT_DETAIL} component={ProductDetailScreen}
        options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-ProductDetailScreen" />
              ),
            }} />
        <Screen name={AppScreens.PRODUCT_DETAIL_BUYER} component={ProductDetailScreenBuyer}
        options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-ProductDetailScreenBuyer" />
              ),
            }} />
        <Screen name={AppScreens.PRODUCT_DETAIL_EDIT} component={EditProductScreen} options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader {...props} hideSearch={true} key="header-EditProductScreen" />
              ),
            }} />
        <Screen name={AppScreens.FARM_DETAILS_EDIT} component={FarmDetailsEditScreen} options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader {...props} hideSearch={true} key="header-FarmDetailsEditScreen" />
              ),
            }} />
              <Screen
        name={AppScreens.REFUND_HANDLE}
        component={RefundHandle}
        options={{
          headerShown: true,
          header: props => (
            <MainScreensHeader
            activateGoBack={true}
             {...props} title="Refund Management" hideSearch={true} />
          ),
          
        }}
      />
        <Screen name={AppScreens.SELLER_INFO} component={SellerInfoScreen}
  options={{
    headerShown: true,
    header: props => (
      <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-SellerInfoScreen" />
    ),
  }}
/>
        <Screen
              key="screen-ShipingDetails"
              name={AppScreens.SHIPING_DETAILS}
              component={ShipingDetails}
              options={{
                headerShown: true,
                header: props => (
                  <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-ShipingDetails" />
                ),
              }}
            />
            <Screen
            key="screen-LuckyDrawInstance"
            name={AppScreens.LUCKYDRAW_INSTANCE}
            component={LuckyDrawInstance}
            options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-LuckyDrawInstance" />
              ),
            }}
          />
          <Screen
            key="screen-PaymentPage"
            name={AppScreens.PAYMENT_PAGE}
            component={PaymentPage}
            options={{
              headerShown: true,
              header: props => (
                <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-PaymentPage" />
              ),
            }}
          />
          <Screen name={AppScreens.REFUND_SCREEN} component={RefundScreen}
  options={{
    headerShown: true,
    header: props => (
      <MainScreensHeader activateGoBack={true} {...props} hideSearch={true} key="header-RefundScreen" />
    ),
  }}
/>

      </Navigator>
      
    </NavigationContainer>
  );
};