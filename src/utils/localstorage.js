import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAsyncAuthToken = async () => {
  return await AsyncStorage.getItem('auth-token');
};

export const setAsyncAuthToken = async (data) => {
  return await AsyncStorage.setItem('auth-token',data);
};

export const getAsyncUserType = async () => {
  return await AsyncStorage.getItem('user-type');
};

export const setAsyncUserType = async (data) => {
  return await AsyncStorage.setItem('user-type',data);
};


export const delAsyncAuthToken = async () => {
  return await AsyncStorage.removeItem('auth-token');
};

export const delAsyncUserType = async () => {
  return await AsyncStorage.removeItem('user-type');
};


