import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Layout, Spinner} from '@ui-kitten/components';
import {flexeStyles} from '../utils/globalStyles';
import {setAuthToken, setUserType} from '../store/user';
import { SplashScreen } from './SplashScreen';

export const AuthLoaderScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const loadUserToken = async () => {
    try {
      const token = await AsyncStorage.getItem('auth-token');
      const userType = await AsyncStorage.getItem('user-type');
      if (!token || !userType) {
        throw new Error('No auth data found.');
      }

      dispatch(setAuthToken(token));
      dispatch(setUserType(userType));
      if (userType === 'buyer') {
        navigation.navigate('BuyerHomeMain');
      } else {
        navigation.navigate('SellerHomeMain');
      }
    } catch (error) {
      navigation.navigate('BuyerHomeMain');
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
      <Spinner size="giant" />
      {/* <SplashScreen/> */}
    </Layout>
  );
};
