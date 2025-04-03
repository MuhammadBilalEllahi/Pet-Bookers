import axios from 'axios';
import {BASE_URL, BUYER_API, SELLER_API} from './constants';
import {getAuthToken} from './localstorage';

export const axiosBuyerClient = axios.create({
  baseURL: `${BASE_URL}${BUYER_API}`,
});
export const axiosSellerClient = axios.create({
  baseURL: `${BASE_URL}${SELLER_API}`,
});

axiosBuyerClient.interceptors.request.use(
  async config => {
    const token = await getAuthToken();
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
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    Promise.reject(error);
  },
);
