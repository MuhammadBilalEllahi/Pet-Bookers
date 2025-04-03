import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {axiosBuyerClient} from '../utils/axiosClient';

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
      dispatch(setBaseUrls(result.base_urls));
    }
  },
);

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
