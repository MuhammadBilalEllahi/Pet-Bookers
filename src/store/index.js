import {combineReducers, configureStore} from '@reduxjs/toolkit';
import thunk from 'redux-thunk';

import configsReducer from './configs';
import userReducer from './user';
import buyersHomeReducer from './buyersHome';
import productCategoriesReducer from './productCategories';
import chatReducer from './chat';
import sellerDetailsReducer from './sellerDetails';

const rootReducer = combineReducers({
  configs: configsReducer,
  user: userReducer,
  buyersHome: buyersHomeReducer,
  productCategories: productCategoriesReducer,
  chat: chatReducer,
  sellerDetails: sellerDetailsReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk],
});
