import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  return await AsyncStorage.getItem('auth-token');
};
