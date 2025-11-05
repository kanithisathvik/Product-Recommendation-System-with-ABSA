import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { X, Star, Package, Award, Zap, ExternalLink } from 'lucide-react';
import ReviewAnalysisDetails from './ReviewAnalysisDetails';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

/**
 * Product Details Modal
 * Shows comprehensive product information in a modal overlay
 * Uses React Portal for proper z-index management
 * Fully accessible and mobile-friendly
 */
const ProductDetailsModal = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const { addViewedProduct } = useRecentlyViewed();
  const [showAllFields, setShowAllFields] = useState(false);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Track recently viewed when opened
  useEffect(() => {
    if (isOpen && product) {
      addViewedProduct(product);
    }
  }, [isOpen, product, addViewedProduct]);

  // Focus trap for accessibility
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  // Log all product fields (Python-style)
  console.log('\n[ProductDetailsModal] Product fields:');
  for (const [key, value] of Object.entries(product)) {
    console.log(`  Field: ${key}, Value: ${value}`);
  }

  // Helper functions to extract fields dynamically from any product structure
  const getProductName = () => {
    // Prefer API field "Product Name" while keeping existing fallbacks
    return product['Product Name'] || product.product_name || product.name || product.title || product.productName || 'Product Details';
  };

  const getProductImage = () => {
    return product.image || product.img || product.imageUrl || product.product_image || product.thumbnail;
  };

  const getPriceData = () => {
    // Use only the single API field "Price" and ignore other variants
    const toNum = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === 'number') return v;
      const num = Number(String(v).replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(num) ? num : 0;
    };
    const rawPrice = product['Price'];
    const price = toNum(rawPrice);
    return { price };
  };

  const getRatingData = () => {
    const toNum = (v) => {
      if (v === null || v === undefined) return 0;
      if (typeof v === 'number') return v;
      const num = Number(String(v).replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(num) ? num : 0;
    };
    const rating = toNum(product.rating ?? product.averageRating ?? product.average_rating ?? product.stars);
    const reviewsCount = toNum(product.reviews_count ?? product.reviewsCount ?? product.total_reviews ?? 
                        product.totalReviews ?? product.numReviews);
    return { rating, reviewsCount };
  };

  const getDisplayableFields = () => {
    const excludeKeys = [
      'id', '_id', 'product_id', 'productId',
      'reviews', 'review', 'Reviews', 'Review', 'product_reviews', 'productReviews',
      'sentiments', 'aspectScores', 'reviewResults', 'analysisError',
      'product_name', 'name', 'title', 'Product Name',
      'image', 'img', 'imageUrl', 'product_image', 'thumbnail',
      // Exclude all kinds of price fields, including the API's "Price"
      'Price', 'selling_price', 'price', 'sellingPrice', 'current_price', 'salePrice',
      'mrp', 'original_price', 'originalPrice', 'list_price', 'listPrice',
      'discount', 'rating', 'averageRating', 'average_rating', 'stars',
      'reviews_count', 'reviewsCount', 'total_reviews', 'totalReviews', 'numReviews',
      'brand', 'series', 'colour', 'color' // These are shown in header
    ];

    const fields = [];
    
    console.log('[ProductDetailsModal] Extracting displayable fields...');
    
    for (const [key, value] of Object.entries(product)) {
      const lower = key.toLowerCase();
      // Skip excluded keys and review/sentiment/price related fields
      if (excludeKeys.includes(key) || lower.includes('review') || lower.includes('sentiment') || lower.includes('price')) {
        console.log(`  Skipping field: ${key} (excluded or review/sentiment/price related)`);
        continue;
      }
      
      // Skip null, undefined, empty strings, and empty objects
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)) {
        console.log(`  Skipping field: ${key} (null/undefined/empty)`);
        continue;
      }
      
      // Convert snake_case to Title Case
      const displayKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      // Format value based on type
      let displayValue;
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (typeof value === 'object' && Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object') {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
      
      console.log(`  Including field: ${key} → ${displayKey} = ${displayValue}`);
      
      fields.push({ 
        key: displayKey, 
        value: displayValue, 
        originalKey: key,
        type: typeof value
      });
    }
    
    console.log(`[ProductDetailsModal] Total displayable fields: ${fields.length}`);
    
    return fields;
  };

  // Extract all dynamic data
  const productName = getProductName();
  const productImage = getProductImage();
  const { price } = getPriceData();
  const { rating, reviewsCount } = getRatingData();
  const displayableFields = getDisplayableFields();

  // All fields (including those normally excluded) for power users
  const allFields = useMemo(() => {
    try {
      return Object.entries(product).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        type: typeof value
      }));
    } catch {
      return [];
    }
  }, [product]);
  
  console.log('[ProductDetailsModal] Extracted data:', {
    productName,
    hasImage: !!productImage,
    price,
    rating,
    reviewsCount,
    displayableFieldsCount: displayableFields.length
  });

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, rgba(31,41,55,0.98) 80%, rgba(59,130,246,0.08) 100%)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(168,85,247,0.3)',
          border: '1px solid rgba(168,85,247,0.3)',
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            zIndex: 10,
            width: '3rem',
            height: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(239,68,68,0.2)',
            border: '2px solid rgba(239,68,68,0.5)',
            borderRadius: '50%',
            color: '#ef4444',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <X size={24} />
        </button>

        {/* Scrollable Content */}
        <div style={{
          overflowY: 'auto',
          maxHeight: '90vh',
          padding: '2rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(168,85,247,0.5) rgba(31,41,55,0.3)'
        }}>
          {/* Header Section */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <h2
              id="modal-title"
              style={{
                fontSize: '2rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem',
                paddingRight: '4rem'
              }}
            >
              {productName}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.95rem',
              color: '#9ca3af'
            }}>
              {product.brand && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} />
                  <span><strong>Brand:</strong> {product.brand}</span>
                </div>
              )}
              {product.series && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} />
                  <span><strong>Series:</strong> {product.series}</span>
                </div>
              )}
              {(product.colour || product.color) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} />
                  <span><strong>Color:</strong> {product.colour || product.color}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Left Column: Image */}
            {productImage && (
              <div style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}>
                <img
                  src={productImage}
                  alt={productName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Right Column: Pricing & Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Pricing Card: show only the single Price if present */}
              {price > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
                      Price
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '2.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        ₹{price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Display */}
              {(rating > 0 || reviewsCount > 0) && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(59, 130, 246, 0.1))',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Star size={20} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#fbbf24'
                    }}>
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  {reviewsCount > 0 && (
                    <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                      Based on {reviewsCount.toLocaleString()} reviews
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Specifications Section */}
          {displayableFields.length > 0 && (
            <div style={{
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05))',
              padding: '1.5rem',
              borderRadius: '1rem',
              border: '1px solid rgba(168, 85, 247, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                marginBottom: '0.5rem',
                color: '#e5e7eb'
              }}>
                Product Specifications
              </h3>
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginBottom: '1rem'
              }}>
                Showing {displayableFields.length} field{displayableFields.length !== 1 ? 's' : ''} dynamically extracted from API
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                {displayableFields.map(({ key, value, originalKey, type }) => (
                  <div
                    key={originalKey}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'rgba(31, 41, 55, 0.5)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      border: '1px solid rgba(168, 85, 247, 0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
                      e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.1)';
                    }}
                    title={`Original field: ${originalKey} (${type})`}
                  >
                    <span style={{ 
                      color: '#9ca3af', 
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {key}:
                    </span>
                    <span style={{ 
                      color: '#e5e7eb', 
                      textAlign: 'right', 
                      marginLeft: '1rem',
                      fontWeight: 500,
                      overflow: 'auto',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      maxWidth: '60%'
                    }}>
                      {type === 'number' && originalKey.toLowerCase().includes('price')
                        ? `₹${Number(value).toLocaleString()}`
                        : type === 'number' && originalKey.toLowerCase().includes('gb')
                        ? `${value} GB`
                        : type === 'number' && originalKey.toLowerCase().includes('ghz')
                        ? `${value} GHz`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show All Fields Toggle */}
          <div style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.08))',
            padding: '1rem',
            borderRadius: '1rem',
            border: '1px solid rgba(139, 92, 246, 0.25)'
          }}>
            <button
              onClick={() => setShowAllFields(v => !v)}
              style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(139,92,246,0.2)',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#c4b5fd',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {showAllFields ? 'Hide raw product data' : 'Show all product fields'}
            </button>
            {showAllFields && (
              <div style={{
                marginTop: '0.75rem',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: 'rgba(17,24,39,0.6)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {allFields.map(({ key, value, type }) => (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px dashed rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</div>
                    <div style={{ color: '#e5e7eb', fontSize: '0.9rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Analysis Details */}
          {product.reviewResults && product.reviewResults.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <ReviewAnalysisDetails product={product} />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                // Close modal and navigate in-app to full details page
                try { onClose(); } catch {}
                navigate(`/product/${product.id}`, { state: { product } });
              }}
              style={{
                flex: 1,
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))',
                border: '2px solid rgba(168,85,247,0.5)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,1), rgba(124,58,237,1))';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(168,85,247,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <ExternalLink size={20} />
              View Full Details
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem 2rem',
                background: 'rgba(31,41,55,0.8)',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                color: '#d1d5db',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(31,41,55,1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(31,41,55,0.8)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Scrollbar styling */
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(31,41,55,0.3);
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(168,85,247,0.5);
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(168,85,247,0.7);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          div[role="dialog"] > div {
            max-width: 100% !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Helper component for specification rows
const SpecRow = ({ label, value, color }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: 'rgba(15,23,42,0.4)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <span style={{
      fontWeight: 600,
      color,
      fontSize: '0.95rem'
    }}>
      {label}:
    </span>
    <span style={{
      color: '#d1d5db',
      fontSize: '0.95rem',
      textAlign: 'right',
      maxWidth: '60%'
    }}>
      {value}
    </span>
  </div>
);

export default ProductDetailsModal;
