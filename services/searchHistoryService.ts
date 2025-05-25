import { SearchHistoryItem } from '../types';

const STORAGE_KEY = 'plantwizard_search_history';
const MAX_HISTORY_ITEMS = 50;

export const searchHistoryService = {
  // Get all search history from localStorage
  getHistory(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const history = JSON.parse(stored) as SearchHistoryItem[];
      // Sort by timestamp (newest first)
      return history.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  },

  // Add a new search to history
  addToHistory(item: Omit<SearchHistoryItem, 'id' | 'timestamp'>): SearchHistoryItem {
    try {
      const history = this.getHistory();
      
      // Check if this plant name already exists in recent history (last 5 items)
      const recentHistory = history.slice(0, 5);
      const existingIndex = recentHistory.findIndex(
        h => h.plantName.toLowerCase() === item.plantName.toLowerCase() && 
             h.searchType === item.searchType
      );
      
      const newItem: SearchHistoryItem = {
        ...item,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };

      let updatedHistory: SearchHistoryItem[];
      
      if (existingIndex !== -1) {
        // Remove the existing item and add the new one at the beginning
        updatedHistory = [newItem, ...history.filter((_, index) => index !== existingIndex)];
      } else {
        // Add new item at the beginning
        updatedHistory = [newItem, ...history];
      }
      
      // Keep only the most recent items
      if (updatedHistory.length > MAX_HISTORY_ITEMS) {
        updatedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return newItem;
    } catch (error) {
      console.error('Error saving to search history:', error);
      return {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
    }
  },

  // Remove a specific item from history
  removeFromHistory(id: string): SearchHistoryItem[] {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return updatedHistory;
    } catch (error) {
      console.error('Error removing from search history:', error);
      return this.getHistory();
    }
  },

  // Clear all search history
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  },

  // Create a thumbnail from base64 image data
  createThumbnail(base64Image: string, maxSize: number = 100): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(base64Image);
          return;
        }

        // Calculate new dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth, newHeight;
        if (width > height) {
          newWidth = maxSize;
          newHeight = maxSize / aspectRatio;
        } else {
          newHeight = maxSize;
          newWidth = maxSize * aspectRatio;
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnail);
      };
      
      img.onerror = () => resolve(base64Image);
      img.src = base64Image;
    });
  }
}; 