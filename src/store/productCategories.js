import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

const initialState = {
  categories: [],
  categoriesLoading: true,
  categoriesError: null,
};

export const loadProductCategories = createAsyncThunk(
  'productCategories/loadCategories',
  async () => {
    const {data: result} = await axiosBuyerClient.get('categories');
    return result;
  },
);

const slice = createSlice({
  name: 'productCategories',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(loadProductCategories.pending, (state, action) => {
      state.categories = [];
      state.categoriesLoading = true;
      state.categoriesError = null;
    });
    builder.addCase(loadProductCategories.fulfilled, (state, {payload}) => {
      state.categories = payload;
      state.categoriesLoading = false;
      state.categoriesError = null;
    });
    builder.addCase(loadProductCategories.rejected, (state, action) => {
      state.categories = [];
      state.categoriesLoading = false;
      state.categoriesError =
        action.payload || 'Failed to load the banners data';
    });
  },
});

// ACTIONS

// SELECTORS
const selectProductCategoriesData = state => {
  return state.productCategories;
};

export const selectProductCategories = createSelector(
  selectProductCategoriesData,
  data => {
    return {
      categories: data.categories,
      categoriesLoading: data.categoriesLoading,
      categoriesError: data.categoriesError,
    };
  },
);

export default slice.reducer;
