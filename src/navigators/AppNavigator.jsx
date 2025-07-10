import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {
  selectAuthToken, 
  selectUserType, 
  UserType,
  selectIsBuyerAuthenticated,
  selectIsSellerAuthenticated,
  selectIsAnyAuthenticated
} from '../store/user';
import {useTheme} from '../theme/ThemeContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import BuyerHomeMainScreen from '../screens/buyer/BuyerHomeMainScreen';
import SellerHomeMainScreen from '../screens/seller/SellerHomeMainScreen';

// Define screen names
export const AppScreens = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  BUYER_HOME_MAIN: 'BuyerHomeMain',
  SELLER_HOME_MAIN: 'SellerHomeMain',
};

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  // Legacy auth selectors (for backward compatibility)
  const authToken = useSelector(selectAuthToken);
  const userType = useSelector(selectUserType);
  
  // New dual auth selectors
  const isBuyerAuthenticated = useSelector(selectIsBuyerAuthenticated);
  const isSellerAuthenticated = useSelector(selectIsSellerAuthenticated);
  const isAnyAuthenticated = useSelector(selectIsAnyAuthenticated);
  
  const {isDark} = useTheme();

  // Determine navigation flow based on authentication states
  const getNavigationFlow = () => {
    // If using legacy auth system, maintain backward compatibility
    if (authToken && userType) {
      return userType === UserType.BUYER ? 'BUYER' : 'SELLER';
    }
    
    // For dual auth system, prioritize based on what's available
    if (isBuyerAuthenticated && isSellerAuthenticated) {
      // Both authenticated - default to buyer experience
      return 'BUYER';
    } else if (isBuyerAuthenticated) {
      return 'BUYER';
    } else if (isSellerAuthenticated) {
      return 'SELLER';
    } else {
      return 'AUTH';
    }
  };

  const navigationFlow = getNavigationFlow();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? '#101426' : 'white',
          },
        }}>
        {navigationFlow === 'AUTH' ? (
          // Auth Stack - no authentication
          <>
            <Stack.Screen name={AppScreens.LOGIN} component={LoginScreen} />
            <Stack.Screen name={AppScreens.REGISTER} component={RegisterScreen} />
            <Stack.Screen name={AppScreens.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
          </>
        ) : navigationFlow === 'BUYER' ? (
          // Buyer Stack
          <>
            <Stack.Screen name={AppScreens.BUYER_HOME_MAIN} component={BuyerHomeMainScreen} />
            {/* Add other buyer screens here */}
          </>
        ) : (
          // Seller Stack
          <>
            <Stack.Screen name={AppScreens.SELLER_HOME_MAIN} component={SellerHomeMainScreen} />
            {/* Add other seller screens here */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 