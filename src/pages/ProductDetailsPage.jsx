import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, TrendingUp, Package, Award, Zap } from 'lucide-react';
import { SentimentBadgeList } from '../components/SentimentBadge';
import { useTheme } from '../context/ThemeContext';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    // 1) If product was passed via navigation state, use it first
    const stateProduct = location.state?.product;
    if (stateProduct && String(stateProduct.id) === String(id)) {
      setProduct(stateProduct);
      return;
    }

    // 2) Fallback: find in localStorage search results
    const searchResults = JSON.parse(localStorage.getItem('searchResults') || '[]');
    const foundInResults = searchResults.find(p => String(p.id) === String(id));
    if (foundInResults) {
      setProduct(foundInResults);
      return;
    }

    // 3) Fallback: recently viewed cache snapshot
    try {
      const rvCache = JSON.parse(localStorage.getItem('recently_viewed_cache') || '{}');
      const fromCache = rvCache?.[String(id)];
      if (fromCache) {
        setProduct({
          ...fromCache,
          product_name: fromCache.name || `Product ${id}`,
        });
        return;
      }
    } catch {}

    // 4) Not found: go home
    navigate('/');
  }, [id, navigate, location.state]);

  if (!product) {
    return (
      <div className={isDark ? 'dark' : ''} style={{
        minHeight: '100vh',
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem'
      }}>
        Loading product details...
      </div>
    );
  }

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  // Canonical API-aligned single price
  const sell = num(product['Price']);
  const rating = num(product.rating);
  const reviewsCount = num(product.reviews_count);

  return (
    <div className={isDark ? 'dark' : ''} style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
        background: 'radial-gradient(circle at 30% 50%, rgba(168,85,247,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(59,130,246,0.15) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Back Button */}
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
            marginBottom: '2rem',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
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
          Back to Search Results
        </button>

        {/* Main Content */}
        <div style={{
          background: 'rgba(31,41,55,0.6)',
          borderRadius: '1.5rem',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* Top Section - Image and Main Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {/* Left - Image */}
            <div style={{
              background: 'rgba(15,23,42,0.8)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '2px solid rgba(168,85,247,0.3)'
            }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product['Product Name'] || product.product_name}
                  style={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                    borderRadius: '0.75rem'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '0.75rem',
                  color: '#9ca3af'
                }}>
                  <Package size={80} />
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div>
              {/* Product Name */}
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'white',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}>
                {product['Product Name'] || product.product_name || product.name || 'Product Details'}
              </h1>

              {/* Brand & Series */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap'
              }}>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.3))',
                  borderRadius: '0.5rem',
                  color: '#a855f7',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Brand: {product.brand}
                </span>
                <span style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.3))',
                  borderRadius: '0.5rem',
                  color: '#10b981',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}>
                  Series: {product.series}
                </span>
              </div>

              {/* Rating */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem',
                padding: '1rem',
                background: 'rgba(15,23,42,0.6)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(250,204,21,0.3)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Star size={24} fill="#facc15" color="#facc15" />
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#facc15'
                  }}>
                    {rating != null ? rating : '—'}
                  </span>
                  {/* Removed "/ 5" suffix as per requirement */}
                </div>
                <div style={{
                  height: '40px',
                  width: '1px',
                  background: 'rgba(255,255,255,0.1)'
                }} />
                <div style={{
                  color: '#d1d5db',
                  fontSize: '1rem'
                }}>
                  <div style={{ fontWeight: 600 }}>{reviewsCount != null ? reviewsCount.toLocaleString() : '—'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Reviews</div>
                </div>
              </div>

              {/* Price Section (canonical) */}
              <div style={{
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.2))',
                borderRadius: '1rem',
                border: '2px solid rgba(16,185,129,0.4)',
                marginBottom: '2rem'
              }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: 900,
                  color: '#10b981',
                  marginBottom: '0.5rem'
                }}>
                  {sell != null ? `₹${sell.toLocaleString()}` : '—'}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <button style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                  border: 'none',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 10px 25px rgba(168,85,247,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(168,85,247,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(168,85,247,0.3)';
                }}>
                  <ShoppingCart size={22} />
                  Buy Now
                </button>
                <button style={{
                  padding: '1rem 2rem',
                  background: 'rgba(239,68,68,0.2)',
                  border: '2px solid #ef4444',
                  borderRadius: '0.75rem',
                  color: '#ef4444',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <Heart size={22} />
                  Wishlist
                </button>
              </div>
            </div>
          </div>

          {/* Sentiment Analysis Section */}
          {product.sentiments && Object.keys(product.sentiments).length > 0 && (
            <div style={{
              background: 'rgba(15,23,42,0.6)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              border: '1px solid rgba(168,85,247,0.3)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'white',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Award size={28} color="#a855f7" />
                Sentiment Analysis
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '2rem',
                alignItems: 'start'
              }}>
                <div>
                  <div style={{
                    color: '#9ca3af',
                    fontSize: '0.95rem',
                    marginBottom: '1rem'
                  }}>
                    Based on {product.reviewsAnalyzed || 0} of {product.totalReviews || 0} reviews analyzed
                  </div>
                  <SentimentBadgeList sentiments={product.sentiments} />
                </div>
                
                {product.sentimentScore !== undefined && (
                  <div style={{
                    padding: '2rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(52,211,153,0.2))',
                    borderRadius: '1rem',
                    border: '2px solid rgba(16,185,129,0.4)',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Overall Score
                    </div>
                    <div style={{
                      fontSize: '3.5rem',
                      fontWeight: 900,
                      color: product.sentimentScore >= 75 ? '#10b981' : 
                             product.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                      lineHeight: 1
                    }}>
                      {product.sentimentScore.toFixed(1)}
                    </div>
                    <div style={{
                      fontSize: '1.25rem',
                      color: '#9ca3af',
                      marginTop: '0.25rem'
                    }}>
                      / 100
                    </div>
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.5rem 1rem',
                      background: product.sentimentScore >= 75 ? 'rgba(16,185,129,0.3)' : 
                                 product.sentimentScore >= 50 ? 'rgba(250,204,21,0.3)' : 'rgba(239,68,68,0.3)',
                      borderRadius: '0.5rem',
                      color: product.sentimentScore >= 75 ? '#10b981' : 
                             product.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      {product.sentimentScore >= 75 ? '⭐ Excellent' : 
                       product.sentimentScore >= 50 ? '👍 Good' : '⚠️ Fair'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Specifications Table */}
          <div style={{
            background: 'rgba(15,23,42,0.6)',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid rgba(59,130,246,0.3)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <Zap size={28} color="#3b82f6" />
              Technical Specifications
            </h2>

            <div style={{
              display: 'grid',
              gap: '1rem'
            }}>
              <SpecRow label="Display Size" value={product.standing_screen_display_size || '—'} />
              <SpecRow label="Screen Resolution" value={product.screen_resolution || '—'} />
              <SpecRow label="Processor" value={product.processor_type || product.processor || '—'} />
              <SpecRow label="RAM" value={product.ram_gb != null ? `${product.ram_gb} GB` : '—'} />
              <SpecRow label="Storage" value={product.storage_gb != null ? `${product.storage_gb} GB SSD` : '—'} />
              <SpecRow label="Graphics" value={product.graphics_coprocessor || product.gpu || '—'} />
              <SpecRow label="Operating System" value={product.operating_system || '—'} />
              <SpecRow label="Color" value={product.colour || product.color || '—'} />
              <SpecRow label="Form Factor" value={product.form_factor || '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for specification rows
const SpecRow = ({ label, value }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem',
    padding: '1rem',
    background: 'rgba(15,23,42,0.4)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div style={{
      color: '#9ca3af',
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {label}
    </div>
    <div style={{
      color: 'white',
      fontSize: '1.1rem',
      fontWeight: 500
    }}>
      {value}
    </div>
  </div>
);

export default ProductDetailsPage;
