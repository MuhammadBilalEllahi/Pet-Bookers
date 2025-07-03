import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

const initialState = {
  wishlistItems: [],
  wishlistLoading: false,
  wishlistError: null,
  isInitialized: false,
  // Keep track of product IDs in wishlist for quick lookup
  wishlistProductIds: [],
};

// Load complete wishlist
export const loadWishlist = createAsyncThunk(
  'wishlist/loadWishlist',
  async (_, {rejectWithValue}) => {
    try {
      const {data} = await axiosBuyerClient.get('customer/wish-list/');
      console.log('Wishlist loaded:', data);
      return data || [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to load wishlist'
      );
    }
  }
);

// Add item to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({productId, productData}, {rejectWithValue}) => {
    try {
      const response = await axiosBuyerClient.post('customer/wish-list/add', {
        product_id: productId,
      });
      console.log('Added to wishlist:', response.data);
      
      // Return the product info for optimistic update
      return {
        productId, 
        productData,
        wishlistItemId: response.data?.id, // API might return the wishlist item ID
        response: response.data
      };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to add to wishlist'
      );
    }
  }
);

// Remove item from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async ({productId, wishlistItemId}, {rejectWithValue}) => {
    try {
      const response = await axiosBuyerClient.delete('customer/wish-list/remove', {
        data: {
          product_id: productId,
        },
      });
      console.log('Removed from wishlist:', response.data);
      
      return {productId, wishlistItemId, response: response.data};
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to remove from wishlist'
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Clear wishlist (useful for logout)
    clearWishlist: (state) => {
      state.wishlistItems = [];
      state.wishlistProductIds = [];
      state.isInitialized = false;
      state.wishlistError = null;
    },
    // Mark as initialized
    setWishlistInitialized: (state) => {
      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    // Load wishlist
    builder.addCase(loadWishlist.pending, (state) => {
      state.wishlistLoading = true;
      state.wishlistError = null;
    });
    builder.addCase(loadWishlist.fulfilled, (state, {payload}) => {
      state.wishlistItems = payload;
      state.wishlistProductIds = payload.map(item => item.product_id);
      state.wishlistLoading = false;
      state.wishlistError = null;
      state.isInitialized = true;
    });
    builder.addCase(loadWishlist.rejected, (state, {payload}) => {
      state.wishlistLoading = false;
      state.wishlistError = payload;
      state.isInitialized = true;
    });

    // Add to wishlist
    builder.addCase(addToWishlist.pending, (state, {meta}) => {
      // Optimistically add to wishlist
      const {productId, productData} = meta.arg;
      if (!state.wishlistProductIds.includes(productId)) {
        state.wishlistProductIds.push(productId);
        
        // Add optimistic wishlist item if we have product data
        if (productData) {
          const optimisticItem = {
            id: `temp_${productId}_${Date.now()}`, // Temporary ID
            product_id: productId,
            product: productData,
            created_at: new Date().toISOString(),
          };
          state.wishlistItems.push(optimisticItem);
        }
      }
    });
    builder.addCase(addToWishlist.fulfilled, (state, {payload, meta}) => {
      const {productId, productData} = meta.arg;
      const {wishlistItemId} = payload;
      
      // Update with real data if we got wishlist item ID from API
      if (wishlistItemId && productData) {
        // Remove temporary item
        state.wishlistItems = state.wishlistItems.filter(item => 
          !item.id.toString().startsWith('temp_')
        );
        
        // Add real item
        const realItem = {
          id: wishlistItemId,
          product_id: productId,
          product: productData,
          created_at: new Date().toISOString(),
        };
        state.wishlistItems.push(realItem);
      }
      
      // Keep the optimistic update for product IDs
      if (!state.wishlistProductIds.includes(productId)) {
        state.wishlistProductIds.push(productId);
      }
    });
    builder.addCase(addToWishlist.rejected, (state, {meta}) => {
      // Revert optimistic update
      const {productId} = meta.arg;
      state.wishlistProductIds = state.wishlistProductIds.filter(id => id !== productId);
      
      // Remove optimistic wishlist item
      state.wishlistItems = state.wishlistItems.filter(item => 
        item.product_id !== productId || !item.id.toString().startsWith('temp_')
      );
    });

    // Remove from wishlist
    builder.addCase(removeFromWishlist.pending, (state, {meta}) => {
      // Optimistically remove from wishlist
      const {productId, wishlistItemId} = meta.arg;
      state.wishlistProductIds = state.wishlistProductIds.filter(id => id !== productId);
      if (wishlistItemId) {
        state.wishlistItems = state.wishlistItems.filter(item => item.id !== wishlistItemId);
      }
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, {payload, meta}) => {
      const {productId, wishlistItemId} = meta.arg;
      // Keep the optimistic update
      state.wishlistProductIds = state.wishlistProductIds.filter(id => id !== productId);
      if (wishlistItemId) {
        state.wishlistItems = state.wishlistItems.filter(item => item.id !== wishlistItemId);
      }
    });
    builder.addCase(removeFromWishlist.rejected, (state, {meta, payload}) => {
      // Revert optimistic update - re-add to wishlist
      const {productId, wishlistItemId} = meta.arg;
      if (!state.wishlistProductIds.includes(productId)) {
        state.wishlistProductIds.push(productId);
      }
      // Note: We can't easily revert the wishlistItems array, so we might need to reload
      console.warn('Failed to remove from wishlist, consider reloading:', payload);
    });
  },
});

// Actions
export const {clearWishlist, setWishlistInitialized} = wishlistSlice.actions;

// Selectors
const selectWishlistState = (state) => state.wishlist;

export const selectWishlist = createSelector(
  selectWishlistState,
  (wishlist) => ({
    wishlistItems: wishlist.wishlistItems,
    wishlistLoading: wishlist.wishlistLoading,
    wishlistError: wishlist.wishlistError,
    isInitialized: wishlist.isInitialized,
  })
);

export const selectWishlistProductIds = createSelector(
  selectWishlistState,
  (wishlist) => wishlist.wishlistProductIds
);

export const selectIsInWishlist = createSelector(
  [selectWishlistProductIds, (state, productId) => productId],
  (wishlistProductIds, productId) => wishlistProductIds.includes(productId)
);

export const selectWishlistCount = createSelector(
  selectWishlistState,
  (wishlist) => wishlist.wishlistItems.length
);

export default wishlistSlice.reducer; 