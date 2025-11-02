import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Trash2, Package, Star, Info, GitCompare } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useComparison } from '../context/ComparisonContext';
import { useTheme } from '../context/ThemeContext';
import ProductDetailsModal from '../components/ProductDetailsModal';
import { SentimentBadgeList } from '../components/SentimentBadge';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { favorites, removeFromFavorites, clearFavorites, favoritesCount } = useFavorites();
  const { toggleComparison, isSelected, canAddMore } = useComparison();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Log favorites
  console.log('[Favorites Page] Favorites count:', favoritesCount);
  console.log('[Favorites Page] Favorites:', favorites);

  // Helper functions to extract product data with different field name variations
  const getProductName = (product) => {
    const nameFields = ['product_name', 'name', 'title', 'productName', 'Product_Name', 'Name'];
    for (const field of nameFields) {
      if (product[field]) return product[field];
    }
    return 'Unknown Product';
  };

  const getProductImage = (product) => {
    const imageFields = ['image', 'img', 'imageUrl', 'image_url', 'product_image', 'thumbnail'];
    for (const field of imageFields) {
      if (product[field]) return product[field];
    }
    return null;
  };

  const getPriceInfo = (product) => {
    const priceFields = ['selling_price', 'sellingPrice', 'price', 'current_price'];
    const mrpFields = ['mrp', 'MRP', 'original_price', 'list_price'];
    const discountFields = ['discount', 'discount_percentage'];
    
    let sellingPrice = null;
    let mrp = null;
    let discount = null;
    
    for (const field of priceFields) {
      if (product[field] !== undefined && product[field] !== null) {
        sellingPrice = product[field];
        break;
      }
    }
    
    for (const field of mrpFields) {
      if (product[field] !== undefined && product[field] !== null) {
        mrp = product[field];
        break;
      }
    }
    
    for (const field of discountFields) {
      if (product[field] !== undefined && product[field] !== null) {
        discount = product[field];
        break;
      }
    }
    
    return { sellingPrice, mrp, discount };
  };

  const getRatingInfo = (product) => {
    const ratingFields = ['rating', 'Rating', 'product_rating', 'averageRating'];
    const reviewCountFields = ['reviews_count', 'reviewsCount', 'total_reviews', 'numReviews'];
    
    let rating = null;
    let reviewsCount = null;
    
    for (const field of ratingFields) {
      if (product[field] !== undefined && product[field] !== null) {
        rating = Number(product[field]);
        break;
      }
    }
    
    for (const field of reviewCountFields) {
      if (product[field] !== undefined && product[field] !== null) {
        reviewsCount = Number(product[field]);
        break;
      }
    }
    
    return { rating, reviewsCount };
  };

  const getProductSpecs = (product) => {
    // Try to find RAM
    const ramFields = ['ram_gb', 'ram', 'RAM', 'memory'];
    let ram = null;
    for (const field of ramFields) {
      if (product[field] !== undefined && product[field] !== null) {
        ram = product[field];
        break;
      }
    }

    // Try to find Storage
    const storageFields = ['storage_gb', 'storage', 'Storage', 'disk'];
    let storage = null;
    for (const field of storageFields) {
      if (product[field] !== undefined && product[field] !== null) {
        storage = product[field];
        break;
      }
    }

    return { ram, storage };
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Debug logging
  console.log('[Favorites Page] Total favorites:', favoritesCount);
  console.log('[Favorites Page] Favorites array:', favorites);
  if (favorites.length > 0) {
    console.log('[Favorites Page] First favorite product:', favorites[0]);
    console.log('[Favorites Page] Product fields:', Object.keys(favorites[0]));
  }

  return (
    <div className={isDark ? 'dark' : ''} style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '2rem',
      position: 'relative',
      overflow: 'auto'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(31,41,55,0.8)',
              border: '2px solid rgba(168,85,247,0.5)',
              borderRadius: '0.75rem',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}
            className="dark:bg-gray-800/80 dark:border-purple-400/50"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168,85,247,0.3)';
              e.currentTarget.style.transform = 'translateX(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(31,41,55,0.8)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>

          {favorites.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all favorites?')) {
                  clearFavorites();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(239,68,68,0.2)',
                border: '2px solid rgba(239,68,68,0.5)',
                borderRadius: '0.75rem',
                color: '#ef4444',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#ef4444';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <ShoppingCart 
              size={40} 
              color="#ef4444"
              style={{
                animation: 'bounce 2s infinite'
              }}
            />
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ef4444, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}
            className="text-4xl md:text-5xl"
            >
              My Favorites
            </h1>
            <Heart 
              size={40} 
              fill="#ef4444" 
              color="#ef4444"
              style={{
                animation: 'pulse 1.5s infinite'
              }}
            />
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto'
          }}
          className="dark:text-gray-400"
          >
            {favoritesCount} {favoritesCount === 1 ? 'product' : 'products'} saved
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }}
          className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {favorites.map((product) => {
              // Extract product data using helper functions
              const productName = getProductName(product);
              const productImage = getProductImage(product);
              const { sellingPrice, mrp, discount } = getPriceInfo(product);
              const { rating, reviewsCount } = getRatingInfo(product);
              
              // Extract RAM and Storage
              const ram = product.ram || product.RAM || product.memory;
              const storage = product.storage || product.Storage || product.rom || product.ROM;

              return (
              <div 
                key={product.id}
                style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(31,41,55,0.98) 80%, rgba(59,130,246,0.08) 100%)',
                  borderRadius: '1rem',
                  boxShadow: '0 2px 24px rgba(168,85,247,0.10)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  color: '#f3f4f6',
                  border: '1px solid rgba(255,255,255,0.07)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  animation: 'slideIn 0.5s ease-out'
                }}
                className="dark:bg-gradient-to-br dark:from-gray-800/98 dark:to-gray-900/98 dark:border-gray-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(168,85,247,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 24px rgba(168,85,247,0.10)';
                }}
              >
                {/* Remove Button & Comparison Checkbox */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                  zIndex: 10
                }}>
                  {/* Comparison Checkbox */}
                  <label 
                    htmlFor={`compare-${product.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      background: isSelected(product.id) 
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))'
                        : 'rgba(31,41,55,0.95)',
                      borderRadius: '0.5rem',
                      cursor: canAddMore || isSelected(product.id) ? 'pointer' : 'not-allowed',
                      border: isSelected(product.id) ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s',
                      opacity: (!canAddMore && !isSelected(product.id)) ? 0.5 : 1,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <input
                      id={`compare-${product.id}`}
                      type="checkbox"
                      checked={isSelected(product.id)}
                      onChange={() => toggleComparison(product)}
                      disabled={!canAddMore && !isSelected(product.id)}
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: canAddMore || isSelected(product.id) ? 'pointer' : 'not-allowed',
                        accentColor: '#a855f7'
                      }}
                    />
                    <GitCompare size={16} style={{ color: isSelected(product.id) ? '#fff' : '#9ca3af' }} />
                  </label>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromFavorites(product.id)}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(239,68,68,0.2)',
                      border: '2px solid rgba(239,68,68,0.5)',
                      borderRadius: '0.5rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>

                                {/* Product Image */}
                {productImage && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    marginBottom: '0.5rem'
                  }}>
                    <img 
                      src={productImage} 
                      alt={productName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                {/* Product Info */}
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', marginBottom: '0.5rem' }}
                className="dark:text-gray-100">
                  {productName}
                </div>

                {/* Sentiment Analysis */}
                {product.sentiments && Object.keys(product.sentiments).length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <SentimentBadgeList sentiments={product.sentiments} />
                    {product.sentimentScore !== undefined && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.75rem',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          color: product.sentimentScore >= 75 ? '#10b981' : 
                                 product.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                          fontWeight: 700
                        }}>
                          {product.sentimentScore.toFixed(1)}/100
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Sentiment Score
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Specs */}
                {(ram || storage) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: '#d1d5db' }}
                  className="dark:text-gray-300">
                    {ram && <div><strong style={{color:'#a855f7'}}>RAM:</strong> {ram} GB</div>}
                    {storage && <div><strong style={{color:'#60a5fa'}}>Storage:</strong> {storage} GB</div>}
                  </div>
                )}

                {/* Pricing */}
                {sellingPrice && (
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '1rem', marginTop: '0.5rem' }}>
                    <div><strong style={{color:'#10b981'}}>₹{Number(sellingPrice).toLocaleString()}</strong></div>
                    {discount && discount > 0 && (
                      <div style={{color:'#ef4444', fontSize: '0.875rem'}}>{discount}% off</div>
                    )}
                  </div>
                )}

                {/* Rating */}
                {rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} fill="#facc15" color="#facc15" />
                    <span style={{fontWeight: 600}}>{rating}</span>
                    {reviewsCount && <span style={{color: '#9ca3af', fontSize: '0.875rem'}}>({reviewsCount})</span>}
                  </div>
                )}

                {/* More Info Button */}
                <button
                  onClick={() => openProductDetails(product)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.3s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(168,85,247,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Info size={18} />
                  More Details
                </button>
              </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(31,41,55,0.6)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          className="dark:bg-gray-800/60 dark:border-gray-700">
            <Package size={80} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{
              color: '#d1d5db',
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}
            className="dark:text-gray-300">
              No Favorites Yet
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              Start adding products to your favorites by clicking the ❤️ icon
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                border: 'none',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(168,85,247,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          h1 {
            fontSize: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FavoritesPage;
