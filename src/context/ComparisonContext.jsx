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
    removeFromComparison,
    toggleComparison,
    isSelected,
    clearComparison,
    isModalOpen,
    openModal,
    closeModal,
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
