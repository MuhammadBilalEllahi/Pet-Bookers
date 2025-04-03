import {combineReducers, configureStore} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import configsReducer from './configs';
import userReducer from './user';
import buyersHomeReducer from './buyersHome';
import productCategoriesReducer from './productCategories';
import chatReducer from './chat';

const rootReducer = combineReducers({
  configs: configsReducer,
  user: userReducer,
  buyersHome: buyersHomeReducer,
  productCategories: productCategoriesReducer,
  chat: chatReducer,
});
export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
});
