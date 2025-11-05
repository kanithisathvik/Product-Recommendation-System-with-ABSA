import React from 'react';
import { X, ArrowLeft, ArrowRight, TrendingUp, Star, DollarSign } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { SentimentBadgeList } from './SentimentBadge';

/**
 * Product Comparison Modal
 * Opens in a new full-screen overlay/tab view
 * Shows side-by-side comparison of selected products
 */
const ProductComparisonModal = () => {
  const { selectedProducts, isModalOpen, closeModal, removeFromComparison, clearComparison } = useComparison();

  // Helpers to normalize fields for display
  const toNum = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const getProductName = (p) => p?.['Product Name'] || p?.name || p?.product_name || p?.title || 'Product';
  const getImage = (p) => p?.image || p?.img || p?.imageUrl || p?.product_image || p?.thumbnail || '';
  const getSinglePrice = (p) => toNum(p?.['Price'] ?? p?.price ?? p?.selling_price ?? p?.sellingPrice ?? p?.current_price);

  if (!isModalOpen) return null;

  /**
   * Get common aspects across all products
   */
  const getCommonAspects = () => {
    if (selectedProducts.length === 0) return [];
    
    const allAspects = new Set();
    selectedProducts.forEach(product => {
      if (product.sentimentAnalysis?.aspects) {
        Object.keys(product.sentimentAnalysis.aspects).forEach(aspect => {
          allAspects.add(aspect);
        });
      }
    });
    
    return Array.from(allAspects);
  };

  /**
   * Get aspect sentiment for a product
   */
  const getAspectSentiment = (product, aspect) => {
    if (!product.sentimentAnalysis?.aspects) return 'neutral';
    return product.sentimentAnalysis.aspects[aspect] || 'neutral';
  };

  /**
   * Get sentiment color
   */
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      case 'neutral': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Calculate price difference
   */
  const calculatePriceDiff = (basePrice, comparePrice) => {
    const diff = comparePrice - basePrice;
    const percent = ((diff / basePrice) * 100).toFixed(1);
    
    if (diff > 0) {
      return <span className="text-red-600">+${diff.toFixed(2)} (+{percent}%)</span>;
    } else if (diff < 0) {
      return <span className="text-green-600">-${Math.abs(diff).toFixed(2)} ({percent}%)</span>;
    }
    return <span className="text-gray-600">Same</span>;
  };

  const commonAspects = getCommonAspects();

  // Build dynamic technical specification keys from selected products
  const specExclude = new Set([
    'id','_id','category','Product Name','product_name','name','title','productName','Product_Name','Name',
    'image','img','imageUrl','image_url','product_image','thumbnail',
    'Price','price','selling_price','sellingPrice','current_price','salePrice','originalPrice','original_price','mrp','list_price','listPrice','discount',
    'rating','Rating','product_rating','averageRating','stars','reviews','reviews_count','reviewsCount','total_reviews','numReviews',
    'sentiments','sentimentDetails','sentimentScore','aspectScores','reviewResults','reviewsAnalyzed','totalReviews','match'
  ]);

  const toTitle = (k) => k
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());

  const collectSpecKeys = () => {
    const keys = new Set();
    selectedProducts.forEach(p => {
      Object.keys(p || {}).forEach(k => {
        const lower = k.toLowerCase();
        if (specExclude.has(k)) return;
        if (lower.includes('review') || lower.includes('sentiment')) return;
        keys.add(k);
      });
    });
    return Array.from(keys);
  };

  const specKeys = collectSpecKeys();

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Product Comparison</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    Comparing {selectedProducts.length} products side-by-side
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
                  aria-label="Close comparison"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 p-4 text-left font-semibold text-gray-700 border-r-2 border-gray-200 min-w-[200px]">
                    Feature
                  </th>
                  {selectedProducts.map(product => (
                    <th key={product.id} className="p-4 min-w-[280px] border-l border-gray-200">
                      <div className="flex flex-col items-center gap-3">
                        {/* Product Image */}
                        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getImage(product)}
                            alt={getProductName(product)}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeFromComparison(product.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Product Name */}
                        <div className="text-center">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {getProductName(product)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              
              <tbody>
                {/* Price Row */}
                <tr className="border-t-2 border-gray-200 bg-purple-50">
                  <td className="sticky left-0 z-10 bg-purple-50 p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                      Price
                    </div>
                  </td>
                  {selectedProducts.map((product, index) => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const p = getSinglePrice(product);
                            return p !== null ? `₹${p.toLocaleString()}` : '—';
                          })()}
                        </span>
                        {index > 0 && (
                          <div className="text-xs mt-1">
                            vs. Product 1: {(() => {
                              const base = getSinglePrice(selectedProducts[0]);
                              const current = getSinglePrice(product);
                              if (base && current) {
                                return calculatePriceDiff(base, current);
                              }
                              return <span className="text-gray-600">N/A</span>;
                            })()}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-t border-gray-200">
                  <td className="sticky left-0 z-10 bg-white p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Rating
                    </div>
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-semibold">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {product.reviews} reviews
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Dynamic Technical Specifications */}
                {specKeys.map((key) => (
                  <tr key={key} className="border-t border-gray-100">
                    <td className="sticky left-0 z-10 bg-white p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                      {toTitle(key)}
                    </td>
                    {selectedProducts.map((product) => {
                      const val = product?.[key];
                      let display;
                      if (val === null || val === undefined || val === '') {
                        display = <span className="text-gray-400">—</span>;
                      } else if (Array.isArray(val)) {
                        display = val.join(', ');
                      } else if (typeof val === 'object') {
                        display = JSON.stringify(val);
                      } else if (typeof val === 'boolean') {
                        display = val ? 'Yes' : 'No';
                      } else {
                        display = String(val);
                      }
                      return (
                        <td key={product.id} className="p-4 text-center border-l border-gray-200">
                          <span className="text-gray-800">{display}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Match Score Row (if available) */}
                {selectedProducts.some(p => p.match) && (
                  <tr className="border-t border-gray-200 bg-blue-50">
                    <td className="sticky left-0 z-10 bg-blue-50 p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Match Score
                      </div>
                    </td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center border-l border-gray-200">
                        {product.match ? (
                          <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full font-semibold">
                            {product.match}%
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Sentiment Score Row (if available) */}
                {selectedProducts.some(p => p.sentimentAnalysis?.overallScore) && (
                  <tr className="border-t border-gray-200">
                    <td className="sticky left-0 z-10 bg-white p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                      Sentiment Score
                    </td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center border-l border-gray-200">
                        {product.sentimentAnalysis?.overallScore ? (
                          <span className={`inline-block px-3 py-1 rounded-full font-semibold ${
                            product.sentimentAnalysis.overallScore >= 70 ? 'bg-green-100 text-green-700' :
                            product.sentimentAnalysis.overallScore >= 40 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {product.sentimentAnalysis.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Aspect Sentiments */}
                {commonAspects.length > 0 && (
                  <>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={selectedProducts.length + 1} className="p-4 font-bold text-gray-700">
                        Aspect-Based Sentiments
                      </td>
                    </tr>
                    
                    {commonAspects.map((aspect, index) => (
                      <tr key={aspect} className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className={`sticky left-0 z-10 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} p-4 font-medium text-gray-700 border-r-2 border-gray-200 capitalize`}>
                          {aspect.replace(/_/g, ' ')}
                        </td>
                        {selectedProducts.map(product => {
                          const sentiment = getAspectSentiment(product, aspect);
                          return (
                            <td key={product.id} className="p-4 text-center border-l border-gray-200">
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getSentimentColor(sentiment)}`}>
                                {sentiment}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </>
                )}

                {/* Availability Row */}
                <tr className="border-t-2 border-gray-200">
                  <td className="sticky left-0 z-10 bg-white p-4 font-semibold text-gray-700 border-r-2 border-gray-200">
                    Availability
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        In Stock
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                💡 Tip: Click the ✕ button on any product to remove it from comparison
              </p>
              <button
                onClick={closeModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
