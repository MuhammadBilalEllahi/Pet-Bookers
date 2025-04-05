import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {loadAppConfigs} from '../store/configs';

// Navigators
import {AuthLoaderScreen} from '../screens/AuthLoaderScreen';
import {SplashScreen} from '../screens/SplashScreen';
import {AuthNavigator} from './AuthNavigator';
import {BuyerMainNavigator} from './buyer/BuyerMainNavigator';
import {SellerMainNavigator} from './seller/SellerMainNavigator';
import { LoginScreen } from '../screens/auth/Login';

const {Navigator, Screen} = createNativeStackNavigator();

export const AppNavigator = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadAppConfigs());
  }, []);

  return (
    <NavigationContainer>
      <Navigator
        screenOptions={{headerShown: false, gestureEnabled: false}}
        initialRouteName="Login">
        <Screen name="Splash" component={SplashScreen} />
        <Screen name="Login" component={LoginScreen} />
        <Screen name="AuthLoader" component={AuthLoaderScreen} />
        <Screen name="Auth" component={AuthNavigator} />
        <Screen name="SellerHomeMain" component={SellerMainNavigator} />
        <Screen name="BuyerHomeMain" component={BuyerMainNavigator} />
      </Navigator>
    </NavigationContainer>
  );
};
