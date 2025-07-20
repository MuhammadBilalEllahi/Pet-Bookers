import {createSelector, createSlice} from '@reduxjs/toolkit';
import {smartBuyerClient, handleAuthError} from '../utils/authAxiosClient';

const initialState = {
  wishlist: [],
  wishlistLoading: false,
  wishlistError: null,
};

// ASYNC THUNK ACTIONS
export const loadWishlist = () => async (dispatch) => {
  try {
    dispatch(setWishlistLoading(true));
    const {data} = await smartBuyerClient.get('customer/wish-list/');
    // console.log('[loadWishlist] success:', data);
    dispatch(setWishlist(data || []));
    } catch (error) {
    console.error('[loadWishlist] error:', error);
    handleAuthError(error, (err) => {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load wishlist';
      dispatch(setWishlistError(errorMessage));
    });
  }
};

export const addToWishlist = ({productId, productData}) => async (dispatch) => {
  try {
    dispatch(setWishlistLoading(true));
    console.log('[addToWishlist] Adding product:', {productId, productData});
    
    const response = await smartBuyerClient.post('customer/wish-list/add', {
        product_id: productId,
      });
    
    console.log('[addToWishlist] success:', response.data);
    
    // Add to local state only on successful response
    dispatch(addWishlistItem({
      id: productId,
      ...productData
    }));
    
    } catch (error) {
    console.error('[addToWishlist] error:', error.response?.data || error.message);
    
    // Check if the error is "Already in your wishlist"
    const errorMessage = error.response?.data?.message || error.message;
    if (errorMessage === "Already in your wishlist") {
      // If it's already in wishlist, add it to local state to keep UI consistent
      dispatch(addWishlistItem({
        id: productId,
        ...productData
      }));
      // Don't treat this as an error since the item is actually in the wishlist
      return;
    }
    
    handleAuthError(error, (err) => {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to add to wishlist';
      dispatch(setWishlistError(errorMessage));
    });
  }
};

export const removeFromWishlist = ({productId}) => async (dispatch) => {
  try {
    dispatch(setWishlistLoading(true));
    console.log('[removeFromWishlist] Removing product:', productId);
    
    const response = await smartBuyerClient.delete('customer/wish-list/remove', {
      data: { product_id: productId }
    });
    
    console.log('[removeFromWishlist] success:', response.data);
    
    // Remove from local state immediately for better UX
    dispatch(removeWishlistItem(productId));
    
    } catch (error) {
    console.error('[removeFromWishlist] error:', error);
    handleAuthError(error, (err) => {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to remove from wishlist';
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
      // Check if item already exists
      const existingIndex = state.wishlist.findIndex(item => item.id === payload.id);
      if (existingIndex === -1) {
        state.wishlist.push(payload);
      }
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
    removeWishlistItem: (state, {payload}) => {
      state.wishlist = state.wishlist.filter(item => item.id !== payload);
      state.wishlistLoading = false;
      state.wishlistError = null;
    },
    clearWishlist: (state) => {
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
const selectWishlistData = (state) => state.wishlist;

export const selectWishlist = createSelector(selectWishlistData, (wishlistData) => {
  return wishlistData.wishlist;
});

export const selectWishlistLoading = createSelector(selectWishlistData, (wishlistData) => {
  return wishlistData.wishlistLoading;
});

export const selectWishlistError = createSelector(selectWishlistData, (wishlistData) => {
  return wishlistData.wishlistError;
});

export const selectIsInWishlist = createSelector(
  [selectWishlist, (state, productId) => productId],
  (wishlist, productId) => {
    const isInWishlist = wishlist.some(item => item.id === productId);
    // console.log(`[selectIsInWishlist] Product ${productId} - isInWishlist: ${isInWishlist}, wishlist items:`, wishlist.map(item => item.id));
    return isInWishlist;
  }
);

export const selectWishlistCount = createSelector(selectWishlist, (wishlist) => {
  return wishlist.length;
});

export default slice.reducer; 