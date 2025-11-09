import {createSelector, createSlice} from '@reduxjs/toolkit';
import {smartBuyerClient, handleAuthError} from '../utils/authAxiosClient';
import {selectIsBuyerAuthenticated} from './user';

const initialState = {
  cartCount: 0,
  cartLoading: false,
  cartError: null,
};

// ASYNC THUNK ACTIONS
export const loadCartCount = () => async (dispatch, getState) => {
  try {
    if (!selectIsBuyerAuthenticated(getState())) {
      dispatch(setCartCount(0));
      return;
    }
    dispatch(setCartLoading(true));
    const {data} = await smartBuyerClient.get('cart');
    // Cart data is an array, so count is the length
    const count = Array.isArray(data) ? data.length : 0;
    dispatch(setCartCount(count));
  } catch (error) {
    console.error('[loadCartCount] error:', error);
    handleAuthError(error, err => {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to load cart count';
      dispatch(setCartError(errorMessage));
      dispatch(setCartCount(0));
    });
  }
};

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, {payload}) => {
      state.cartCount = payload || 0;
      state.cartLoading = false;
      state.cartError = null;
    },
    setCartLoading: (state, {payload}) => {
      state.cartLoading = payload;
    },
    setCartError: (state, {payload}) => {
      state.cartError = payload;
      state.cartLoading = false;
    },
    incrementCartCount: state => {
      state.cartCount = (state.cartCount || 0) + 1;
    },
    decrementCartCount: state => {
      state.cartCount = Math.max(0, (state.cartCount || 0) - 1);
    },
    clearCartCount: state => {
      state.cartCount = 0;
      state.cartLoading = false;
      state.cartError = null;
    },
  },
});

// ACTIONS
export const {
  setCartCount,
  setCartLoading,
  setCartError,
  incrementCartCount,
  decrementCartCount,
  clearCartCount,
} = slice.actions;

// SELECTORS
const selectCartData = state => state.cart;

export const selectCartCount = createSelector(selectCartData, cartData => {
  return cartData.cartCount || 0;
});

export const selectCartLoading = createSelector(selectCartData, cartData => {
  return cartData.cartLoading;
});

export const selectCartError = createSelector(selectCartData, cartData => {
  return cartData.cartError;
});

export default slice.reducer;

