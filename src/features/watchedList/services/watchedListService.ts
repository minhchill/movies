import { v4 as uuidv4 } from 'uuid';

export interface WatchedImage {
  id: string;
  file: string;
  caption?: string;
  dateAdded: string;
}

export interface WatchedItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  dateWatched: string;
  review?: string;
  rating?: number;
  images: WatchedImage[];
}

const WATCHED_LIST_KEY = 'tmovies_watched_list';

class WatchedListService {
  private getWatchedList(): WatchedItem[] {
    try {
      const stored = localStorage.getItem(WATCHED_LIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading watched list from localStorage:', error);
      return [];
    }
  }

  private saveWatchedList(watchedList: WatchedItem[]): void {
    try {
      localStorage.setItem(WATCHED_LIST_KEY, JSON.stringify(watchedList));
    } catch (error) {
      console.error('Error saving watched list to localStorage:', error);
    }
  }

  addToWatchedList(item: Omit<WatchedItem, 'dateWatched' | 'images'>): WatchedItem {
    const watchedList = this.getWatchedList();
    
    // Check if item already exists
    const existingIndex = watchedList.findIndex(
      watched => watched.id === item.id && watched.type === item.type
    );
    
    const watchedItem: WatchedItem = {
      ...item,
      dateWatched: new Date().toISOString(),
      images: []
    };
    
    if (existingIndex >= 0) {
      // Update existing item
      watchedList[existingIndex] = { ...watchedList[existingIndex], ...watchedItem };
    } else {
      // Add new item
      watchedList.push(watchedItem);
    }
    
    this.saveWatchedList(watchedList);
    return watchedItem;
  }

  removeFromWatchedList(id: number, type: 'movie' | 'tv'): void {
    const watchedList = this.getWatchedList();
    const filteredList = watchedList.filter(
      item => !(item.id === id && item.type === type)
    );
    this.saveWatchedList(filteredList);
  }

  isWatched(id: number, type: 'movie' | 'tv'): boolean {
    const watchedList = this.getWatchedList();
    return watchedList.some(item => item.id === id && item.type === type);
  }

  getWatchedItem(id: number, type: 'movie' | 'tv'): WatchedItem | undefined {
    const watchedList = this.getWatchedList();
    return watchedList.find(item => item.id === id && item.type === type);
  }

  getAllWatchedItems(): WatchedItem[] {
    return this.getWatchedList();
  }

  updateReview(id: number, type: 'movie' | 'tv', review: string): void {
    const watchedList = this.getWatchedList();
    const itemIndex = watchedList.findIndex(
      item => item.id === id && item.type === type
    );
    
    if (itemIndex >= 0) {
      watchedList[itemIndex].review = review;
      this.saveWatchedList(watchedList);
    }
  }

  updateRating(id: number, type: 'movie' | 'tv', rating: number): void {
    const watchedList = this.getWatchedList();
    const itemIndex = watchedList.findIndex(
      item => item.id === id && item.type === type
    );
    
    if (itemIndex >= 0) {
      watchedList[itemIndex].rating = rating;
      this.saveWatchedList(watchedList);
    }
  }

  addImage(id: number, type: 'movie' | 'tv', imageFile: string, caption?: string): void {
    const watchedList = this.getWatchedList();
    const itemIndex = watchedList.findIndex(
      item => item.id === id && item.type === type
    );
    
    if (itemIndex >= 0) {
      const newImage: WatchedImage = {
        id: uuidv4(),
        file: imageFile,
        caption,
        dateAdded: new Date().toISOString()
      };
      
      watchedList[itemIndex].images.push(newImage);
      this.saveWatchedList(watchedList);
    }
  }

  removeImage(id: number, type: 'movie' | 'tv', imageId: string): void {
    const watchedList = this.getWatchedList();
    const itemIndex = watchedList.findIndex(
      item => item.id === id && item.type === type
    );
    
    if (itemIndex >= 0) {
      watchedList[itemIndex].images = watchedList[itemIndex].images.filter(
        image => image.id !== imageId
      );
      this.saveWatchedList(watchedList);
    }
  }
}

export const watchedListService = new WatchedListService();