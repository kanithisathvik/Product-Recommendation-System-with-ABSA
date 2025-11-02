import React from 'react';
import { GitCompare, X } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';

/**
 * Floating Comparison Button
 * Appears when 2 or more products are selected
 * Opens the comparison modal
 */
const ComparisonButton = () => {
  const { selectedProducts, count, openModal, clearComparison } = useComparison();

  // Only show when we have 2 or more products
  if (count < 2) return null;

  return (
    <div className="fixed bottom-8 right-8 z-40 animate-fadeIn">
      {/* Main comparison button */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center gap-3 px-6 py-4 group">
        <button
          onClick={openModal}
          className="flex items-center gap-3 flex-1"
          aria-label={`Compare ${count} products`}
        >
          <div className="relative">
            <GitCompare className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          </div>
          <div className="text-left">
            <div className="font-bold text-sm">Compare Products</div>
            <div className="text-xs text-purple-100">
              {count} selected
            </div>
          </div>
        </button>
        
        {/* Clear button */}
        <button
          onClick={clearComparison}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all ml-2 border-l border-white border-opacity-30"
          aria-label="Clear comparison"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Product previews */}
      <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
        {selectedProducts.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-lg p-2 flex items-center gap-2 text-sm transform transition-all hover:scale-105"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 object-cover rounded"
            />
            <span className="flex-1 text-gray-800 text-xs line-clamp-1">
              {product.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonButton;
