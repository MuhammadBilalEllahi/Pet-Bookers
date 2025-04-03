import {createSelector, createSlice} from '@reduxjs/toolkit';

const initialState = {
  authenticating: true,
  currentUser: null,
  authToken: null,
  authError: null,
  userType: 'anonymous',
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthToken: (state, {payload}) => {
      state.authToken = payload;
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
  return userData.userType === 'anonymous';
});

export const selectAuthToken = createSelector(selectUserData, userData => {
  return userData.authToken;
});

export default slice.reducer;
