import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WatchedItem, watchedListService } from '../services/watchedListService';

interface WatchedListState {
  items: WatchedItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WatchedListState = {
  items: [],
  loading: false,
  error: null,
};

const watchedListSlice = createSlice({
  name: 'watchedList',
  initialState,
  reducers: {
    initializeWatchedList: (state) => {
      state.loading = true;
      state.error = null;
      try {
        state.items = watchedListService.getAllWatchedItems();
        state.loading = false;
      } catch (error) {
        state.error = 'Failed to load watched list';
        state.loading = false;
      }
    },
    
    addToWatchedList: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
      title: string;
      posterPath?: string;
    }>) => {
      try {
        const watchedItem = watchedListService.addToWatchedList(action.payload);
        const existingIndex = state.items.findIndex(
          item => item.id === action.payload.id && item.type === action.payload.type
        );
        
        if (existingIndex >= 0) {
          state.items[existingIndex] = watchedItem;
        } else {
          state.items.push(watchedItem);
        }
        state.error = null;
      } catch (error) {
        state.error = 'Failed to add item to watched list';
      }
    },
    
    removeFromWatchedList: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
    }>) => {
      try {
        watchedListService.removeFromWatchedList(action.payload.id, action.payload.type);
        state.items = state.items.filter(
          item => !(item.id === action.payload.id && item.type === action.payload.type)
        );
        state.error = null;
      } catch (error) {
        state.error = 'Failed to remove item from watched list';
      }
    },
    
    updateReview: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
      review: string;
    }>) => {
      try {
        watchedListService.updateReview(
          action.payload.id,
          action.payload.type,
          action.payload.review
        );
        
        const itemIndex = state.items.findIndex(
          item => item.id === action.payload.id && item.type === action.payload.type
        );
        
        if (itemIndex >= 0) {
          state.items[itemIndex].review = action.payload.review;
        }
        state.error = null;
      } catch (error) {
        state.error = 'Failed to update review';
      }
    },
    
    updateRating: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
      rating: number;
    }>) => {
      try {
        watchedListService.updateRating(
          action.payload.id,
          action.payload.type,
          action.payload.rating
        );
        
        const itemIndex = state.items.findIndex(
          item => item.id === action.payload.id && item.type === action.payload.type
        );
        
        if (itemIndex >= 0) {
          state.items[itemIndex].rating = action.payload.rating;
        }
        state.error = null;
      } catch (error) {
        state.error = 'Failed to update rating';
      }
    },
    
    addImageToItem: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
      imageFile: string;
      caption?: string;
    }>) => {
      try {
        watchedListService.addImage(
          action.payload.id,
          action.payload.type,
          action.payload.imageFile,
          action.payload.caption
        );
        
        const itemIndex = state.items.findIndex(
          item => item.id === action.payload.id && item.type === action.payload.type
        );
        
        if (itemIndex >= 0) {
          // Refresh the entire item from localStorage to get updated images
          const updatedItem = watchedListService.getWatchedItem(action.payload.id, action.payload.type);
          if (updatedItem) {
            state.items[itemIndex] = updatedItem;
          }
        }
        state.error = null;
      } catch (error) {
        state.error = 'Failed to add image';
      }
    },
    
    removeImageFromItem: (state, action: PayloadAction<{
      id: number;
      type: 'movie' | 'tv';
      imageId: string;
    }>) => {
      try {
        watchedListService.removeImage(
          action.payload.id,
          action.payload.type,
          action.payload.imageId
        );
        
        const itemIndex = state.items.findIndex(
          item => item.id === action.payload.id && item.type === action.payload.type
        );
        
        if (itemIndex >= 0) {
          // Refresh the entire item from localStorage to get updated images
          const updatedItem = watchedListService.getWatchedItem(action.payload.id, action.payload.type);
          if (updatedItem) {
            state.items[itemIndex] = updatedItem;
          }
        }
        state.error = null;
      } catch (error) {
        state.error = 'Failed to remove image';
      }
    },

    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  initializeWatchedList,
  addToWatchedList,
  removeFromWatchedList,
  updateReview,
  updateRating,
  addImageToItem,
  removeImageFromItem,
  clearError,
} = watchedListSlice.actions;

export default watchedListSlice.reducer;

// Selectors
export const selectWatchedItems = (state: { watchedList: WatchedListState }) => state.watchedList.items;
export const selectWatchedListLoading = (state: { watchedList: WatchedListState }) => state.watchedList.loading;
export const selectWatchedListError = (state: { watchedList: WatchedListState }) => state.watchedList.error;

export const selectIsWatched = (id: number, type: 'movie' | 'tv') => 
  (state: { watchedList: WatchedListState }) => 
    state.watchedList.items.some(item => item.id === id && item.type === type);

export const selectWatchedItem = (id: number, type: 'movie' | 'tv') =>
  (state: { watchedList: WatchedListState }) =>
    state.watchedList.items.find(item => item.id === id && item.type === type);