import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Pages
import {RegisterScreen} from '../screens/auth/Register';
import {LoginScreen} from '../screens/auth/Login';
import {ForgotPasswordScreen} from '../screens/auth/ForgotPassword';

const {Navigator, Screen} = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Navigator
      screenOptions={{headerShown: false, gestureEnabled: false}}
      initialRouteName="Login">
      <Screen name="Register" component={RegisterScreen} />
      <Screen name="Login" component={LoginScreen} />
      <Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Navigator>
  );
};
