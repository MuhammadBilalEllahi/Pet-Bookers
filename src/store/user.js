import {createSelector, createSlice} from '@reduxjs/toolkit';
import { setAsyncAuthToken } from '../utils/localstorage';


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
      setAsyncAuthToken = payload;
    },
    setUserType: (state, {payload}) => {
      state.userType = payload;
    },
  },
});


// ACTIONS
export const {setAuthToken, setUserType} = slice.actions;


// SELECTORS
const selectUserData = state => {
  return state.user;
};

export const selectUserType = createSelector(selectUserData, userData => {
  return userData.userType;
});

export const selectIfAnonymous = createSelector(selectUserData, userData => {
  return userData.userType === UserType.ANONYMOUS;
});

export const selectAuthToken = createSelector(selectUserData, userData => {
  return userData.authToken;
});

export default slice.reducer;
