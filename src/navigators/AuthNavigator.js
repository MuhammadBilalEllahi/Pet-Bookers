import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';

// Pages
import { RegisterScreen } from '../screens/auth/Register';
import { LoginScreen } from '../screens/auth/Login';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPassword';

// Auth Route Enum for maintainability and intellisense
export const AuthRoutes = Object.freeze({
  REGISTER: { name: 'Register', component: RegisterScreen },
  LOGIN: { name: 'Login', component: LoginScreen },
  FORGOT_PASSWORD: { name: 'ForgotPassword', component: ForgotPasswordScreen },
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
    </Navigator>
  );
};
