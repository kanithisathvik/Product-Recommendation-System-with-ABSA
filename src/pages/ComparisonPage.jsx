import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, GitCompare, X, Star, TrendingUp, TrendingDown, Minus, Check } from 'lucide-react';
import { SentimentBadgeList } from '../components/SentimentBadge';
import { useTheme } from '../context/ThemeContext';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Normalize incoming product objects from different sources/shapes
  const normalizeProduct = (p, idx = 0) => {
    if (!p || typeof p !== 'object') return null;

    const id = p.id ?? p.product_id ?? `product-${idx}`;
    const name = p['Product Name'] ?? p.product_name ?? p.name ?? p.title ?? 'Product';
    const image = p.image ?? p.imageUrl ?? p.thumbnail ?? '';

    // Derive numeric selling price from various shapes (number or string like "$129.99" or "₹12,999")
    let selling_price;
    if (typeof p.selling_price === 'number') {
      selling_price = p.selling_price;
    } else {
      const priceSource =
        (typeof p['Price'] === 'number' ? p['Price'] :
        (typeof p['Price'] === 'string' ? p['Price'] :
        (typeof p.price === 'number' ? p.price :
        (typeof p.price === 'string' ? p.price :
        (typeof p.current_price === 'number' ? p.current_price :
        (typeof p.current_price === 'string' ? p.current_price : undefined))))));
      if (typeof priceSource === 'number') {
        selling_price = priceSource;
      } else if (typeof priceSource === 'string') {
        const digits = priceSource.replace(/[^\d.]/g, '');
        selling_price = digits ? parseFloat(digits) : 0;
      } else {
        selling_price = 0;
      }
    }

    // Rating and reviews
    const rating = (typeof p.rating === 'number')
      ? p.rating
      : (typeof p.rating_value === 'number')
        ? p.rating_value
        : (typeof p.rating === 'string' ? parseFloat(p.rating) : undefined);

    const reviews_count =
      (typeof p.reviews_count === 'number') ? p.reviews_count :
      (typeof p.reviews === 'number') ? p.reviews :
      (typeof p.reviewCount === 'number') ? p.reviewCount : 0;

    const discount = (typeof p.discount === 'number') ? p.discount : 0;

    const sentimentScore = (typeof p.sentimentScore === 'number')
      ? p.sentimentScore
      : (typeof p?.sentimentAnalysis?.overallScore === 'number')
        ? p.sentimentAnalysis.overallScore
        : undefined;

    const normalized = {
      ...p,
      id,
      product_name: name,
      ['Product Name']: name,
      image,
      selling_price,
      rating,
      reviews_count,
      discount,
      sentimentScore
    };
    // Canonical API-aligned price
    normalized['Price'] = typeof p['Price'] === 'number' ? p['Price'] : selling_price;
    return normalized;
  };

  useEffect(() => {
    // Get products from navigation state or localStorage
    const productsFromStateRaw = location.state?.products || [];
    const productsFromStorageRaw = JSON.parse(localStorage.getItem('searchResults') || '[]');

    // Normalize all available products so the page works regardless of source shape
    const normalizedAvailable = (Array.isArray(productsFromStorageRaw) ? productsFromStorageRaw : [])
      .map((p, i) => normalizeProduct(p, i))
      .filter(Boolean);
    setAvailableProducts(normalizedAvailable);

    // Pre-select products if passed from home page (normalize too)
    if (Array.isArray(productsFromStateRaw) && productsFromStateRaw.length > 0) {
      const normalizedSelected = productsFromStateRaw
        .slice(0, 2)
        .map((p, i) => normalizeProduct(p, i))
        .filter(Boolean);
      setSelectedProducts(normalizedSelected);
    }

    // If no available products from storage, try fetching from Data API using last search query
    if (!normalizedAvailable || normalizedAvailable.length === 0) {
      try {
        const historyRaw = JSON.parse(localStorage.getItem('product_search_history') || '[]');
        const lastQuery = Array.isArray(historyRaw) && historyRaw.length > 0
          ? (typeof historyRaw[0] === 'string' ? historyRaw[0] : historyRaw[0]?.query)
          : null;

        const fallbackQuery = lastQuery && typeof lastQuery === 'string' && lastQuery.trim().length > 0
          ? lastQuery.trim()
          : 'smartphone';

        const controller = new AbortController();
        const fetchData = async () => {
          const res = await fetch('https://model-hddb.vercel.app/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: fallbackQuery }),
            signal: controller.signal
          });
          if (!res.ok) throw new Error(`API error ${res.status}`);
          const data = await res.json();
          const results = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data : (data?.products || []));
          const normalizedFromAPI = results.map((p, i) => normalizeProduct(p, i)).filter(Boolean);
          if (normalizedFromAPI.length > 0) {
            setAvailableProducts(normalizedFromAPI);
            // Do not override selectedProducts unless empty
            if (selectedProducts.length === 0 && normalizedFromAPI.length >= 2) {
              setSelectedProducts([normalizedFromAPI[0], normalizedFromAPI[1]]);
            }
            // Cache for continuity
            try { localStorage.setItem('searchResults', JSON.stringify(normalizedFromAPI)); } catch {}
          }
        };
        fetchData().catch(() => {/* silent fallback */});
        return () => controller.abort();
      } catch {
        // ignore and keep empty availableProducts
      }
    }
  }, [location.state]);

  const handleProductSelect = (product) => {
    // Ensure product is normalized before selection (in case called with raw item)
    const normalized = normalizeProduct(product);
    if (!normalized) return;
    // If already selected, remove it
    if (selectedProducts.find(p => p?.id === normalized.id)) {
      setSelectedProducts(selectedProducts.filter(p => p?.id !== normalized.id));
    } else if (selectedProducts.length < 2) {
      // Add to selection if less than 2 products selected
      setSelectedProducts([...selectedProducts, normalized]);
    } else {
      // Replace the first product if 2 are already selected
      setSelectedProducts([normalized, selectedProducts[1]]);
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p?.id !== productId));
  };

  const isProductSelected = (productId) => {
    return selectedProducts.some(p => p?.id === productId);
  };

  const getComparisonValue = (val1, val2, higherIsBetter = true) => {
    const n1 = typeof val1 === 'number' ? val1 : Number(val1);
    const n2 = typeof val2 === 'number' ? val2 : Number(val2);
    if (Number.isNaN(n1) || Number.isNaN(n2)) return 'equal';
    if (n1 === n2) return 'equal';
    if (higherIsBetter) {
      return n1 > n2 ? 'better' : 'worse';
    } else {
      return n1 < n2 ? 'better' : 'worse';
    }
  };

  const getComparisonIcon = (status) => {
    if (status === 'better') return <TrendingUp size={16} color="#10b981" />;
    if (status === 'worse') return <TrendingDown size={16} color="#ef4444" />;
    return <Minus size={16} color="#9ca3af" />;
  };

  const product1 = selectedProducts[0];
  const product2 = selectedProducts[1];
  const showComparison = product1 && product2;

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

      {/* Header */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1400px',
        margin: '0 auto'
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
          Back to Home
        </button>

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
            <GitCompare size={40} color="#a855f7" />
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Product Comparison Tool
            </h1>
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {selectedProducts.length === 0 ? 'Select 2 products to compare' : 
             selectedProducts.length === 1 ? 'Select 1 more product' : 
             'Comparing 2 products'}
          </p>
        </div>

        {/* Selected Products Bar (when products are selected) */}
        {selectedProducts.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'rgba(31,41,55,0.6)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(168,85,247,0.3)'
          }}>
            {selectedProducts.map((product, idx) => (
              <div key={product.id} style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'rgba(168,85,247,0.2)',
                borderRadius: '0.75rem',
                border: '2px solid rgba(168,85,247,0.5)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    marginBottom: '0.25rem'
                  }}>
                    {product['Product Name']}
                  </div>
                  <div style={{
                    color: '#10b981',
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}>
                    ₹{(product['Price'] ?? 0).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => removeProduct(product.id)}
                  style={{
                    padding: '0.5rem',
                    background: 'rgba(239,68,68,0.2)',
                    border: '2px solid rgba(239,68,68,0.5)',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
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
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!showComparison && (
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}>
              {selectedProducts.length === 0 ? 'Available Products' : 'Select Another Product'}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {availableProducts.map(product => {
                const isSelected = isProductSelected(product.id);
                
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    style={{
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.3))'
                        : 'rgba(31,41,55,0.6)',
                      borderRadius: '1rem',
                      padding: '1.25rem',
                      backdropFilter: 'blur(10px)',
                      border: isSelected 
                        ? '3px solid rgba(168,85,247,0.8)' 
                        : '1px solid rgba(255,255,255,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      position: 'relative',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(31,41,55,0.8)';
                        e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(31,41,55,0.6)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '0.5rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.5)'
                      }}>
                        <Check size={20} color="white" strokeWidth={3} />
                      </div>
                    )}

                    {/* Product Title (no images) */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{
                        color: 'white',
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {product['Product Name']}
                      </div>
                    </div>

                    {/* Product Info */}
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      lineHeight: '1.3',
                      minHeight: '2.6rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.product_name}
                    </h3>

                    {/* Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: '#facc15'
                      }}>
                        <Star size={16} fill="#facc15" />
                        <span style={{ fontWeight: 600 }}>{product.rating}</span>
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        ({product.reviews_count})
                      </span>
                    </div>

                    {/* Price */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{
                        color: '#10b981',
                        fontSize: '1.5rem',
                        fontWeight: 700
                      }}>
                        ₹{product.selling_price.toLocaleString()}
                      </span>
                      {product.discount > 0 && (
                        <span style={{
                          color: '#ef4444',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                          {product.discount}% off
                        </span>
                      )}
                    </div>

                    {/* Sentiment Badge */}
                    {product.sentimentScore !== undefined && (
                      <div style={{
                        padding: '0.5rem 0.75rem',
                        background: product.sentimentScore >= 75 
                          ? 'rgba(16,185,129,0.2)' 
                          : product.sentimentScore >= 50 
                          ? 'rgba(250,204,21,0.2)' 
                          : 'rgba(239,68,68,0.2)',
                        border: `1px solid ${product.sentimentScore >= 75 
                          ? '#10b981' 
                          : product.sentimentScore >= 50 
                          ? '#facc15' 
                          : '#ef4444'}`,
                        borderRadius: '0.5rem',
                        color: product.sentimentScore >= 75 
                          ? '#10b981' 
                          : product.sentimentScore >= 50 
                          ? '#facc15' 
                          : '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        Sentiment: {product.sentimentScore.toFixed(0)}/100
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Comparison Section */}
        {showComparison && (
          <div style={{
            background: 'rgba(31,41,55,0.6)',
            borderRadius: '1rem',
            padding: '2rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '2rem',
              fontWeight: 900,
              marginBottom: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Detailed Comparison Report
            </h2>

            {/* Overview (no images) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {[product1, product2].map((product, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  background: 'rgba(15,23,42,0.8)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '2px solid rgba(168,85,247,0.3)'
                }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem'
                  }}>
                    {product.product_name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#facc15',
                    fontSize: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <Star size={18} fill="#facc15" />
                    <span style={{ fontWeight: 600 }}>{product.rating ?? '—'}</span>
                    <span style={{ color: '#9ca3af' }}>({(product.reviews_count ?? 0).toLocaleString()} reviews)</span>
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    color: '#10b981',
                    fontWeight: 700
                  }}>
                    ₹{(product['Price'] ?? 0).toLocaleString()}
                    {product.discount > 0 && (
                      <span style={{
                        fontSize: '1rem',
                        color: '#ef4444',
                        marginLeft: '0.5rem'
                      }}>
                        {product.discount}% off
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Price Comparison */}
              <ComparisonRow
                label="Price"
                value1={`₹${(product1['Price'] ?? 0).toLocaleString()}`}
                value2={`₹${(product2['Price'] ?? 0).toLocaleString()}`}
                status1={getComparisonValue(product1['Price'], product2['Price'], false)}
                status2={getComparisonValue(product2['Price'], product1['Price'], false)}
                icon={getComparisonIcon}
              />

              {/* Rating Comparison */}
              <ComparisonRow
                label="Rating"
                value1={`${product1.rating}`}
                value2={`${product2.rating}`}
                status1={getComparisonValue(product1.rating, product2.rating)}
                status2={getComparisonValue(product2.rating, product1.rating)}
                icon={getComparisonIcon}
              />

              {/* Reviews Count */}
              <ComparisonRow
                label="Reviews"
                value1={product1.reviews_count.toLocaleString()}
                value2={product2.reviews_count.toLocaleString()}
                status1={getComparisonValue(product1.reviews_count, product2.reviews_count)}
                status2={getComparisonValue(product2.reviews_count, product1.reviews_count)}
                icon={getComparisonIcon}
              />

              {/* Discount */}
              <ComparisonRow
                label="Discount"
                value1={`${product1.discount}%`}
                value2={`${product2.discount}%`}
                status1={getComparisonValue(product1.discount, product2.discount)}
                status2={getComparisonValue(product2.discount, product1.discount)}
                icon={getComparisonIcon}
              />

              {/* Specs Comparison */}
              <ComparisonRow
                label="Display"
                value1={`${product1.standing_screen_display_size} (${product1.screen_resolution})`}
                value2={`${product2.standing_screen_display_size} (${product2.screen_resolution})`}
              />

              <ComparisonRow
                label="Processor"
                value1={product1.processor_type}
                value2={product2.processor_type}
              />

              <ComparisonRow
                label="RAM"
                value1={`${product1.ram_gb} GB`}
                value2={`${product2.ram_gb} GB`}
                status1={getComparisonValue(product1.ram_gb, product2.ram_gb)}
                status2={getComparisonValue(product2.ram_gb, product1.ram_gb)}
                icon={getComparisonIcon}
              />

              <ComparisonRow
                label="Storage"
                value1={`${product1.storage_gb} GB SSD`}
                value2={`${product2.storage_gb} GB SSD`}
                status1={getComparisonValue(product1.storage_gb, product2.storage_gb)}
                status2={getComparisonValue(product2.storage_gb, product1.storage_gb)}
                icon={getComparisonIcon}
              />

              <ComparisonRow
                label="Graphics"
                value1={product1.graphics_coprocessor}
                value2={product2.graphics_coprocessor}
              />

              <ComparisonRow
                label="Operating System"
                value1={product1.operating_system}
                value2={product2.operating_system}
              />

              {/* Sentiment Comparison - Enhanced with detailed aspect-by-aspect comparison */}
              {product1.sentiments && product2.sentiments && (
                <div style={{
                  background: 'rgba(15,23,42,0.6)',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  border: '1px solid rgba(168,85,247,0.3)',
                  marginTop: '1rem'
                }}>
                  <div style={{
                    color: '#d1d5db',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <Star size={24} color="#facc15" fill="#facc15" />
                    Detailed Sentiment Analysis Comparison
                  </div>

                  {/* Overall Sentiment Scores Side by Side */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr',
                    gap: '2rem',
                    marginBottom: '2rem',
                    alignItems: 'center'
                  }}>
                    {/* Product 1 Overall Score */}
                    <div style={{
                      padding: '1.5rem',
                      background: product1.sentimentScore >= product2.sentimentScore
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.3))'
                        : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2))',
                      border: `2px solid ${product1.sentimentScore >= product2.sentimentScore ? '#10b981' : 'rgba(168,85,247,0.5)'}`,
                      borderRadius: '1rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      {product1.sentimentScore > product2.sentimentScore && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '10px',
                          background: '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          🏆 WINNER
                        </div>
                      )}
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {product1.product_name}
                      </div>
                      <div style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: product1.sentimentScore >= 75 ? '#10b981' : 
                               product1.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                        lineHeight: 1
                      }}>
                        {product1.sentimentScore !== undefined ? product1.sentimentScore.toFixed(1) : 'N/A'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '1rem', marginTop: '0.25rem' }}>
                        / 100
                      </div>
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: product1.sentimentScore >= 75 ? 'rgba(16,185,129,0.2)' : 
                                   product1.sentimentScore >= 50 ? 'rgba(250,204,21,0.2)' : 'rgba(239,68,68,0.2)',
                        borderRadius: '0.5rem',
                        color: product1.sentimentScore >= 75 ? '#10b981' : 
                               product1.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}>
                        {product1.sentimentScore >= 75 ? '⭐ Excellent' : 
                         product1.sentimentScore >= 50 ? '👍 Good' : '⚠️ Fair'}
                      </div>
                    </div>

                    {/* VS Badge */}
                    <div style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                      borderRadius: '50%',
                      width: '60px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color: 'white',
                      boxShadow: '0 10px 30px rgba(168,85,247,0.5)'
                    }}>
                      VS
                    </div>

                    {/* Product 2 Overall Score */}
                    <div style={{
                      padding: '1.5rem',
                      background: product2.sentimentScore >= product1.sentimentScore
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(52,211,153,0.3))'
                        : 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2))',
                      border: `2px solid ${product2.sentimentScore >= product1.sentimentScore ? '#10b981' : 'rgba(168,85,247,0.5)'}`,
                      borderRadius: '1rem',
                      textAlign: 'center',
                      position: 'relative'
                    }}>
                      {product2.sentimentScore > product1.sentimentScore && (
                        <div style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '10px',
                          background: '#10b981',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          🏆 WINNER
                        </div>
                      )}
                      <div style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        {product2.product_name}
                      </div>
                      <div style={{
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: product2.sentimentScore >= 75 ? '#10b981' : 
                               product2.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                        lineHeight: 1
                      }}>
                        {product2.sentimentScore !== undefined ? product2.sentimentScore.toFixed(1) : 'N/A'}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '1rem', marginTop: '0.25rem' }}>
                        / 100
                      </div>
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem',
                        background: product2.sentimentScore >= 75 ? 'rgba(16,185,129,0.2)' : 
                                   product2.sentimentScore >= 50 ? 'rgba(250,204,21,0.2)' : 'rgba(239,68,68,0.2)',
                        borderRadius: '0.5rem',
                        color: product2.sentimentScore >= 75 ? '#10b981' : 
                               product2.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}>
                        {product2.sentimentScore >= 75 ? '⭐ Excellent' : 
                         product2.sentimentScore >= 50 ? '👍 Good' : '⚠️ Fair'}
                      </div>
                    </div>
                  </div>

                  {/* Aspect-by-Aspect Sentiment Comparison */}
                  <div style={{
                    background: 'rgba(15,23,42,0.4)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <h4 style={{
                      color: '#d1d5db',
                      fontSize: '1rem',
                      fontWeight: 700,
                      marginBottom: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Aspect-by-Aspect Comparison
                    </h4>
                    {(() => {
                      // Get all unique aspects from both products
                      const allAspects = [...new Set([
                        ...Object.keys(product1.sentiments || {}),
                        ...Object.keys(product2.sentiments || {})
                      ])];

                      return allAspects.map(aspect => {
                        const sentiment1 = product1.sentiments?.[aspect] || 'neutral';
                        const sentiment2 = product2.sentiments?.[aspect] || 'neutral';
                        
                        const getSentimentColor = (sent) => {
                          if (sent === 'positive') return '#10b981';
                          if (sent === 'negative') return '#ef4444';
                          return '#9ca3af';
                        };

                        const getSentimentIcon = (sent) => {
                          if (sent === 'positive') return '👍';
                          if (sent === 'negative') return '👎';
                          return '➖';
                        };

                        const getSentimentScore = (sent) => {
                          if (sent === 'positive') return 100;
                          if (sent === 'negative') return 0;
                          return 50;
                        };

                        const score1 = getSentimentScore(sentiment1);
                        const score2 = getSentimentScore(sentiment2);

                        return (
                          <div key={aspect} style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: '1rem',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'rgba(15,23,42,0.3)',
                            borderRadius: '0.5rem',
                            marginBottom: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {/* Product 1 Sentiment */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '0.75rem'
                            }}>
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: score1 > score2 
                                  ? `${getSentimentColor(sentiment1)}30` 
                                  : `${getSentimentColor(sentiment1)}20`,
                                border: `2px solid ${score1 > score2 ? getSentimentColor(sentiment1) : getSentimentColor(sentiment1) + '50'}`,
                                borderRadius: '0.5rem',
                                color: getSentimentColor(sentiment1),
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                textTransform: 'capitalize',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <span>{getSentimentIcon(sentiment1)}</span>
                                <span>{sentiment1}</span>
                                {score1 > score2 && <span style={{ color: '#10b981' }}>✓</span>}
                              </div>
                            </div>

                            {/* Aspect Name */}
                            <div style={{
                              padding: '0.5rem 1rem',
                              background: 'rgba(168,85,247,0.2)',
                              borderRadius: '0.5rem',
                              color: '#a855f7',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                              textTransform: 'capitalize',
                              textAlign: 'center',
                              minWidth: '120px',
                              whiteSpace: 'nowrap'
                            }}>
                              {aspect.replace(/_/g, ' ')}
                            </div>

                            {/* Product 2 Sentiment */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              gap: '0.75rem'
                            }}>
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: score2 > score1 
                                  ? `${getSentimentColor(sentiment2)}30` 
                                  : `${getSentimentColor(sentiment2)}20`,
                                border: `2px solid ${score2 > score1 ? getSentimentColor(sentiment2) : getSentimentColor(sentiment2) + '50'}`,
                                borderRadius: '0.5rem',
                                color: getSentimentColor(sentiment2),
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                textTransform: 'capitalize',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                {score2 > score1 && <span style={{ color: '#10b981' }}>✓</span>}
                                <span>{getSentimentIcon(sentiment2)}</span>
                                <span>{sentiment2}</span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Summary Statistics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '1rem',
                    marginTop: '1.5rem'
                  }}>
                    {(() => {
                      const getPositiveCount = (sentiments) => 
                        Object.values(sentiments || {}).filter(s => s === 'positive').length;
                      const getNegativeCount = (sentiments) => 
                        Object.values(sentiments || {}).filter(s => s === 'negative').length;
                      const getNeutralCount = (sentiments) => 
                        Object.values(sentiments || {}).filter(s => s === 'neutral').length;

                      const pos1 = getPositiveCount(product1.sentiments);
                      const pos2 = getPositiveCount(product2.sentiments);
                      const neg1 = getNegativeCount(product1.sentiments);
                      const neg2 = getNegativeCount(product2.sentiments);

                      return (
                        <>
                          <div style={{
                            padding: '1rem',
                            background: 'rgba(16,185,129,0.2)',
                            border: '2px solid rgba(16,185,129,0.5)',
                            borderRadius: '0.75rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                              Positive Aspects
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                              <div>
                                <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 900 }}>{pos1}</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Product 1</div>
                              </div>
                              <div style={{ color: '#9ca3af', fontSize: '1.5rem' }}>:</div>
                              <div>
                                <div style={{ color: '#10b981', fontSize: '2rem', fontWeight: 900 }}>{pos2}</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Product 2</div>
                              </div>
                            </div>
                          </div>

                          <div style={{
                            padding: '1rem',
                            background: 'rgba(239,68,68,0.2)',
                            border: '2px solid rgba(239,68,68,0.5)',
                            borderRadius: '0.75rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                              Negative Aspects
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                              <div>
                                <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 900 }}>{neg1}</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Product 1</div>
                              </div>
                              <div style={{ color: '#9ca3af', fontSize: '1.5rem' }}>:</div>
                              <div>
                                <div style={{ color: '#ef4444', fontSize: '2rem', fontWeight: 900 }}>{neg2}</div>
                                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Product 2</div>
                              </div>
                            </div>
                          </div>

                          <div style={{
                            padding: '1rem',
                            background: 'rgba(168,85,247,0.2)',
                            border: '2px solid rgba(168,85,247,0.5)',
                            borderRadius: '0.75rem',
                            textAlign: 'center'
                          }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                              Overall Winner
                            </div>
                            <div style={{
                              color: product1.sentimentScore >= product2.sentimentScore ? '#10b981' : '#3b82f6',
                              fontSize: '1rem',
                              fontWeight: 900,
                              marginTop: '0.5rem'
                            }}>
                              {product1.sentimentScore > product2.sentimentScore 
                                ? '🏆 Product 1' 
                                : product2.sentimentScore > product1.sentimentScore 
                                ? '🏆 Product 2' 
                                : '🤝 Tie'}
                            </div>
                            <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                              {product1.sentimentScore > product2.sentimentScore 
                                ? `+${(product1.sentimentScore - product2.sentimentScore).toFixed(1)} points` 
                                : product2.sentimentScore > product1.sentimentScore 
                                ? `+${(product2.sentimentScore - product1.sentimentScore).toFixed(1)} points` 
                                : 'Equal scores'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for comparison rows
const ComparisonRow = ({ label, value1, value2, status1, status2, icon }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '200px 1fr 1fr',
    gap: '1rem',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(15,23,42,0.4)',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255,255,255,0.05)'
  }}>
    <div style={{
      color: '#d1d5db',
      fontSize: '0.95rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {label}
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      fontSize: '1rem'
    }}>
      {icon && status1 && icon(status1)}
      <span>{(value1 ?? value1 === 0) ? value1 : '—'}</span>
    </div>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: 'white',
      fontSize: '1rem'
    }}>
      {icon && status2 && icon(status2)}
      <span>{(value2 ?? value2 === 0) ? value2 : '—'}</span>
    </div>
  </div>
);

export default ComparisonPage;
