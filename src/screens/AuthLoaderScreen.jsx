import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Layout, Spinner} from '@ui-kitten/components';
import {flexeStyles} from '../utils/globalStyles';
import {
  setAuthToken, 
  setUserType, 
  UserType,
  loadDualAuthFromStorage
} from '../store/user';
import { StyleSheet,Image, Dimensions } from 'react-native';
import { AppScreens } from '../navigators/AppNavigator';

const { width, height } = Dimensions.get('window');


export const AuthLoaderScreen = ({navigation}) => {
  const dispatch = useDispatch();

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
        
        // Navigate based on legacy user type
        if (userType === UserType.BUYER) {
          navigation.navigate(AppScreens.BUYER_HOME_MAIN);
        } else {
          navigation.navigate(AppScreens.SELLER_HOME_MAIN);
        }
      } else {
        // No legacy auth found, navigate to buyer home as default
        // (the AppNavigator will handle showing auth screens if no dual auth exists)
        navigation.navigate(AppScreens.BUYER_HOME_MAIN);
      }
    } catch (error) {
      console.error('Error loading auth tokens:', error);
      // On error, default to buyer home
      navigation.navigate(AppScreens.BUYER_HOME_MAIN);
    }
  };

  useEffect(() => {
    loadUserToken();
  }, []);

  return (
    <Layout
      level="3"
      style={[
        flexeStyles.grow1,
        flexeStyles.itemsCenter,
        flexeStyles.contentCenter,
      ]}>
        <Image
          source={require('../../assets/new/main_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
              <Spinner size="giant" />
      {/* <SplashScreen/> */}
    </Layout>
  );
};

const styles= StyleSheet.create({
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 8,
  },
})
