import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

const initialState = {
  homeBanners: [],
  homeBannersLoading: true,
  homeBannersError: null,
  featuredProducts: { products: [], total_size: 0, offset: 0, limit: 10 },
  featuredProductsLoading: true,
  featuredProductsError: null,
  latestProducts: { products: [], total_size: 0, offset: 0, limit: 10 },
  latestProductsLoading: true,
  latestProductsError: null,
  popularProducts: { products: [], total_size: 0, offset: 0, limit: 10 },
  popularProductsLoading: true,
  popularProductsError: null,
  // Sellers State
  sellers: [],
  sellersLoading: true,
  sellersError: null,
  // Lucky Draw State
  luckyDraws: [],
  luckyDrawsLoading: false,
  luckyDrawsError: null,
};

export const loadHomeBanners = createAsyncThunk(
  'buyersHome/loadBanners',
  async ({bannerType}) => {
    const {data} = await axiosBuyerClient.get(
      `banners/?banner_type=${bannerType}`,
    );
    console.log("[buyersHome/loadBanners]", data);
    return data;
  },
);

export const loadFeaturedProducts = createAsyncThunk(
  'buyersHome/loadFeaturedProducts',
  async ({limit, offset = 0}) => {
    const {data} = await axiosBuyerClient.get(
      `products/featured/?limit=${limit}&offset=${offset}`,
    );
    return data;
  },
);

export const loadLatestProducts = createAsyncThunk(
  'buyersHome/loadLatestProducts',
  async ({limit, offset = 0}) => {
    const {data} = await axiosBuyerClient.get(
      `products/latest/?limit=${limit}&offset=${offset}`,
    );
    return data;
  },
);

export const loadPopularProducts = createAsyncThunk(
  'buyersHome/loadPopularProducts',
  async ({limit, offset = 0}) => {
    const {data} = await axiosBuyerClient.get(
      `products/top-rated/?limit=${limit}&offset=${offset}`,
    );
    return data;
  },
);

export const loadLuckyDraws = createAsyncThunk(
  'buyersHome/loadLuckyDraws',
  async () => {
    const {data} = await axiosBuyerClient.get('lucky_draw');
    console.log("[buyersHome/loadLuckyDraws]", data);
    return data.lucky_draws || data;
  }
);

export const loadSellers = createAsyncThunk(
  'buyersHome/loadSellers',
  async () => {
    const {data} = await axiosBuyerClient.get('seller/all');
    console.log("[buyersHome/loadSellers]", data);
    return data;
  },
);

const slice = createSlice({
  name: 'buyersHome',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loadHomeBanners.pending, (state, action) => {
      state.homeBanners = [];
      state.homeBannersLoading = true;
      state.homeBannersError = null;
    });
    builder.addCase(loadHomeBanners.fulfilled, (state, {payload}) => {
      state.homeBanners = payload;
      state.homeBannersLoading = false;
      state.homeBannersError = null;
    });
    builder.addCase(loadHomeBanners.rejected, (state, action) => {
      state.homeBanners = [];
      state.homeBannersLoading = false;
      state.homeBannersError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadFeaturedProducts.pending, (state, action) => {
      state.featuredProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.featuredProductsLoading = true;
      state.featuredProductsError = null;
    });
    builder.addCase(loadFeaturedProducts.fulfilled, (state, {payload, meta}) => {
      if (meta.arg.offset > 0) {
        // Append for pagination
        state.featuredProducts.products = [
          ...state.featuredProducts.products,
          ...(payload.products || []),
        ];
      } else {
        // First page or refresh
        state.featuredProducts.products = payload.products || [];
      }
      state.featuredProducts.total_size = payload.total_size || 0;
      state.featuredProducts.offset = meta.arg.offset || 0;
      state.featuredProducts.limit = meta.arg.limit || 10;
      state.featuredProductsLoading = false;
      state.featuredProductsError = null;
    });
    builder.addCase(loadFeaturedProducts.rejected, (state, action) => {
      state.featuredProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.featuredProductsLoading = false;
      state.featuredProductsError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadLatestProducts.pending, (state, action) => {
      state.latestProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.latestProductsLoading = true;
      state.latestProductsError = null;
    });
    builder.addCase(loadLatestProducts.fulfilled, (state, {payload, meta}) => {
      if (meta.arg.offset > 0) {
        state.latestProducts.products = [
          ...state.latestProducts.products,
          ...(payload.products || []),
        ];
      } else {
        state.latestProducts.products = payload.products || [];
      }
      state.latestProducts.total_size = payload.total_size || 0;
      state.latestProducts.offset = meta.arg.offset || 0;
      state.latestProducts.limit = meta.arg.limit || 10;
      state.latestProductsLoading = false;
      state.latestProductsError = null;
    });
    builder.addCase(loadLatestProducts.rejected, (state, action) => {
      state.latestProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.latestProductsLoading = false;
      state.latestProductsError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadPopularProducts.pending, (state, action) => {
      state.popularProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.popularProductsLoading = true;
      state.popularProductsError = null;
    });
    builder.addCase(loadPopularProducts.fulfilled, (state, {payload, meta}) => {
      if (meta.arg.offset > 0) {
        state.popularProducts.products = [
          ...state.popularProducts.products,
          ...(payload.products || []),
        ];
      } else {
        state.popularProducts.products = payload.products || [];
      }
      state.popularProducts.total_size = payload.total_size || 0;
      state.popularProducts.offset = meta.arg.offset || 0;
      state.popularProducts.limit = meta.arg.limit || 10;
      state.popularProductsLoading = false;
      state.popularProductsError = null;
    });
    builder.addCase(loadPopularProducts.rejected, (state, action) => {
      state.popularProducts = { products: [], total_size: 0, offset: 0, limit: 10 };
      state.popularProductsLoading = false;
      state.popularProductsError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadLuckyDraws.pending, (state) => {
      state.luckyDrawsLoading = true;
      state.luckyDrawsError = null;
    });
    builder.addCase(loadLuckyDraws.fulfilled, (state, {payload}) => {
      state.luckyDraws = payload;
      state.luckyDrawsLoading = false;
      state.luckyDrawsError = null;
    });
    builder.addCase(loadLuckyDraws.rejected, (state, action) => {
      state.luckyDraws = [];
      state.luckyDrawsLoading = false;
      state.luckyDrawsError = action.error?.message || 'Failed to load lucky draws';
    });
    builder.addCase(loadSellers.pending, (state) => {
      state.sellers = [];
      state.sellersLoading = true;
      state.sellersError = null;
    });
    builder.addCase(loadSellers.fulfilled, (state, {payload}) => {
      state.sellers = payload;
      state.sellersLoading = false;
      state.sellersError = null;
    });
    builder.addCase(loadSellers.rejected, (state, action) => {
      state.sellers = [];
      state.sellersLoading = false;
      state.sellersError = action.error?.message || 'Failed to load sellers';
    });
  },
});

// ACTIONS

// SELECTORS
const selectBuyersHomeData = state => {
  return state.buyersHome;
};

export const selectHomeBanners = createSelector(selectBuyersHomeData, data => {
  return {
    homeBanners: data.homeBanners,
    homeBannersLoading: data.homeBannersLoading,
    homeBannersError: data.homeBannersError,
  };
});

export const selectFeaturedProducts = createSelector(
  selectBuyersHomeData,
  data => ({
    featuredProducts: data.featuredProducts,
    featuredProductsLoading: data.featuredProductsLoading,
    featuredProductsError: data.featuredProductsError,
  }),
);

export const selectLatestProducts = createSelector(
  selectBuyersHomeData,
  data => {
    return {
      latestProducts: data.latestProducts,
      latestProductsLoading: data.latestProductsLoading,
      latestProductsError: data.latestProductsError,
    };
  },
);

export const selectPopularProducts = createSelector(
  selectBuyersHomeData,
  data => {
    return {
      popularProducts: data.popularProducts,
      popularProductsLoading: data.popularProductsLoading,
      popularProductsError: data.popularProductsError,
    };
  },
);

export const selectLuckyDraws = createSelector(
  state => state.buyersHome,
  data => ({
    luckyDraws: data.luckyDraws,
    luckyDrawsLoading: data.luckyDrawsLoading,
    luckyDrawsError: data.luckyDrawsError,
  })
);

export const selectSellers = createSelector(
  selectBuyersHomeData,
  data => ({
    sellers: data.sellers,
    sellersLoading: data.sellersLoading,
    sellersError: data.sellersError,
  }),
);

export default slice.reducer;
