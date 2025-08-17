import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MainScreensHeader} from '../../components/buyer';

// Screens
import {UnifiedProfileScreen} from '../../screens/profile/UnifiedProfileScreen';
import {UpdatePasswordScreen} from '../../screens/profile/UpdatePasswordScreen';
import {ScreenHeaderSecondary} from '../../components/ScreenHeaderSecondary';
import {UpdateProfileScreen} from '../../screens/profile/UpdateProfileScreen';
import {MyOrders} from '../../screens/buyer/product/MyOrders';
import { SellerForgotPasswordScreen } from '../../screens/seller/SellerForgotPasswordScreen';
import { SellerVerifyOTPScreen } from '../../screens/seller/SellerVerifyOTPScreen';
import { SellerResetPasswordScreen } from '../../screens/seller/SellerResetPasswordScreen';
import {AppSettingsScreen} from '../../screens/AppSettingsScreen';

const {Navigator, Screen} = createNativeStackNavigator();

export const SellerProfileStack = () => {
  return (
    <Navigator
      screenOptions={{
        gestureEnabled: false,
        header: props => <MainScreensHeader {...props} />,
      }}
      initialRouteName="SellerProfileMain">
      <Screen
        name="SellerProfileMain"
        component={UnifiedProfileScreen}
        options={{
          header: props => (
            <MainScreensHeader {...props} title="Profile" hideSearch={true} />
          ),
        }}
      />
      <Screen
        name="MyOrders"
        component={MyOrders}
        options={{
          title: 'MyOrders',
        }}
      />
      <Screen
        name="UpdateProfile"
        component={UpdateProfileScreen}
        options={{
          title: 'UpdateProfile',
        }}
      />
      <Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{
          title: 'UpdatePassword',
        }}
      />
      <Screen
        name="SellerForgotPassword"
        component={SellerForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
        }}
      />
      <Screen
        name="SellerVerifyOTP"
        component={SellerVerifyOTPScreen}
        options={{
          title: 'Verify OTP',
        }}
      />
      <Screen
        name="SellerResetPassword"
        component={SellerResetPasswordScreen}
        options={{
          title: 'Reset Password',
        }}
      />
    
      <Screen
        name="AppSettings"
        component={AppSettingsScreen}
        options={{
          title: 'Settings',
          header: props => (
            <MainScreensHeader {...props} title="App Settings" hideSearch={true} activateGoBack={true} hideCart={true} hideWishlist={true} hideNotification={true} hideSettings={true} />
          ),
        }}
      />
    </Navigator>
  );
};
