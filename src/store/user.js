import {createSelector, createSlice} from '@reduxjs/toolkit';
import { 
  delAsyncAuthToken, 
  delAsyncUserType, 
  setAsyncAuthToken, 
  setAsyncUserType,
  getBuyerAuthToken,
  setBuyerAuthToken,
  getSellerAuthToken,
  setSellerAuthToken,
  delBuyerAuthToken,
  delSellerAuthToken,
  clearAllAuthTokens
} from '../utils/localstorage';
import { axiosBuyerClient, axiosSellerClient } from '../utils/axiosClient';


// Use a plain JS object to represent the enum
export const UserType = Object.freeze({
  SELLER: 'Seller',
  BUYER: 'Buyer',
  ANONYMOUS: 'anonymous',
});

const initialState = {
  authenticating: true,
  currentUser: null,
  // Legacy auth (for backward compatibility)
  authToken: null,
  authError: null,
  userType: UserType.ANONYMOUS,
  // New dual auth states
  buyerAuth: {
    token: null,
    isAuthenticated: false,
  },
  sellerAuth: {
    token: null,
    isAuthenticated: false,
  },
  // Customer info (buyer-specific)
  customerInfo: null,
  customerLoading: false,
  customerError: null,
  // Seller info (seller-specific)
  sellerInfo: null,
  sellerLoading: false,
  sellerError: null,
  // Seller profile data (persisted across re-renders)
  sellerProfileData: {
    name: '',
    profileImage: '',
    storeName: '',
    storeImage: '',
    rating: 0,
    totalRatings: 0,
    lastUpdated: null
  },
  sellerProfileLoading: false,
  sellerProfileError: null,
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // ==================== LEGACY ACTIONS (for backward compatibility) ====================
    setAuthToken: (state, {payload}) => {
      state.authToken = payload;
      if(payload) {setAsyncAuthToken(payload);}
    },
    setUserType: (state, {payload}) => {
      state.userType = payload;
      if(payload){setAsyncUserType(payload)}
    },
    logout: (state) => {
      // Clear legacy auth
      state.authToken = null;
      state.currentUser = null;
      state.userType = UserType.ANONYMOUS;
      // Clear dual auth
      state.buyerAuth = { token: null, isAuthenticated: false };
      state.sellerAuth = { token: null, isAuthenticated: false };
      // Clear customer info
      state.customerInfo = null;
      state.customerLoading = false;
      state.customerError = null;
      // Clear all stored tokens
      clearAllAuthTokens();
    },

    // ==================== NEW DUAL AUTH ACTIONS ====================
    setBuyerAuth: (state, {payload}) => {
      state.buyerAuth.token = payload;
      state.buyerAuth.isAuthenticated = !!payload;
      if(payload) {
        setBuyerAuthToken(payload);
      } else {
        delBuyerAuthToken();
      }
    },
    setSellerAuth: (state, {payload}) => {
      state.sellerAuth.token = payload;
      state.sellerAuth.isAuthenticated = !!payload;
      if(payload) {
        setSellerAuthToken(payload);
      } else {
        delSellerAuthToken();
      }
    },
    logoutBuyer: (state) => {
      state.buyerAuth = { token: null, isAuthenticated: false };
      state.customerInfo = null;
      state.customerLoading = false;
      state.customerError = null;
      delBuyerAuthToken();
    },
    logoutSeller: (state) => {
      state.sellerAuth = { token: null, isAuthenticated: false };
      state.sellerInfo = null;
      state.sellerLoading = false;
      state.sellerError = null;
      state.sellerProfileData = {
        name: '',
        profileImage: '',
        storeName: '',
        storeImage: '',
        rating: 0,
        totalRatings: 0,
        lastUpdated: null
      };
      state.sellerProfileLoading = false;
      state.sellerProfileError = null;
      delSellerAuthToken();
    },

    // ==================== CUSTOMER INFO ACTIONS ====================
    setCustomerLoading: (state, {payload}) => {
      state.customerLoading = payload;
    },
    setCustomerInfo: (state, {payload}) => {
      state.customerInfo = payload;
      state.customerLoading = false;
      state.customerError = null;
    },
    setCustomerError: (state, {payload}) => {
      state.customerError = payload;
      state.customerLoading = false;
    },

    // ==================== SELLER INFO ACTIONS ====================
    setSellerLoading: (state, {payload}) => {
      state.sellerLoading = payload;
    },
    setSellerInfo: (state, {payload}) => {
      state.sellerInfo = payload;
      state.sellerLoading = false;
      state.sellerError = null;
    },
    setSellerError: (state, {payload}) => {
      state.sellerError = payload;
      state.sellerLoading = false;
    },

    // ==================== SELLER PROFILE DATA ACTIONS ====================
    setSellerProfileLoading: (state, {payload}) => {
      state.sellerProfileLoading = payload;
    },
    setSellerProfileData: (state, {payload}) => {
      state.sellerProfileData = {
        ...payload,
        lastUpdated: new Date().toISOString()
      };
      state.sellerProfileLoading = false;
      state.sellerProfileError = null;
    },
    setSellerProfileError: (state, {payload}) => {
      state.sellerProfileError = payload;
      state.sellerProfileLoading = false;
    },
    updateSellerProfileData: (state, {payload}) => {
      state.sellerProfileData = {
        ...state.sellerProfileData,
        ...payload,
        lastUpdated: new Date().toISOString()
      };
    },
    clearSellerProfileData: (state) => {
      state.sellerProfileData = {
        name: '',
        profileImage: '',
        storeName: '',
        storeImage: '',
        rating: 0,
        totalRatings: 0,
        lastUpdated: null
      };
      state.sellerProfileLoading = false;
      state.sellerProfileError = null;
    },
  },
});


// ACTIONS
export const {
  // Legacy actions
  setAuthToken, 
  setUserType, 
  logout,
  // New dual auth actions
  setBuyerAuth,
  setSellerAuth,
  logoutBuyer,
  logoutSeller,
  // Customer info actions
  setCustomerLoading,
  setCustomerInfo,
  setCustomerError,
  // Seller info actions
  setSellerLoading,
  setSellerInfo,
  setSellerError,
  // Seller profile data actions
  setSellerProfileLoading,
  setSellerProfileData,
  setSellerProfileError,
  updateSellerProfileData,
  clearSellerProfileData
} = slice.actions;

// ASYNC THUNK ACTIONS
export const fetchCustomerInfo = () => async (dispatch, getState) => {
  const state = getState();
  const isBuyerAuthenticated = selectIsBuyerAuthenticated(state);
  
  // Only fetch if buyer is authenticated
  if (!isBuyerAuthenticated) {
    return;
  }

  try {
    dispatch(setCustomerLoading(true));
    const response = await axiosBuyerClient.get('customer/info');
    dispatch(setCustomerInfo(response.data));
  } catch (error) {
    console.error('Error fetching customer info:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch customer info';
    dispatch(setCustomerError(errorMessage));
  }
};

// Helper action to handle post-login data fetching for buyers
export const handleBuyerLogin = (token) => async (dispatch) => {
  dispatch(setBuyerAuth(token));
  dispatch(fetchCustomerInfo());
};

// ASYNC THUNK ACTIONS for seller
export const fetchSellerInfo = () => async (dispatch, getState) => {
  const state = getState();
  const isSellerAuthenticated = selectIsSellerAuthenticated(state);
  
  // Only fetch if seller is authenticated
  if (!isSellerAuthenticated) {
    return;
  }

  try {
    dispatch(setSellerLoading(true));
    const response = await axiosSellerClient.get('seller-info');
    dispatch(setSellerInfo(response.data));
  } catch (error) {
    console.error('Error fetching seller info:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch seller info';
    dispatch(setSellerError(errorMessage));
  }
};

// ASYNC THUNK ACTIONS for seller profile data
export const fetchSellerProfileData = () => async (dispatch, getState) => {
  const state = getState();
  const isSellerAuthenticated = selectIsSellerAuthenticated(state);
  const currentProfileData = selectSellerProfileData(state);
  
  // Only fetch if seller is authenticated
  if (!isSellerAuthenticated) {
    return;
  }

  // Check if we have recent data (less than 5 minutes old)
  if (currentProfileData.lastUpdated) {
    const lastUpdated = new Date(currentProfileData.lastUpdated);
    const now = new Date();
    const diffInMinutes = (now - lastUpdated) / (1000 * 60);
    
    if (diffInMinutes < 5) {
      console.log('Using cached seller profile data');
      return;
    }
  }

  try {
    dispatch(setSellerProfileLoading(true));
    
    // Fetch both seller info and shop info in parallel
    const [sellerResponse, shopResponse] = await Promise.all([
      axiosSellerClient.get('/seller-info'),
      axiosSellerClient.get('/shop-info')
    ]);

    const sellerData = sellerResponse.data;
    const shopData = shopResponse.data;

    // Combine the data
    const profileData = {
      name: sellerData ? `${sellerData.f_name || ''} ${sellerData.l_name || ''}`.trim() : '',
      profileImage: sellerData?.image ? `https://petbookers.com.pk/storage/app/public/profile/${sellerData.image}` : 'https://petbookers.com.pk/storage/app/public/profile/2024-03-26-6602afcca8664.png',
      storeName: shopData?.name || '',
      storeImage: shopData?.image ? `https://petbookers.com.pk/storage/app/public/shop/${shopData.image}` : '',
      rating: shopData?.rating || 0,
      totalRatings: shopData?.rating_count || 0
    };

    dispatch(setSellerProfileData(profileData));
  } catch (error) {
    console.error('Error fetching seller profile data:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch seller profile data';
    dispatch(setSellerProfileError(errorMessage));
  }
};

// Helper action to handle post-login for sellers
export const handleSellerLogin = (token) => async (dispatch) => {
  dispatch(setSellerAuth(token));
  dispatch(fetchSellerInfo());
  dispatch(fetchSellerProfileData());
};

// Legacy helper action (for backward compatibility)
export const handleUserLogin = (token, userType) => async (dispatch) => {
  // Set legacy auth data
  dispatch(setAuthToken(token));
  dispatch(setUserType(userType));
  
  // Also set in new dual auth system
  if (userType === UserType.BUYER) {
    dispatch(handleBuyerLogin(token));
  } else if (userType === UserType.SELLER) {
    dispatch(handleSellerLogin(token));
  }
};

// Action to load tokens from storage on app start
export const loadDualAuthFromStorage = () => async (dispatch) => {
  try {
    const [buyerToken, sellerToken] = await Promise.all([
      getBuyerAuthToken(),
      getSellerAuthToken()
    ]);
    
    if (buyerToken) {
      dispatch(setBuyerAuth(buyerToken));
    dispatch(fetchCustomerInfo());
  }
    
    if (sellerToken) {
      dispatch(setSellerAuth(sellerToken));
      dispatch(fetchSellerInfo());
      dispatch(fetchSellerProfileData());
    }
  } catch (error) {
    console.error('Error loading auth tokens from storage:', error);
  }
};


// ==================== SELECTORS ====================
const selectUserData = state => {
  return state.user;
};

// Legacy selectors (for backward compatibility)
export const selectUserType = createSelector(selectUserData, userData => {
  return userData.userType;
});

export const selectIsSeller = createSelector(selectUserData, userData => {
  return userData.userType === UserType.SELLER;
});

export const selectIsBuyer = createSelector(selectUserData, userData => {
  return userData.userType === UserType.BUYER;
});

export const selectIfAnonymous = createSelector(selectUserData, userData => {
  return userData.userType === UserType.ANONYMOUS;
});

export const selectAuthToken = createSelector(selectUserData, userData => {
  return userData.authToken;
});

// New dual auth selectors
export const selectBuyerAuth = createSelector(selectUserData, userData => {
  return userData.buyerAuth;
});

export const selectSellerAuth = createSelector(selectUserData, userData => {
  return userData.sellerAuth;
});

export const selectIsBuyerAuthenticated = createSelector(selectUserData, userData => {
  return userData.buyerAuth.isAuthenticated;
});

export const selectIsSellerAuthenticated = createSelector(selectUserData, userData => {
  return userData.sellerAuth.isAuthenticated;
});

export const selectBuyerToken = createSelector(selectUserData, userData => {
  return userData.buyerAuth.token;
});

export const selectSellerToken = createSelector(selectUserData, userData => {
  return userData.sellerAuth.token;
});

export const selectIsAnyAuthenticated = createSelector(selectUserData, userData => {
  return userData.buyerAuth.isAuthenticated || userData.sellerAuth.isAuthenticated;
});

// Customer info selectors
export const selectCustomerInfo = createSelector(selectUserData, userData => {
  return userData.customerInfo;
});

export const selectCustomerLoading = createSelector(selectUserData, userData => {
  return userData.customerLoading;
});

export const selectCustomerError = createSelector(selectUserData, userData => {
  return userData.customerError;
});

// Seller info selectors
export const selectSellerInfo = createSelector(selectUserData, userData => {
  return userData.sellerInfo;
});

export const selectSellerLoading = createSelector(selectUserData, userData => {
  return userData.sellerLoading;
});

export const selectSellerError = createSelector(selectUserData, userData => {
  return userData.sellerError;
});

// Seller profile data selectors
export const selectSellerProfileData = createSelector(selectUserData, userData => {
  return userData.sellerProfileData;
});

export const selectSellerProfileLoading = createSelector(selectUserData, userData => {
  return userData.sellerProfileLoading;
});

export const selectSellerProfileError = createSelector(selectUserData, userData => {
  return userData.sellerProfileError;
});

export const selectSellerId = createSelector(selectUserData, userData => {
  return userData.sellerInfo?.id;
});

export const selectCustomerId = createSelector(selectUserData, userData => {
  return userData.customerInfo?.id;
});

export default slice.reducer;
