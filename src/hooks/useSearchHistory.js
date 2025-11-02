import { useState, useEffect } from 'react';

const STORAGE_KEY = 'product_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Custom hook to manage search history in localStorage
 * @returns {Object} Search history state and methods
 */
export const useSearchHistory = () => {
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('[Search History] Error loading from localStorage:', error);
      setHistory([]);
    }
  }, []);

  /**
   * Add a search query to history with metadata
   * @param {string} query - Search query to add
   * @param {Object} metadata - Additional data (resultsCount, aspectsDetected, etc.)
   */
  const addToHistory = (query, metadata = {}) => {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return;
    }

    const trimmedQuery = query.trim();

    setHistory(prevHistory => {
      // Create history item with metadata
      const historyItem = {
        query: trimmedQuery,
        timestamp: Date.now(),
        resultsCount: metadata.resultsCount || 0,
        aspectsDetected: metadata.aspectsDetected || [],
        hasABSA: metadata.hasABSA || false,
        ...metadata
      };

      // Remove duplicate if exists (by query)
      const filtered = prevHistory.filter(
        item => {
          const itemQuery = typeof item === 'string' ? item : item.query;
          return itemQuery.toLowerCase() !== trimmedQuery.toLowerCase();
        }
      );

      // Add to beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [historyItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('[Search History] Error saving to localStorage:', error);
      }

      return newHistory;
    });
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('[Search History] Error clearing localStorage:', error);
    }
  };

  /**
   * Remove a specific item from history
   * @param {string} query - Query to remove
   */
  const removeFromHistory = (query) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item !== query);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('[Search History] Error updating localStorage:', error);
      }

      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    hasHistory: history.length > 0
  };
};
