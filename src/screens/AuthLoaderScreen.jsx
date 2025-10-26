import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Layout, Spinner} from '@ui-kitten/components';
import {flexeStyles} from '../utils/globalStyles';
import {
  setAuthToken,
  setUserType,
  UserType,
  loadDualAuthFromStorage,
} from '../store/user';
import {StyleSheet, Image, Dimensions} from 'react-native';
import {AppScreens} from '../navigators/AppNavigator';
import FastImageWithFallback from '../components/common/FastImageWithFallback';
import FastImage from '@d11/react-native-fast-image';
import {SplashScreen} from './SplashScreen';
import {EnhancedSplashScreen} from './EnhancedSplashScreen';

const {width, height} = Dimensions.get('window');

export const AuthLoaderScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [isAuthLoaded, setIsAuthLoaded] = React.useState(false);

  const loadUserToken = async () => {
    try {
      // First, try to load dual auth tokens
      await dispatch(loadDualAuthFromStorage());

      // For backward compatibility, also check legacy tokens
      const token = await AsyncStorage.getItem('auth-token');
      const userType = await AsyncStorage.getItem('user-type');

      if (token && userType) {
        // Set legacy auth for backward compatibility
        dispatch(setAuthToken(token));
        dispatch(setUserType(userType));
      }

      // Mark auth as loaded
      setIsAuthLoaded(true);
    } catch (error) {
      console.error('Error loading auth tokens:', error);
      // Mark auth as loaded even on error
      setIsAuthLoaded(true);
    }
  };

  useEffect(() => {
    // Start loading auth immediately
    loadUserToken();
  }, []);

  const handleAnimationComplete = async () => {
    // Navigate only after both animation and auth are complete
    try {
      const token = await AsyncStorage.getItem('auth-token');
      const userType = await AsyncStorage.getItem('user-type');

      // Navigate based on user type
      if (token && userType) {
        if (userType === UserType.BUYER) {
          navigation.navigate(AppScreens.BUYER_HOME_MAIN);
        } else {
          navigation.navigate(AppScreens.SELLER_HOME_MAIN);
        }
      } else {
        // No legacy auth found, navigate to buyer home as default
        navigation.navigate(AppScreens.BUYER_HOME_MAIN);
      }
    } catch (error) {
      console.error('Error navigating:', error);
      // Default to buyer home on error
      navigation.navigate(AppScreens.BUYER_HOME_MAIN);
    }
  };

  return (
    <EnhancedSplashScreen
      onAnimationComplete={handleAnimationComplete}
      isAuthLoaded={isAuthLoaded}
    />
    // <Layout
    //   level="3"
    //   style={[
    //     flexeStyles.grow1,
    //     flexeStyles.itemsCenter,
    //     flexeStyles.contentCenter,
    //   ]}>
    //   <FastImage
    //     priority={FastImage.priority.high}
    //     resizeMode={FastImage.resizeMode.cover}
    //     source={require('../../assets/new/main_logo.png')}
    //     style={styles.logo}
    //   />
    //   <Spinner size="giant" />
    //   {/* <SplashScreen/> */}
    // </Layout>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 8,
  },
});
