import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import {selectAuthToken, selectUserType, UserType} from '../store/user';
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
  const authToken = useSelector(selectAuthToken);
  const userType = useSelector(selectUserType);
  const {isDark} = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDark ? '#101426' : 'white',
          },
        }}>
        {!authToken ? (
          // Auth Stack
          <>
            <Stack.Screen name={AppScreens.LOGIN} component={LoginScreen} />
            <Stack.Screen name={AppScreens.REGISTER} component={RegisterScreen} />
            <Stack.Screen name={AppScreens.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
          </>
        ) : userType === UserType.BUYER ? (
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