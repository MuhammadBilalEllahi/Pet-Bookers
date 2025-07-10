import { store } from '../store';
import { 
  selectIsBuyerAuthenticated, 
  selectIsSellerAuthenticated,
  selectBuyerToken,
  selectSellerToken
} from '../store/user';
import { axiosBuyerClient, axiosSellerClient } from './axiosClient';
import Toast from 'react-native-toast-message';

// Authentication error types
export const AuthError = {
  BUYER_NOT_AUTHENTICATED: 'BUYER_NOT_AUTHENTICATED',
  SELLER_NOT_AUTHENTICATED: 'SELLER_NOT_AUTHENTICATED',
  NO_AUTH: 'NO_AUTH'
};

// Global auth modal handlers (to be set by components that can show modals)
let authModalHandlers = {
  showBuyerAuthModal: null,
  showSellerAuthModal: null,
};

export const setAuthModalHandlers = (handlers) => {
  authModalHandlers = { ...authModalHandlers, ...handlers };
};

// Helper function to get current auth state
const getAuthState = () => {
  const state = store.getState();
  return {
    isBuyerAuthenticated: selectIsBuyerAuthenticated(state),
    isSellerAuthenticated: selectIsSellerAuthenticated(state),
    buyerToken: selectBuyerToken(state),
    sellerToken: selectSellerToken(state),
  };
};

// Enhanced buyer client with automatic auth checks
export const createAuthenticatedBuyerClient = () => {
  const makeRequest = async (method, url, data = null, config = {}) => {
    const { isBuyerAuthenticated } = getAuthState();
    
    if (!isBuyerAuthenticated) {
      const error = new Error('Buyer authentication required');
      error.type = AuthError.BUYER_NOT_AUTHENTICATED;
      error.showModal = () => {
        if (authModalHandlers.showBuyerAuthModal) {
          authModalHandlers.showBuyerAuthModal();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Authentication Required',
            text2: 'Please sign in as a buyer to continue',
          });
        }
      };
      throw error;
    }

    // Make the actual request
    switch (method.toLowerCase()) {
      case 'get':
        return axiosBuyerClient.get(url, config);
      case 'post':
        return axiosBuyerClient.post(url, data, config);
      case 'put':
        return axiosBuyerClient.put(url, data, config);
      case 'delete':
        return axiosBuyerClient.delete(url, config);
      case 'patch':
        return axiosBuyerClient.patch(url, data, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };

  return {
    get: (url, config) => makeRequest('get', url, null, config),
    post: (url, data, config) => makeRequest('post', url, data, config),
    put: (url, data, config) => makeRequest('put', url, data, config),
    delete: (url, config) => makeRequest('delete', url, null, config),
    patch: (url, data, config) => makeRequest('patch', url, data, config),
  };
};

// Enhanced seller client with automatic auth checks
export const createAuthenticatedSellerClient = () => {
  const makeRequest = async (method, url, data = null, config = {}) => {
    const { isSellerAuthenticated } = getAuthState();
    
    if (!isSellerAuthenticated) {
      const error = new Error('Seller authentication required');
      error.type = AuthError.SELLER_NOT_AUTHENTICATED;
      error.showModal = () => {
        if (authModalHandlers.showSellerAuthModal) {
          authModalHandlers.showSellerAuthModal();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Authentication Required',
            text2: 'Please sign in as a seller to continue',
          });
        }
      };
      throw error;
    }

    // Make the actual request
    switch (method.toLowerCase()) {
      case 'get':
        return axiosSellerClient.get(url, config);
      case 'post':
        return axiosSellerClient.post(url, data, config);
      case 'put':
        return axiosSellerClient.put(url, data, config);
      case 'delete':
        return axiosSellerClient.delete(url, config);
      case 'patch':
        return axiosSellerClient.patch(url, data, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };

  return {
    get: (url, config) => makeRequest('get', url, null, config),
    post: (url, data, config) => makeRequest('post', url, data, config),
    put: (url, data, config) => makeRequest('put', url, data, config),
    delete: (url, config) => makeRequest('delete', url, null, config),
    patch: (url, data, config) => makeRequest('patch', url, data, config),
  };
};

// Smart client that checks both auth states and provides appropriate guidance
export const createSmartBuyerClient = () => {
  const makeRequest = async (method, url, data = null, config = {}) => {
    const { isBuyerAuthenticated, isSellerAuthenticated } = getAuthState();
    
    if (!isBuyerAuthenticated) {
      const error = new Error('Buyer authentication required');
      error.type = AuthError.BUYER_NOT_AUTHENTICATED;
      error.isSellerAuthenticated = isSellerAuthenticated;
      
      error.showModal = () => {
        if (authModalHandlers.showBuyerAuthModal) {
          authModalHandlers.showBuyerAuthModal();
        } else {
          const message = isSellerAuthenticated 
            ? 'You are signed in as a seller. Please also sign in as a buyer to continue.'
            : 'Please sign in as a buyer to continue';
          
          Toast.show({
            type: 'error',
            text1: 'Buyer Authentication Required',
            text2: message,
          });
        }
      };
      throw error;
    }

    // Make the actual request
    switch (method.toLowerCase()) {
      case 'get':
        return axiosBuyerClient.get(url, config);
      case 'post':
        return axiosBuyerClient.post(url, data, config);
      case 'put':
        return axiosBuyerClient.put(url, data, config);
      case 'delete':
        return axiosBuyerClient.delete(url, config);
      case 'patch':
        return axiosBuyerClient.patch(url, data, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };

  return {
    get: (url, config) => makeRequest('get', url, null, config),
    post: (url, data, config) => makeRequest('post', url, data, config),
    put: (url, data, config) => makeRequest('put', url, data, config),
    delete: (url, config) => makeRequest('delete', url, null, config),
    patch: (url, data, config) => makeRequest('patch', url, data, config),
  };
};

// Create client instances
export const authBuyerClient = createAuthenticatedBuyerClient();
export const authSellerClient = createAuthenticatedSellerClient();
export const smartBuyerClient = createSmartBuyerClient();

// Helper function to handle auth errors consistently
export const handleAuthError = (error, fallbackAction = null) => {
  if (error.type === AuthError.BUYER_NOT_AUTHENTICATED || 
      error.type === AuthError.SELLER_NOT_AUTHENTICATED) {
    error.showModal();
    return;
  }
  
  // For other errors, use fallback action or show generic error
  if (fallbackAction) {
    fallbackAction(error);
  } else {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error.message || 'Something went wrong',
    });
  }
};

// Enhanced wrapper for mixed operations (buyer-preferred but can work without auth)
export const createOptionalAuthBuyerClient = () => {
  const makeRequest = async (method, url, data = null, config = {}) => {
    // This client works whether buyer is authenticated or not
    // but provides enhanced functionality when authenticated
    switch (method.toLowerCase()) {
      case 'get':
        return axiosBuyerClient.get(url, config);
      case 'post':
        return axiosBuyerClient.post(url, data, config);
      case 'put':
        return axiosBuyerClient.put(url, data, config);
      case 'delete':
        return axiosBuyerClient.delete(url, config);
      case 'patch':
        return axiosBuyerClient.patch(url, data, config);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };

  return {
    get: (url, config) => makeRequest('get', url, null, config),
    post: (url, data, config) => makeRequest('post', url, data, config),
    put: (url, data, config) => makeRequest('put', url, data, config),
    delete: (url, config) => makeRequest('delete', url, null, config),
    patch: (url, data, config) => makeRequest('patch', url, data, config),
  };
};

export const optionalAuthBuyerClient = createOptionalAuthBuyerClient(); 