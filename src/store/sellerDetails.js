import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

const initialState = {
  sellerInfo: null,
  sellerInfoLoading: true,
  sellerInfoError: null,
  sellerProducts: { products: [], total_size: 0, offset: 0, limit: 10 },
  sellerProductsLoading: true,
  sellerProductsError: null,
};

export const loadSellerInfo = createAsyncThunk(
  'sellerDetails/loadSellerInfo',
  async (sellerId) => {
    console.log("[sellerDetails/loadSellerInfo]", sellerId);
    const {data} = await axiosBuyerClient.get(`seller/?seller_id=${sellerId}`);
    console.log("[sellerDetails/loadSellerInfo]", data);
    return data;
  },
);

export const loadSellerProducts = createAsyncThunk(
  'sellerDetails/loadSellerProducts',
  async ({sellerId, limit = 10, offset = 0}) => {
    const {data} = await axiosBuyerClient.get(
      `seller/${sellerId}/products/?limit=${limit}&offset=${offset}`,
    );
    return data;
  },
);

export const loadSellerAllProducts = createAsyncThunk(
  'sellerDetails/loadSellerAllProducts',
  async ({sellerId, limit = 10, offset = 0, search = ''}) => {
    const {data} = await axiosBuyerClient.get(
      `seller/${sellerId}/all-products/?limit=${limit}&offset=${offset}&search=${search}`,
    );
    return data;
  },
);

const slice = createSlice({
  name: 'sellerDetails',
  initialState,
  reducers: {
    clearSellerDetails: (state) => {
      state.sellerInfo = null;
      state.sellerInfoLoading = true;
      state.sellerInfoError = null;
      state.sellerProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.sellerProductsLoading = true;
      state.sellerProductsError = null;
    },
  },
  extraReducers: builder => {
    // Seller Info
    builder.addCase(loadSellerInfo.pending, (state) => {
      state.sellerInfo = null;
      state.sellerInfoLoading = true;
      state.sellerInfoError = null;
    });
    builder.addCase(loadSellerInfo.fulfilled, (state, {payload}) => {
      state.sellerInfo = payload;
      state.sellerInfoLoading = false;
      state.sellerInfoError = null;
    });
    builder.addCase(loadSellerInfo.rejected, (state, action) => {
      state.sellerInfo = null;
      state.sellerInfoLoading = false;
      state.sellerInfoError = action.error?.message || 'Failed to load seller info';
    });

    // Seller Products
    builder.addCase(loadSellerProducts.pending, (state) => {
      state.sellerProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.sellerProductsLoading = true;
      state.sellerProductsError = null;
    });
    builder.addCase(loadSellerProducts.fulfilled, (state, {payload, meta}) => {
      if (meta.arg.offset > 0) {
        state.sellerProducts.products = [
          ...state.sellerProducts.products,
          ...(payload.products || []),
        ];
      } else {
        state.sellerProducts.products = payload.products || [];
      }
      state.sellerProducts.total_size = payload.total_size || 0;
      state.sellerProducts.offset = meta.arg.offset || 0;
      state.sellerProducts.limit = meta.arg.limit || 10;
      state.sellerProductsLoading = false;
      state.sellerProductsError = null;
    });
    builder.addCase(loadSellerProducts.rejected, (state, action) => {
      state.sellerProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.sellerProductsLoading = false;
      state.sellerProductsError = action.error?.message || 'Failed to load seller products';
    });

    // Seller All Products
    builder.addCase(loadSellerAllProducts.pending, (state) => {
      state.sellerProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.sellerProductsLoading = true;
      state.sellerProductsError = null;
    });
    builder.addCase(loadSellerAllProducts.fulfilled, (state, {payload, meta}) => {
      if (meta.arg.offset > 0) {
        state.sellerProducts.products = [
          ...state.sellerProducts.products,
          ...(payload.products || []),
        ];
      } else {
        state.sellerProducts.products = payload.products || [];
      }
      state.sellerProducts.total_size = payload.total_size || 0;
      state.sellerProducts.offset = meta.arg.offset || 0;
      state.sellerProducts.limit = meta.arg.limit || 10;
      state.sellerProductsLoading = false;
      state.sellerProductsError = null;
    });
    builder.addCase(loadSellerAllProducts.rejected, (state, action) => {
      state.sellerProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.sellerProductsLoading = false;
      state.sellerProductsError = action.error?.message || 'Failed to load seller products';
    });
  },
});

// Selectors
const selectSellerDetailsData = state => state.sellerDetails;

export const selectSellerInfo = createSelector(
  selectSellerDetailsData,
  data => ({
    sellerInfo: data.sellerInfo,
    sellerInfoLoading: data.sellerInfoLoading,
    sellerInfoError: data.sellerInfoError,
  }),
);

export const selectSellerProducts = createSelector(
  selectSellerDetailsData,
  data => ({
    sellerProducts: data.sellerProducts,
    sellerProductsLoading: data.sellerProductsLoading,
    sellerProductsError: data.sellerProductsError,
  }),
);

export const {clearSellerDetails} = slice.actions;
export default slice.reducer; 