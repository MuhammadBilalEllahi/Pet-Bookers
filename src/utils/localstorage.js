import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== LEGACY FUNCTIONS (for migration) ====================
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

// ==================== NEW DUAL AUTH FUNCTIONS ====================

// Buyer Auth Functions
export const getBuyerAuthToken = async () => {
  return await AsyncStorage.getItem('buyer-auth-token');
};

export const setBuyerAuthToken = async (data) => {
  return await AsyncStorage.setItem('buyer-auth-token', data);
};

export const delBuyerAuthToken = async () => {
  return await AsyncStorage.removeItem('buyer-auth-token');
};

// Seller Auth Functions
export const getSellerAuthToken = async () => {
  return await AsyncStorage.getItem('seller-auth-token');
};

export const setSellerAuthToken = async (data) => {
  return await AsyncStorage.setItem('seller-auth-token', data);
};

export const delSellerAuthToken = async () => {
  return await AsyncStorage.removeItem('seller-auth-token');
};

// Convenience Functions
export const getDualAuthTokens = async () => {
  const [buyerToken, sellerToken] = await Promise.all([
    getBuyerAuthToken(),
    getSellerAuthToken()
  ]);
  return { buyerToken, sellerToken };
};

export const clearAllAuthTokens = async () => {
  await Promise.all([
    delBuyerAuthToken(),
    delSellerAuthToken(),
    delAsyncAuthToken(), // Clean up legacy token
    delAsyncUserType()   // Clean up legacy user type
  ]);
};


