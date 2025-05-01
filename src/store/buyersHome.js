import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

const initialState = {
  homeBanners: [],
  homeBannersLoading: true,
  homeBannersError: null,
  featuredProducts: [],
  featuredProductsLoading: true,
  featuredProductsError: null,
  latestProducts: [],
  latestProductsLoading: true,
  latestProductsError: null,
  popularProducts: [],
  popularProductsLoading: true,
  popularProductsError: null,
  // Lucky Draw State
  luckyDraws: [],
  luckyDrawsLoading: false,
  luckyDrawsError: null,
};

export const loadHomeBanners = createAsyncThunk(
  'buyersHome/loadBanners',
  async ({bannerType}) => {
    const {data: result} = await axiosBuyerClient.get(
      `banners/?banner_type=${bannerType}`,
    );
    return result;
  },
);

export const loadFeaturedProducts = createAsyncThunk(
  'buyersHome/loadFeaturedProducts',
  async ({limit}) => {
    const {data: result} = await axiosBuyerClient.get(
      `products/featured/?limit=${limit}`,
    );
    return result.products;
  },
);

export const loadLatestProducts = createAsyncThunk(
  'buyersHome/loadLatestProducts',
  async ({limit}) => {
    const {data: result} = await axiosBuyerClient.get(
      `products/latest/?limit=${limit}`,
    );
    return result.products;
  },
);

export const loadPopularProducts = createAsyncThunk(
  'buyersHome/loadPopularProducts',
  async ({limit}) => {
    const {data: result} = await axiosBuyerClient.get(
      `products/top-rated/?limit=${limit}`,
    );
    return result.products;
  },
);

export const loadLuckyDraws = createAsyncThunk(
  'buyersHome/loadLuckyDraws',
  async () => {
    const {data} = await axiosBuyerClient.get('lucky_draw');
    // Adjust if API shape is different
    return data.lucky_draws || data;
  }
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
      state.featuredProducts = [];
      state.featuredProductsLoading = true;
      state.featuredProductsError = null;
    });
    builder.addCase(loadFeaturedProducts.fulfilled, (state, {payload}) => {
      state.featuredProducts = payload;
      state.featuredProductsLoading = false;
      state.featuredProductsError = null;
    });
    builder.addCase(loadFeaturedProducts.rejected, (state, action) => {
      state.featuredProducts = [];
      state.featuredProductsLoading = false;
      state.featuredProductsError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadLatestProducts.pending, (state, action) => {
      state.latestProducts = [];
      state.latestProductsLoading = true;
      state.latestProductsError = null;
    });
    builder.addCase(loadLatestProducts.fulfilled, (state, {payload}) => {
      state.latestProducts = payload;
      state.latestProductsLoading = false;
      state.latestProductsError = null;
    });
    builder.addCase(loadLatestProducts.rejected, (state, action) => {
      state.latestProducts = [];
      state.latestProductsLoading = false;
      state.latestProductsError =
        action.payload || 'Failed to load the banners data';
    });
    builder.addCase(loadPopularProducts.pending, (state, action) => {
      state.popularProducts = [];
      state.popularProductsLoading = true;
      state.popularProductsError = null;
    });
    builder.addCase(loadPopularProducts.fulfilled, (state, {payload}) => {
      state.popularProducts = payload;
      state.popularProductsLoading = false;
      state.popularProductsError = null;
    });
    builder.addCase(loadPopularProducts.rejected, (state, action) => {
      state.popularProducts = [];
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
  data => {
    return {
      featuredProducts: data.featuredProducts,
      featuredProductsLoading: data.featuredProductsLoading,
      featuredProductsError: data.featuredProductsError,
    };
  },
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

export default slice.reducer;
