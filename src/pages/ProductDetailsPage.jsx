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
          : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e2e8f0 100%)',
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
  const mrp = num(product.mrp);
  const sell = num(product.selling_price ?? product.price);
  const discount = num(product.discount);
  const rating = num(product.rating);
  const reviewsCount = num(product.reviews_count);
  const discountedPrice = mrp != null && sell != null ? Math.max(mrp - sell, 0) : null;
  const discountPercentage = mrp && discountedPrice != null ? Math.round((discountedPrice / mrp) * 100) : null;

  return (
    <div className={isDark ? 'dark' : ''} style={{
      minHeight: '100vh',
      background: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e2e8f0 100%)',
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
            background: isDark ? 'rgba(31,41,55,0.8)' : 'rgba(255,255,255,0.9)',
            border: isDark ? '2px solid rgba(168,85,247,0.5)' : '1px solid rgba(15,23,42,0.12)',
            borderRadius: '0.75rem',
            color: isDark ? 'white' : '#111827',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '2rem',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(168,85,247,0.3)' : '#ffffff';
            e.currentTarget.style.transform = 'translateX(-5px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(31,41,55,0.8)' : 'rgba(255,255,255,0.9)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={20} />
          Back to Search Results
        </button>

        {/* Main Content */}
        <div style={{
          background: isDark ? 'rgba(31,41,55,0.6)' : 'rgba(255,255,255,0.95)',
          borderRadius: '1.5rem',
          padding: '3rem',
          backdropFilter: 'blur(20px)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.08)',
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
              background: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.98)',
              borderRadius: '1rem',
              padding: '2rem',
              border: '2px solid rgba(168,85,247,0.3)'
            }}>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.product_name}
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
                color: isDark ? 'white' : '#111827',
                marginBottom: '1rem',
                lineHeight: 1.2
              }}>
                {product.product_name}
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
                background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(15,23,42,0.06)',
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
                  <span style={{
                    fontSize: '1rem',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    / 5
                  </span>
                </div>
                <div style={{
                  height: '40px',
                  width: '1px',
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)'
                }} />
                <div style={{
                  color: isDark ? '#d1d5db' : '#111827',
                  fontSize: '1rem'
                }}>
                  <div style={{ fontWeight: 600 }}>{reviewsCount != null ? reviewsCount.toLocaleString() : '—'}</div>
                  <div style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280' }}>Reviews</div>
                </div>
              </div>

              {/* Price Section */}
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '1.1rem'
                }}>
                  <span style={{
                    color: '#9ca3af',
                    textDecoration: 'line-through'
                  }}>
                    MRP: {mrp != null ? `₹${mrp.toLocaleString()}` : '—'}
                  </span>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '0.375rem',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}>
                    {discount != null ? `${discount}% OFF` : ''}
                  </span>
                </div>
                <div style={{
                  marginTop: '0.5rem',
                  color: '#10b981',
                  fontSize: '1rem',
                  fontWeight: 600
                }}>
                  {discountedPrice != null ? `You save: ₹${discountedPrice.toLocaleString()}` : ''}
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
              background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.95)',
              borderRadius: '1rem',
              padding: '2rem',
              marginBottom: '2rem',
              border: isDark ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(15,23,42,0.08)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: isDark ? 'white' : '#111827',
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
            background: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.95)',
            borderRadius: '1rem',
            padding: '2rem',
            border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(15,23,42,0.08)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: isDark ? 'white' : '#111827',
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
              <SpecRow isDark={isDark} label="Display Size" value={product.standing_screen_display_size || '—'} />
              <SpecRow isDark={isDark} label="Screen Resolution" value={product.screen_resolution || '—'} />
              <SpecRow isDark={isDark} label="Processor" value={product.processor_type || product.processor || '—'} />
              <SpecRow isDark={isDark} label="RAM" value={product.ram_gb != null ? `${product.ram_gb} GB` : '—'} />
              <SpecRow isDark={isDark} label="Storage" value={product.storage_gb != null ? `${product.storage_gb} GB SSD` : '—'} />
              <SpecRow isDark={isDark} label="Graphics" value={product.graphics_coprocessor || product.gpu || '—'} />
              <SpecRow isDark={isDark} label="Operating System" value={product.operating_system || '—'} />
              <SpecRow isDark={isDark} label="Color" value={product.colour || product.color || '—'} />
              <SpecRow isDark={isDark} label="Form Factor" value={product.form_factor || '—'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for specification rows
const SpecRow = ({ label, value, isDark }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '250px 1fr',
    gap: '2rem',
    padding: '1rem',
    background: isDark ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.04)',
    borderRadius: '0.5rem',
    border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.08)'
  }}>
    <div style={{
      color: isDark ? '#9ca3af' : '#374151',
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {label}
    </div>
    <div style={{
      color: isDark ? 'white' : '#111827',
      fontSize: '1.1rem',
      fontWeight: 500
    }}>
      {value}
    </div>
  </div>
);

export default ProductDetailsPage;
