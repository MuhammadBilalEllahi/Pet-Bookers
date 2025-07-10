import {createSelector, createSlice} from '@reduxjs/toolkit';
import { delAsyncAuthToken, delAsyncUserType, setAsyncAuthToken, setAsyncUserType } from '../utils/localstorage';
import { axiosBuyerClient } from '../utils/axiosClient';


// Use a plain JS object to represent the enum
export const UserType = Object.freeze({
  SELLER: 'Seller',
  BUYER: 'Buyer',
  ANONYMOUS: 'anonymous',
});

const initialState = {
  authenticating: true,
  currentUser: null,
  authToken: null,
  authError: null,
  userType: UserType.ANONYMOUS,
  customerInfo: null,
  customerLoading: false,
  customerError: null,
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthToken: (state, {payload}) => {
      state.authToken = payload;
      if(payload) {setAsyncAuthToken(payload);}
    },
    setUserType: (state, {payload}) => {
      state.userType = payload;
      if(payload){setAsyncUserType(payload)}
    },
    logout: (state) => {
      state.authToken = null;
      state.currentUser = null;
      state.userType = UserType.ANONYMOUS;
      state.customerInfo = null;
      state.customerLoading = false;
      state.customerError = null;
      delAsyncAuthToken()
      delAsyncUserType()
    },
    // Customer info actions
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
  },
});


// ACTIONS
export const {
  setAuthToken, 
  setUserType, 
  logout,
  setCustomerLoading,
  setCustomerInfo,
  setCustomerError
} = slice.actions;

// ASYNC THUNK ACTIONS
export const fetchCustomerInfo = () => async (dispatch, getState) => {
  const state = getState();
  const userType = selectUserType(state);
  const authToken = selectAuthToken(state);
  
  // Only fetch if user is buyer and authenticated
  if (userType !== UserType.BUYER || !authToken) {
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

// Helper action to handle post-login data fetching
export const handleUserLogin = (token, userType) => async (dispatch) => {
  // Set auth data first
  dispatch(setAuthToken(token));
  dispatch(setUserType(userType));
  
  // If user is buyer, automatically fetch customer info
  if (userType === UserType.BUYER) {
    dispatch(fetchCustomerInfo());
  }
};


// SELECTORS
const selectUserData = state => {
  return state.user;
};

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

export const selectCustomerInfo = createSelector(selectUserData, userData => {
  return userData.customerInfo;
});

export const selectCustomerLoading = createSelector(selectUserData, userData => {
  return userData.customerLoading;
});

export const selectCustomerError = createSelector(selectUserData, userData => {
  return userData.customerError;
});

export default slice.reducer;
