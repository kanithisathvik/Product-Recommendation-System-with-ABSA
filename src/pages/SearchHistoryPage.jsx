import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Search, Trash2, RotateCcw, TrendingUp, Package, Sparkles, Tag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SearchHistoryPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('product_search_history') || '[]');
    setSearchHistory(history);
  };

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      localStorage.removeItem('product_search_history');
      setSearchHistory([]);
    }
  };

  const removeItem = (indexToRemove) => {
    const updatedHistory = searchHistory.filter((_, index) => index !== indexToRemove);
    localStorage.setItem('product_search_history', JSON.stringify(updatedHistory));
    setSearchHistory(updatedHistory);
  };

  const searchAgain = (item) => {
    // Navigate back to home with the search query
    const query = typeof item === 'string' ? item : item.query;
    navigate('/', { state: { searchQuery: query } });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Header */}
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
            <Clock size={40} color="#a855f7" />
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Search History
            </h1>
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: '#9ca3af',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Your recent product searches - click to search again
          </p>
        </div>

        {/* Clear All Button */}
        {searchHistory.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={clearAllHistory}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'rgba(239,68,68,0.2)',
                border: '2px solid #ef4444',
                borderRadius: '0.5rem',
                color: '#ef4444',
                fontSize: '0.95rem',
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
              Clear All History
            </button>
          </div>
        )}

        {/* Search History List */}
        {searchHistory.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {searchHistory.map((item, index) => {
              // Handle both old string format and new object format
              const query = typeof item === 'string' ? item : item.query;
              const timestamp = typeof item === 'object' ? item.timestamp : Date.now();
              const resultsCount = typeof item === 'object' ? item.resultsCount : 0;
              const aspectsDetected = typeof item === 'object' ? item.aspectsDetected || [] : [];
              const hasABSA = typeof item === 'object' ? item.hasABSA : false;
              
              return (
              <div
                key={index}
                style={{
                  background: 'rgba(31,41,55,0.6)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(31,41,55,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(168,85,247,0.5)';
                  e.currentTarget.style.transform = 'translateX(10px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(31,41,55,0.6)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  {/* Left - Search Query and Details */}
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}>
                    <div style={{
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(139,92,246,0.3))',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Search size={24} color="#a855f7" />
                    </div>
                    <div style={{ flex: 1 }}>
                      {/* Search Query */}
                      <div style={{
                        color: 'white',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem'
                      }}>
                        {query}
                      </div>
                      
                      {/* Timestamp */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#9ca3af',
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem'
                      }}>
                        <Clock size={14} />
                        {formatDate(timestamp)}
                      </div>

                      {/* Metadata Row */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        {/* Results Count */}
                        {resultsCount > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(59,130,246,0.2)',
                            border: '1px solid rgba(59,130,246,0.5)',
                            borderRadius: '0.375rem',
                            color: '#3b82f6',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Package size={12} />
                            {resultsCount} result{resultsCount !== 1 ? 's' : ''}
                          </div>
                        )}

                        {/* ABSA Indicator */}
                        {hasABSA && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(168,85,247,0.2)',
                            border: '1px solid rgba(168,85,247,0.5)',
                            borderRadius: '0.375rem',
                            color: '#a855f7',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Sparkles size={12} />
                            ABSA Analysis
                          </div>
                        )}

                        {/* Aspects Count */}
                        {aspectsDetected.length > 0 && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(16,185,129,0.2)',
                            border: '1px solid rgba(16,185,129,0.5)',
                            borderRadius: '0.375rem',
                            color: '#10b981',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            <Tag size={12} />
                            {aspectsDetected.length} aspect{aspectsDetected.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      {/* Aspects Detected List */}
                      {aspectsDetected.length > 0 && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.375rem',
                          marginTop: '0.5rem'
                        }}>
                          {aspectsDetected.map((aspect, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.25rem 0.625rem',
                                background: 'rgba(16,185,129,0.15)',
                                borderRadius: '0.25rem',
                                color: '#10b981',
                                fontSize: '0.75rem',
                                textTransform: 'capitalize'
                              }}
                            >
                              {aspect.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right - Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        searchAgain(item);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.25rem',
                        background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'white',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139,92,246,1), rgba(124,58,237,1))';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <RotateCcw size={16} />
                      Search Again
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(index);
                      }}
                      style={{
                        padding: '0.75rem',
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
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
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
          }}>
            <Clock size={60} color="#9ca3af" style={{ marginBottom: '1rem' }} />
            <h3 style={{
              color: '#d1d5db',
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              No Search History Yet
            </h3>
            <p style={{
              color: '#9ca3af',
              fontSize: '1rem',
              marginBottom: '2rem'
            }}>
              Your search history will appear here once you start searching for products
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
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
              <Search size={20} />
              Start Searching
            </button>
          </div>
        )}

        {/* Stats */}
        {searchHistory.length > 0 && (
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(31,41,55,0.6)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <TrendingUp size={24} color="#10b981" />
              <h3 style={{
                color: 'white',
                fontSize: '1.25rem',
                fontWeight: 700,
                margin: 0
              }}>
                Search Statistics
              </h3>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <StatCard
                label="Total Searches"
                value={searchHistory.length}
                color="#a855f7"
              />
              <StatCard
                label="Most Recent"
                value={formatDate(searchHistory[0]?.timestamp)}
                color="#3b82f6"
              />
              <StatCard
                label="Oldest Search"
                value={formatDate(searchHistory[searchHistory.length - 1]?.timestamp)}
                color="#10b981"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for stat cards
const StatCard = ({ label, value, color }) => (
  <div style={{
    padding: '1.5rem',
    background: 'rgba(15,23,42,0.6)',
    borderRadius: '0.75rem',
    border: `2px solid ${color}40`,
    textAlign: 'center'
  }}>
    <div style={{
      color: '#9ca3af',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      {label}
    </div>
    <div style={{
      color,
      fontSize: '1.5rem',
      fontWeight: 700
    }}>
      {value}
    </div>
  </div>
);

export default SearchHistoryPage;
