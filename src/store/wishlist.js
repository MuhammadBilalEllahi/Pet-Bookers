import {createSelector, createSlice} from '@reduxjs/toolkit';
import {handleAuthError, smartBuyerClient} from '../utils/authAxiosClient';
import {selectIsBuyerAuthenticated} from './user';

const initialState = {
  wishlist: [],
  wishlistLoading: false,
  wishlistError: null,
};

// ASYNC THUNK ACTIONS
export const loadWishlist = () => async (dispatch, getState) => {
  try {
    if (!selectIsBuyerAuthenticated(getState())) {
      return;
    }
    dispatch(setWishlistLoading(true));
    const {data} = await smartBuyerClient.get('customer/wish-list/');
    // console.log('[loadWishlist] success:', data);
    dispatch(setWishlist(data || []));
  } catch (error) {
    // console.error('[loadWishlist] error:', error);
    handleAuthError(error, err => {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load wishlist';
      dispatch(setWishlistError(errorMessage));
    });
  }
};

export const addToWishlist =
  ({productId, productData}) =>
  async dispatch => {
    try {
      dispatch(setWishlistLoading(true));
      // console.log('[addToWishlist] Adding product:', {productId, productData});

      const response = await smartBuyerClient.post('customer/wish-list/add', {
        product_id: productId,
      });

      // console.log('[addToWishlist] success:', response.data);

      // Add to local state only on successful response
      dispatch(
        addWishlistItem({
          id: productId,
          ...productData,
        }),
      );
    } catch (error) {
      console.error(
        '[addToWishlist] error:',
        error.response?.data || error.message,
      );

      // Check if the error is "Already in your wishlist"
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage === 'Already in your wishlist') {
        // If it's already in wishlist, add it to local state to keep UI consistent
        dispatch(
          addWishlistItem({
            id: productId,
            ...productData,
          }),
        );
        // Don't treat this as an error since the item is actually in the wishlist
        return;
      }

      handleAuthError(error, err => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to add to wishlist';
        dispatch(setWishlistError(errorMessage));
      });
    }
  };

export const removeFromWishlist =
  ({productId}) =>
  async dispatch => {
    try {
      dispatch(setWishlistLoading(true));
      // console.log('[removeFromWishlist] Removing product:', productId);

      const response = await smartBuyerClient.delete(
        'customer/wish-list/remove',
        {
          data: {product_id: productId},
        },
      );

      // console.log('[removeFromWishlist] success:', response.data);

      // Remove from local state immediately for better UX
      dispatch(removeWishlistItem(productId));
    } catch (error) {
      console.error('[removeFromWishlist] error:', error);
      handleAuthError(error, err => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to remove from wishlist';
        dispatch(setWishlistError(errorMessage));
      });
    }
  };

const slice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, {payload}) => {
      state.wishlist = Array.isArray(payload) ? payload : [];
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
    setWishlistLoading: (state, {payload}) => {
      state.wishlistLoading = payload;
    },
    setWishlistError: (state, {payload}) => {
      state.wishlistError = payload;
      state.wishlistLoading = false;
    },
    addWishlistItem: (state, {payload}) => {
      // Check if item already exists by product ID
      // Handle both API structure (with product_id) and local structure (with id as productId)
      const productId = payload.id || payload.product_id || payload.product?.id;
      const existingIndex = state.wishlist.findIndex(item => {
        const itemProductId = item.product_id || item.product?.id || item.id;
        return itemProductId === productId;
      });
      if (existingIndex === -1) {
        state.wishlist.push(payload);
      }
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
    removeWishlistItem: (state, {payload}) => {
      // Handle both API structure (with product_id) and local structure (with id as productId)
      state.wishlist = state.wishlist.filter(item => {
        // Check product_id first (from API response)
        if (item.product_id !== undefined) {
          return item.product_id !== payload;
        }
        // Check product.id (nested product object from API)
        if (item.product?.id !== undefined) {
          return item.product.id !== payload;
        }
        // Fallback to item.id (for locally added items)
        return item.id !== payload;
      });
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
    clearWishlist: state => {
      state.wishlist = [];
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
  },
});

// ACTIONS
export const {
  setWishlist,
  setWishlistLoading,
  setWishlistError,
  addWishlistItem,
  removeWishlistItem,
  clearWishlist,
} = slice.actions;

// SELECTORS
const selectWishlistData = state => state.wishlist;

export const selectWishlist = createSelector(
  selectWishlistData,
  wishlistData => {
    // console.log('wishlistData', JSON.stringify(wishlistData.wishlist, null, 2));
    return wishlistData.wishlist;
  },
);

export const selectWishlistLoading = createSelector(
  selectWishlistData,
  wishlistData => {
    return wishlistData.wishlistLoading;
  },
);

export const selectWishlistError = createSelector(
  selectWishlistData,
  wishlistData => {
    return wishlistData.wishlistError;
  },
);

export const selectIsInWishlist = createSelector(
  [selectWishlist, (state, productId) => productId],
  (wishlist, productId) => {
    // Handle both API structure (with product_id) and local structure (with id as productId)
    const isInWishlist = wishlist.some(item => {
      // Check product_id first (from API response)
      if (item.product_id !== undefined) {
        return item.product_id === productId;
      }
      // Check product.id (nested product object from API)
      if (item.product?.id !== undefined) {
        return item.product.id === productId;
      }
      // Fallback to item.id (for locally added items)
      return item.id === productId;
    });
    // console.log(`[selectIsInWishlist] Product ${productId} - isInWishlist: ${isInWishlist}, wishlist items:`, wishlist.map(item => item.product_id || item.id));
    return isInWishlist;
  },
);

export const selectWishlistCount = createSelector(selectWishlist, wishlist => {
  return wishlist.length;
});

export default slice.reducer;
