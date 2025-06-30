import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './features/themeSlice'; // or wherever your reducer is

const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

export default store;
