import {createSelector, createSlice} from '@reduxjs/toolkit';
import { delAsyncAuthToken, delAsyncUserType, setAsyncAuthToken, setAsyncUserType } from '../utils/localstorage';


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
              delAsyncAuthToken()
              delAsyncUserType()
    },
  },
});


// ACTIONS
export const {setAuthToken, setUserType, logout} = slice.actions;


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

export default slice.reducer;
