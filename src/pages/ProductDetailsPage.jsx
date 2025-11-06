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
  
  // Resolve product category with heuristics
  const resolveCategory = (p) => {
    const raw = (p?.category || '').toString().toLowerCase();
    const name = (p?.product_name || p?.name || '').toString().toLowerCase();
    const text = `${raw} ${name}`;
    if (/camera|dslr|mirrorless|canon|nikon|sony\s(alpha)?/.test(text)) return 'camera';
    if (/keyboard|keychron|switch|mechanical/.test(text)) return 'keyboard';
    if (/monitor|display|144hz|240hz|ips|oled\smonitor/.test(text)) return 'monitor';
    if (/phone|smartphone|iphone|android|mobile/.test(text)) return 'phone';
    if (/power\s?bank|mAh|mah/.test(text)) return 'power_bank';
    if (/printer|laserjet|inkjet/.test(text)) return 'printer';
    if (/smartwatch|watch|fitbit|galaxy\swatch|apple\swatch/.test(text)) return 'smartwatch';
    if (/tablet|ipad|tab\s/.test(text)) return 'tablet';
    if (/tv|television|smart\stv|oled|qled|uhd/.test(text)) return 'tv';
    if (/laptop|notebook|ultrabook|macbook|gaming|business|professional|ultraportable|thin/.test(text)) return 'laptop';
    return 'generic';
  };

  const getFirst = (obj, keys) => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return null;
  };

  const asText = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const specDefs = {
    laptop: [
      { label: 'Display Size', keys: ['standing_screen_display_size','display_size','screen_size'] },
      { label: 'Screen Resolution', keys: ['screen_resolution','display_resolution','resolution'] },
      { label: 'Processor', keys: ['processor_type','processor','cpu'] },
      { label: 'RAM', keys: ['ram_gb','ram','memory'], format: (v)=>/gb|GB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Storage', keys: ['storage_gb','storage','ssd','rom'], format: (v)=>/gb|tb|GB|TB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Graphics', keys: ['graphics_coprocessor','gpu','graphics'] },
      { label: 'Operating System', keys: ['operating_system','os'] },
      { label: 'Color', keys: ['colour','color'] },
      { label: 'Form Factor', keys: ['form_factor'] },
    ],
    phone: [
      { label: 'Display Size', keys: ['display_size','screen_size'] },
      { label: 'Screen Resolution', keys: ['display_resolution','screen_resolution','resolution'] },
      { label: 'Processor/Chipset', keys: ['chipset','processor','soc'] },
      { label: 'RAM', keys: ['ram_gb','ram'], format: (v)=>/gb|GB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Storage', keys: ['storage_gb','storage','rom'], format: (v)=>/gb|tb|GB|TB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Battery', keys: ['battery_capacity','battery','battery_mAh'], format: (v)=>/mah|mAh/.test(String(v))?String(v):`${v} mAh` },
      { label: 'Main Camera', keys: ['rear_camera','main_camera'] },
      { label: 'Front Camera', keys: ['front_camera','selfie_camera'] },
      { label: 'Operating System', keys: ['operating_system','os'] },
      { label: 'Charging', keys: ['fast_charging','charging_speed','charging'] },
      { label: '5G Support', keys: ['5g','five_g','network'] },
    ],
    camera: [
      { label: 'Sensor', keys: ['sensor_size','sensor'] },
      { label: 'Megapixels', keys: ['megapixels','mp'] },
      { label: 'Lens Mount', keys: ['lens_mount','mount'] },
      { label: 'ISO Range', keys: ['iso_range','iso'] },
      { label: 'Shutter Speed', keys: ['shutter_speed'] },
      { label: 'Video', keys: ['video_resolution','video'] },
      { label: 'Battery Life', keys: ['battery_life'] },
      { label: 'Weight', keys: ['weight'] },
    ],
    keyboard: [
      { label: 'Switch Type', keys: ['switch_type','switches'] },
      { label: 'Connectivity', keys: ['connectivity','connection','bluetooth','wireless'] },
      { label: 'Layout', keys: ['layout','form_factor'] },
      { label: 'Backlight', keys: ['backlight','rgb'] },
      { label: 'Key Rollover', keys: ['n_key_rollover','key_rollover'] },
      { label: 'Battery', keys: ['battery_life','battery'] },
    ],
    monitor: [
      { label: 'Screen Size', keys: ['screen_size','display_size'] },
      { label: 'Resolution', keys: ['resolution','screen_resolution','display_resolution'] },
      { label: 'Panel Type', keys: ['panel_type','panel'] },
      { label: 'Refresh Rate', keys: ['refresh_rate','hz'] },
      { label: 'Response Time', keys: ['response_time','ms'] },
      { label: 'HDR', keys: ['hdr'] },
      { label: 'Ports', keys: ['ports','connectivity'] },
    ],
    power_bank: [
      { label: 'Capacity', keys: ['capacity','capacity_mah','battery_capacity'], format: (v)=>/mah|mAh/.test(String(v))?String(v):`${v} mAh` },
      { label: 'Output Power', keys: ['output_power','max_output','wattage'], format: (v)=>/w|W/.test(String(v))?String(v):`${v} W` },
      { label: 'Ports', keys: ['ports','port_count','usb_c_ports','usb_a_ports'] },
      { label: 'Fast Charging', keys: ['fast_charging','pd_support'] },
      { label: 'Weight', keys: ['weight'] },
    ],
    printer: [
      { label: 'Technology', keys: ['printer_technology','technology','type'] },
      { label: 'Print Resolution', keys: ['print_resolution','resolution'] },
      { label: 'Color/Mono', keys: ['color_type','color','mono'] },
      { label: 'Print Speed', keys: ['print_speed_ppm','print_speed'] },
      { label: 'Duplex', keys: ['duplex'] },
      { label: 'Connectivity', keys: ['connectivity','wireless','ethernet'] },
    ],
    smartwatch: [
      { label: 'Display Size', keys: ['display_size','screen_size'] },
      { label: 'Resolution', keys: ['display_resolution','screen_resolution'] },
      { label: 'Battery Life', keys: ['battery_life','battery'] },
      { label: 'Water Resistance', keys: ['water_resistance','ip_rating'] },
      { label: 'Sensors', keys: ['sensors'] },
      { label: 'Connectivity', keys: ['connectivity','bluetooth','wifi','nfc','gps'] },
    ],
    tablet: [
      { label: 'Display Size', keys: ['display_size','screen_size','standing_screen_display_size'] },
      { label: 'Resolution', keys: ['display_resolution','screen_resolution','resolution'] },
      { label: 'Processor', keys: ['processor','chipset','processor_type'] },
      { label: 'RAM', keys: ['ram_gb','ram'], format: (v)=>/gb|GB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Storage', keys: ['storage_gb','storage','rom'], format: (v)=>/gb|tb|GB|TB/.test(String(v))?String(v):`${v} GB` },
      { label: 'Battery', keys: ['battery_capacity','battery'] },
      { label: 'Operating System', keys: ['operating_system','os'] },
    ],
    tv: [
      { label: 'Screen Size', keys: ['screen_size','display_size'] },
      { label: 'Resolution', keys: ['resolution','display_resolution'] },
      { label: 'Panel Technology', keys: ['panel_type','panel','panel_technology'] },
      { label: 'Refresh Rate', keys: ['refresh_rate','hz'] },
      { label: 'HDR Formats', keys: ['hdr_formats','hdr'] },
      { label: 'Smart OS', keys: ['smart_os','operating_system','os'] },
      { label: 'Ports', keys: ['ports','hdmi_ports','usb_ports'] },
    ],
    generic: [
      { label: 'Color', keys: ['colour','color'] },
      { label: 'Brand', keys: ['brand'] },
      { label: 'Model/Series', keys: ['series','model'] },
    ],
  };

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
        {/* Back & Exit Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
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
          <button
            onClick={() => {
              try { localStorage.setItem('resetSearchOnHome', '1'); } catch {}
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.18))',
              border: '2px solid rgba(16,185,129,0.5)',
              borderRadius: '0.75rem',
              color: '#34d399',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(5,150,105,0.35))';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.18))';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Exit & New Search
          </button>
        </div>

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
            {(() => {
              const cat = resolveCategory(product);
              const defs = specDefs[cat] || specDefs.generic;
              const rows = [];
              for (const def of defs) {
                const val = getFirst(product, def.keys);
                const valueText = val != null ? (def.format ? def.format(val) : asText(val)) : null;
                if (valueText) rows.push({ label: def.label, value: valueText });
              }

              // If category rows are too few, enrich with some generic fields that are present
              if (rows.length < 4) {
                const genericKeys = ['brand','series','model','colour','color','form_factor'];
                for (const gk of genericKeys) {
                  const gv = product[gk];
                  if (gv != null && gv !== '' && !rows.find(r => r.label.toLowerCase().includes(gk.replace('_',' ')))) {
                    const label = gk.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
                    rows.push({ label, value: asText(gv) });
                  }
                }
              }

              // As a final fallback, if still nothing meaningful, pick up to 6 additional fields not obviously review/price
              if (rows.length === 0) {
                const exclude = ['id','image','reviews','review','sentiment','price','mrp','selling_price','discount'];
                const picked = [];
                for (const [k,v] of Object.entries(product)) {
                  const lower = k.toLowerCase();
                  if (exclude.some(e => lower.includes(e))) continue;
                  if (v === null || v === undefined || v === '') continue;
                  picked.push({ label: k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()), value: asText(v) });
                  if (picked.length >= 6) break;
                }
                rows.push(...picked);
              }

              return (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {rows.map((r, idx) => (
                    <SpecRow key={`${r.label}-${idx}`} isDark={isDark} label={r.label} value={r.value} />
                  ))}
                </div>
              );
            })()}
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
