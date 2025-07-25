import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';

// Pages
import { RegisterScreen } from '../screens/auth/Register';
import { LoginScreen } from '../screens/auth/Login';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPassword';
import { VerifyOTPScreen } from '../screens/auth/VerifyOTP';
import { ResetPasswordScreen } from '../screens/auth/ResetPassword';
import { SellerForgotPasswordScreen } from '../screens/seller/SellerForgotPasswordScreen';
import { SellerVerifyOTPScreen } from '../screens/seller/SellerVerifyOTPScreen';
import { SellerResetPasswordScreen } from '../screens/seller/SellerResetPasswordScreen';

// Auth Route Enum for maintainability and intellisense
export const AuthRoutes = Object.freeze({
  REGISTER: { name: 'Register', component: RegisterScreen },
  LOGIN: { name: 'Login', component: LoginScreen },
  FORGOT_PASSWORD: { name: 'ForgotPassword', component: ForgotPasswordScreen },
  VERIFY_OTP: { name: 'VerifyOTP', component: VerifyOTPScreen },
  RESET_PASSWORD: { name: 'ResetPassword', component: ResetPasswordScreen },
  SELLER_FORGOT_PASSWORD: { name: 'SellerForgotPassword', component: SellerForgotPasswordScreen },
  SELLER_VERIFY_OTP: { name: 'SellerVerifyOTP', component: SellerVerifyOTPScreen },
  SELLER_RESET_PASSWORD: { name: 'SellerResetPassword', component: SellerResetPasswordScreen },
});

const { Navigator, Screen } = createNativeStackNavigator();

/**
 * AuthNavigator
 * Handles navigation for authentication-related screens.
 * Accepts optional params (e.g., isItSeller) for contextual navigation.
 */
export const AuthNavigator = () => {
  // Extract params if passed (e.g., from AuthRestrictedError)
  const route = useRoute();
  const { isItSeller } = route.params || {};

  // If you need to pass isItSeller to screens, use initialParams or screenOptions as needed.
  // For now, just log for debugging (remove in production).
  if (__DEV__ && typeof isItSeller !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('[AuthNavigator] isItSeller param:', isItSeller);
  }

  return (
    <Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
                  // contentStyle: { backgroundColor: 'white' }

      }}
      initialRouteName={AuthRoutes.LOGIN.name}
    >
      <Screen
        name={AuthRoutes.REGISTER.name}
        component={AuthRoutes.REGISTER.component}
        initialParams={{ isItSeller }} // Uncomment if RegisterScreen needs this param
      />
      <Screen
        name={AuthRoutes.LOGIN.name}
        component={AuthRoutes.LOGIN.component}
        initialParams={{ isItSeller }} // Uncomment if LoginScreen needs this param
      />
      <Screen
        name={AuthRoutes.FORGOT_PASSWORD.name}
        component={AuthRoutes.FORGOT_PASSWORD.component}
      />
      <Screen
        name={AuthRoutes.VERIFY_OTP.name}
        component={AuthRoutes.VERIFY_OTP.component}
      />
      <Screen
        name={AuthRoutes.RESET_PASSWORD.name}
        component={AuthRoutes.RESET_PASSWORD.component}
      />
      <Screen
        name={AuthRoutes.SELLER_FORGOT_PASSWORD.name}
        component={AuthRoutes.SELLER_FORGOT_PASSWORD.component}
      />
      <Screen
        name={AuthRoutes.SELLER_VERIFY_OTP.name}
        component={AuthRoutes.SELLER_VERIFY_OTP.component}
      />
      <Screen
        name={AuthRoutes.SELLER_RESET_PASSWORD.name}
        component={AuthRoutes.SELLER_RESET_PASSWORD.component}
      />
    </Navigator>
  );
};
