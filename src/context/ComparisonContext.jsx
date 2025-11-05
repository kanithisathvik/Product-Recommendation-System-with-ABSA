import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Comparison Context
 * Manages the state of products selected for comparison
 */
const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Maximum products that can be compared at once
  const MAX_COMPARISON = 4;

  /**
   * Add a product to comparison
   */
  const addToComparison = useCallback((product) => {
    setSelectedProducts(prev => {
      // Check if already in comparison
      if (prev.some(p => p.id === product.id)) {
        return prev;
      }
      
      // Check if maximum reached
      if (prev.length >= MAX_COMPARISON) {
        console.warn(`Maximum ${MAX_COMPARISON} products can be compared at once`);
        return prev;
      }
      
      return [...prev, product];
    });
  }, []);

  // Replace selection with a provided list (e.g., compare all search results)
  const setProductsForComparison = useCallback((products) => {
    if (!Array.isArray(products)) return;
    // Deduplicate by id, keep order
    const seen = new Set();
    const unique = products.filter(p => {
      const id = p?.id ?? p?._id ?? Math.random().toString(36).slice(2);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    setSelectedProducts(unique);
  }, []);

  // Set list and open modal in one call (prevents race with async state)
  const openWithProducts = useCallback((products) => {
    if (!Array.isArray(products)) return;
    const seen = new Set();
    const unique = products.filter(p => {
      const id = p?.id ?? p?._id ?? Math.random().toString(36).slice(2);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    setSelectedProducts(unique);
    if (unique.length >= 2) {
      setIsModalOpen(true);
    } else {
      console.warn('Need at least 2 products to compare');
    }
  }, []);

  /**
   * Remove a product from comparison
   */
  const removeFromComparison = useCallback((productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  /**
   * Toggle product in comparison
   */
  const toggleComparison = useCallback((product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= MAX_COMPARISON) {
          console.warn(`Maximum ${MAX_COMPARISON} products can be compared at once`);
          return prev;
        }
        return [...prev, product];
      }
    });
  }, []);

  /**
   * Check if product is selected for comparison
   */
  const isSelected = useCallback((productId) => {
    return selectedProducts.some(p => p.id === productId);
  }, [selectedProducts]);

  /**
   * Clear all selected products
   */
  const clearComparison = useCallback(() => {
    setSelectedProducts([]);
  }, []);

  /**
   * Open comparison modal
   */
  const openModal = useCallback(() => {
    if (selectedProducts.length >= 2) {
      setIsModalOpen(true);
    }
  }, [selectedProducts.length]);

  /**
   * Close comparison modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = {
    selectedProducts,
    addToComparison,
    setProductsForComparison,
    removeFromComparison,
    toggleComparison,
    isSelected,
    clearComparison,
    isModalOpen,
    openModal,
    closeModal,
    openWithProducts,
    canAddMore: selectedProducts.length < MAX_COMPARISON,
    count: selectedProducts.length,
    maxComparison: MAX_COMPARISON
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};
