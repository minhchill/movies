import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { tmdbApi } from '@/services/TMDB';
import watchedListReducer, { initializeWatchedList } from '@/features/watchedList/slice/watchedListSlice';

// Redux Persist configuration for watched list
const watchedListPersistConfig = {
  key: 'watchedList',
  storage,
  whitelist: ['items'], // Only persist the items array
};

const persistedWatchedListReducer = persistReducer(watchedListPersistConfig, watchedListReducer);

export const store = configureStore({
  reducer: {
    [tmdbApi.reducerPath]: tmdbApi.reducer,
    watchedList: persistedWatchedListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(tmdbApi.middleware),
});

// Initialize watched list from localStorage on app start
store.dispatch(initializeWatchedList());

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;