import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';
import { BASE_URL } from '../utils/constants';

const initialState = {
  showBottomTabBar: true,
  baseUrls: {},
  companyLogo: null,
};

export const loadAppConfigs = createAsyncThunk(
  'configs/load',
  async (_, {dispatch}) => {
    const {data: result} = await axiosBuyerClient.get('config');
    if (result) {
      dispatch(setCompanyLogo(result.company_logo));
      console.log("BASE URLS", result.base_urls);
      dispatch(setBaseUrls(result.base_urls));
    }
  },
);

/***
{  "banner_image_url": "https://petbookers.com.pk/storage/app/public/banner",
   "brand_image_url": "https://petbookers.com.pk/storage/app/public/brand",
   "category_image_url": "https://petbookers.com.pk/storage/app/public/category",
   "customer_image_url": "https://petbookers.com.pk/storage/app/public/profile",
   "delivery_man_image_url": "https://petbookers.com.pk/storage/app/public/delivery-man",
   "digital_product_url": "https://petbookers.com.pk/storage/app/public/product/digital-product",
   "notification_image_url": "https://petbookers.com.pk/storage/app/public/notification",
   "product_image_url": "https://petbookers.com.pk/storage/app/public/product",
   "product_thumbnail_url": "https://petbookers.com.pk/storage/app/public/product/thumbnail",
   "review_image_url": "https://petbookers.com.pk/storage/app/public",
   "seller_image_url": "https://petbookers.com.pk/storage/app/public/seller",
   "shop_image_url": "https://petbookers.com.pk/storage/app/public/shop"
  }
*/

export const BASE_URLS = {
  banner_image_url: `${BASE_URL}storage/app/public/banner`,
  brand_image_url: `${BASE_URL}storage/app/public/brand`,
  category_image_url: `${BASE_URL}storage/app/public/category`,
  customer_image_url: `${BASE_URL}storage/app/public/profile`,
  delivery_man_image_url: `${BASE_URL}storage/app/public/delivery-man`,
  digital_product_url: `${BASE_URL}storage/app/public/product/digital-product`,
  notification_image_url: `${BASE_URL}storage/app/public/notification`,
  product_image_url: `${BASE_URL}storage/app/public/product`,
  product_thumbnail_url: `${BASE_URL}storage/app/public/product/thumbnail`,
  review_image_url: `${BASE_URL}storage/app/public`,
  seller_image_url: `${BASE_URL}storage/app/public/seller`,
  shop_image_url: `${BASE_URL}storage/app/public/shop`,
  lucky_draw_url: `${BASE_URL}public/images`
};


const slice = createSlice({
  name: 'configs',
  initialState,
  reducers: {
    setBottomTabBarVisibility: (state, {payload}) => {
      state.showBottomTabBar = payload;
    },
    setCompanyLogo: (state, {payload}) => {
      state.companyLogo = payload;
    },
    setBaseUrls: (state, {payload}) => {
      state.baseUrls = payload;
    },
  },
});

// ACTIONS

export const {setBottomTabBarVisibility, setCompanyLogo, setBaseUrls} =
  slice.actions;

// SELECTORS
const selectConfigsData = state => {
  return state.configs;
};

export const selectShowBottomTabBar = createSelector(
  selectConfigsData,
  data => data.showBottomTabBar,
);

export const selectCompanyLogo = createSelector(
  selectConfigsData,
  data => data.companyLogo,
);

export const selectBaseUrls = createSelector(
  selectConfigsData,
  data => data.baseUrls,
);

export default slice.reducer;
