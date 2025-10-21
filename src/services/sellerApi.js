import { axiosSellerClient } from '../utils/axiosClient';
import { axiosBuyerClient } from '../utils/axiosClient';

// Farm Information
export const getShopInfo = () => {
  return axiosSellerClient.get('/shop-info');
};

export const updateShopInfo = (formData) => {
  return axiosSellerClient.post('/shop-update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Seller Information
export const getSellerInfo = () => {
  return axiosSellerClient.get('/seller-info');
};

export const updateSellerInfo = (formData) => {
  return axiosSellerClient.post('/seller-update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Update only seller bank details
export const updateSellerBankDetails = (bankDetails) => {
  return axiosSellerClient.put('/seller-update', bankDetails);
};

// Delivery Men Management
export const getDeliveryMen = (params = {}) => {
  return axiosSellerClient.get('/seller-delivery-man', { params });
};

// Reviews Management
export const getFarmProductReviews = (params = {}) => {
  return axiosSellerClient.get('/shop-product-reviews', { params });
};

// Backward compatibility
export const getShopProductReviews = getFarmProductReviews;

export const updateReviewStatus = (reviewId, status) => {
  return axiosSellerClient.put('/shop-product-reviews-status', {
    id: reviewId,
    status: status
  });
};

// Earnings and Statistics
export const getEarningStatistics = (type = 'yearEarn') => {
  return axiosSellerClient.get('/get-earning-statitics', {
    params: { type }
  });
};

export const getMonthlyEarning = () => {
  return axiosSellerClient.get('/monthly-earning');
};

export const getMonthlyCommissionGiven = () => {
  return axiosSellerClient.get('/monthly-commission-given');
};

// Order Statistics
export const getOrderStatistics = (statisticsType = 'today') => {
  return axiosSellerClient.get('/order-statistics', {
    params: { statistics_type: statisticsType }
  });
};

// Transactions
export const getTransactions = (params = {}) => {
  return axiosSellerClient.get('/transactions', { params });
};

// Withdrawal Methods
export const getWithdrawMethodList = () => {
  return axiosSellerClient.get('/withdraw-method-list');
};

export const submitWithdrawRequest = (data) => {
  return axiosSellerClient.post('/balance-withdraw', data);
};

export const closeWithdrawRequest = (requestId) => {
  return axiosSellerClient.delete('/close-withdraw-request', {
    data: { id: requestId }
  });
};

// Account Management
export const deleteAccount = () => {
  return axiosSellerClient.get('/account-delete');
};

// Firebase Token Update
export const updateFirebaseToken = (token) => {
  return axiosSellerClient.put('/cm-firebase-token', {
    cm_firebase_token: token
  });
};

// Farm Vacation and Temporary Close
export const setFarmVacation = (data) => {
  return axiosSellerClient.put('/vacation-add', data);
};

export const setFarmTemporaryClose = (status) => {
  return axiosSellerClient.put('/temporary-close', { status });
};

// Backward compatibility
export const setShopVacation = setFarmVacation;
export const setShopTemporaryClose = setFarmTemporaryClose;

// V1 Seller APIs
export const getSellerInfoV1 = (sellerId) => {
  return axiosBuyerClient.get('/seller', { params: { seller_id: sellerId } });
};

export const getSellerProductsV1 = (sellerId, limit = 10, offset = 0) => {
  return axiosBuyerClient.get(`/seller/${sellerId}/products`, { params: { limit, offset } });
};

export const getSellerAllProductsV1 = (sellerId, limit = 10, offset = 0, search = '') => {
  return axiosBuyerClient.get(`/seller/${sellerId}/all-products`, { params: { limit, offset, search } });
};

export const getTopSellersV1 = () => {
  return axiosBuyerClient.get('/seller/top');
};

export const getAllSellersV1 = () => {
  return axiosBuyerClient.get('/seller/all');
}; 