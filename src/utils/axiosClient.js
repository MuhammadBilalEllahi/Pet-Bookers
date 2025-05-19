import axios from 'axios';
import {BASE_URL, BUYER_API,  SELLER_API} from './constants';
import {getAsyncAuthToken} from './localstorage';
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



axiosBuyerClient.interceptors.request.use(
  async config => {
    const token = await getAsyncAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  },
);

axiosSellerClient.interceptors.request.use(
  async config => {
    const token = await getAsyncAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  },
);
