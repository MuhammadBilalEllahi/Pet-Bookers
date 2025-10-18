import axios from 'axios';
import {BASE_URL, BUYER_API, SELLER_API} from './constants';
import {
  getAsyncAuthToken,
  getBuyerAuthToken,
  getSellerAuthToken,
} from './localstorage';

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
    Promise.reject(error);
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
    Promise.reject(error);
  },
);
