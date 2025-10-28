import axios from 'axios';
import {BASE_URL, BUYER_API, SELLER_API} from './constants';
import {
  getAsyncAuthToken,
  getBuyerAuthToken,
  getSellerAuthToken,
} from './localstorage';
import {store} from '../store';
import {logoutBuyer, logoutSeller} from '../store/user';
import Toast from 'react-native-toast-message';

// https://petbookers.com.pk/customer/auth/login

/**
 * /api/v1/
 */
export const axiosBuyerClient = axios.create({
  baseURL: `${BASE_URL}${BUYER_API}`,
});
/**
 * /api/v3/seller/
 */
export const axiosSellerClient = axios.create({
  baseURL: `${BASE_URL}${SELLER_API}`,
});

// export const axiosCustomerClient = axios.create({
//   baseURL: `${BASE_URL}${CUSTOMER_API}`,
// });

// ==================== BUYER CLIENT INTERCEPTOR ====================
axiosBuyerClient.interceptors.request.use(
  async config => {
    // First try to get buyer-specific token
    let token = await getBuyerAuthToken();

    // If no buyer token, fallback to legacy token for migration compatibility
    if (!token) {
      token = await getAsyncAuthToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Buyer Request Error:', error);
    return Promise.reject(error);
  },
);

// ==================== SELLER CLIENT INTERCEPTOR ====================
axiosSellerClient.interceptors.request.use(
  async config => {
    // First try to get seller-specific token
    let token = await getSellerAuthToken();

    // If no seller token, fallback to legacy token for migration compatibility
    if (!token) {
      token = await getAsyncAuthToken();
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Seller Request Error:', error);
    return Promise.reject(error);
  },
);

// ==================== BUYER RESPONSE INTERCEPTOR ====================
axiosBuyerClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Buyer API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: error.config,
    });

    // Handle 401 Unauthorized errors - Session expired
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      const errorCode =
        errorData && typeof errorData === 'object'
          ? Object.keys(errorData)[0]
          : null;

      // Check if this is the specific "session token does not authorize you any more" error
      if (
        errorCode === 'auth-001' ||
        (errorData &&
          typeof errorData === 'object' &&
          errorData[errorCode]?.includes('authorize'))
      ) {
        // Logout buyer and clear tokens
        store.dispatch(logoutBuyer());

        // Show toast notification
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please sign in again as a buyer.',
          visibilityTime: 4000,
        });
      }
    }

    return Promise.reject(error);
  },
);

// ==================== SELLER RESPONSE INTERCEPTOR ====================
axiosSellerClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('Seller API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: error.config,
    });

    // Handle 401 Unauthorized errors - Session expired
    if (error.response?.status === 401) {
      const errorData = error.response?.data;
      const errorCode =
        errorData && typeof errorData === 'object'
          ? Object.keys(errorData)[0]
          : null;

      // Check if this is the specific "session token does not authorize you any more" error
      if (
        errorCode === 'auth-001' ||
        (errorData &&
          typeof errorData === 'object' &&
          errorData[errorCode]?.includes('authorize'))
      ) {
        // Logout seller and clear tokens
        store.dispatch(logoutSeller());

        // Show toast notification
        Toast.show({
          type: 'error',
          text1: 'Session Expired',
          text2: 'Your session has expired. Please sign in again as a seller.',
          visibilityTime: 4000,
        });
      }
    }

    return Promise.reject(error);
  },
);
