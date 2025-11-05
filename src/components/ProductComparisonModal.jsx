import React from 'react';
import { X, ArrowLeft, ArrowRight, TrendingUp, Star, DollarSign, Trophy, ThumbsDown, Package, PartyPopper, PieChart, BarChart3, Crown } from 'lucide-react';
import { useComparison } from '../context/ComparisonContext';
import { SentimentBadgeList } from './SentimentBadge';
import { calculateSentimentScore } from '../services/aspectSentimentService';

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
    const n = Number(String(v).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const getProductName = (p) => p?.['Product Name'] || p?.name || p?.product_name || p?.title || 'Product';
  const getImage = (p) => p?.image || p?.img || p?.imageUrl || p?.product_image || p?.thumbnail || '';
  const getSinglePrice = (p) => toNum(p?.['Price'] ?? p?.price ?? p?.selling_price ?? p?.sellingPrice ?? p?.current_price);
  const getRating = (p) => toNum(p?.rating ?? p?.Rating ?? p?.product_rating ?? p?.averageRating);

  if (!isModalOpen) return null;

  /**
   * Get common aspects across all products (pulling from new fields if present)
   */
  const getCommonAspects = () => {
    if (selectedProducts.length === 0) return [];

    const allAspects = new Set();
    selectedProducts.forEach(product => {
      const aspectsKeys = product.sentiments
        ? Object.keys(product.sentiments)
        : (product.sentimentAnalysis?.aspects ? Object.keys(product.sentimentAnalysis.aspects) : []);
      aspectsKeys.forEach(a => allAspects.add(a));
    });

    return Array.from(allAspects);
  };

  /**
   * Get aspect sentiment for a product
   */
  const getAspectSentiment = (product, aspect) => {
    if (product.sentiments && product.sentiments[aspect] !== undefined) return product.sentiments[aspect];
    if (product.sentimentAnalysis?.aspects) return product.sentimentAnalysis.aspects[aspect] || 'neutral';
    return 'neutral';
  };

  /**
   * Get sentiment color
   */
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 dark:text-green-300 dark:bg-green-900/30';
      case 'negative': return 'text-red-600 bg-red-50 dark:text-red-300 dark:bg-red-900/30';
      case 'neutral': return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-slate-800';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-slate-800';
    }
  };

  /**
   * Calculate price difference
   */
  const calculatePriceDiff = (basePrice, comparePrice) => {
    const diff = comparePrice - basePrice;
    const percent = ((diff / basePrice) * 100).toFixed(1);
    
    if (diff > 0) {
      return <span className="text-red-600 dark:text-red-400">+${diff.toFixed(2)} (+{percent}%)</span>;
    } else if (diff < 0) {
      return <span className="text-green-600 dark:text-green-400">-${Math.abs(diff).toFixed(2)} ({percent}%)</span>;
    }
    return <span className="text-gray-600 dark:text-gray-400">Same</span>;
  };

  const commonAspects = getCommonAspects();

  /**
   * Sentiment scoring and winner selection
   */
  const getSentimentScore = (p) => {
    if (typeof p?.sentimentScore === 'number') return p.sentimentScore;
    const sentiments = p?.sentiments || p?.sentimentAnalysis?.aspects || {};
    const aspectScores = p?.aspectScores || p?.sentimentAnalysis?.scores || null;
    try {
      return calculateSentimentScore(sentiments, aspectScores);
    } catch {
      return 0;
    }
  };

  const scores = selectedProducts.map(getSentimentScore);
  const winnerIndex = scores.length > 0 ? scores.reduce((bestIdx, s, i, arr) => (s > arr[bestIdx] ? i : bestIdx), 0) : -1;

  /** Figures & Aggregations **/
  const getAggregateSentiment = (p) => {
    const details = p?.sentimentDetails; // {aspect: {positive,negative,neutral,total}}
    let pos = 0, neg = 0, neu = 0, total = 0;
    if (details && typeof details === 'object') {
      Object.values(details).forEach((c) => {
        const cc = c || {};
        pos += Number(cc.positive || 0);
        neg += Number(cc.negative || 0);
        neu += Number(cc.neutral || 0);
        total += Number(cc.total || ((cc.positive||0)+(cc.negative||0)+(cc.neutral||0)));
      });
    } else {
      // Fallback: count based on dominant sentiments (1 per aspect)
      const sents = p?.sentiments || {};
      Object.values(sents).forEach((s) => {
        if (s === 'positive') pos += 1; else if (s === 'negative') neg += 1; else neu += 1; total += 1;
      });
    }
    const safe = total > 0 ? total : 1;
    const pct = {
      posPct: Math.round((pos / safe) * 100),
      neuPct: Math.round((neu / safe) * 100),
      negPct: Math.round((neg / safe) * 100)
    };
    return { pos, neg, neu, total, ...pct };
  };

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
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 dark:text-gray-100 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <h2 className="text-2xl font-bold">Detailed Comparison Report</h2>
                  <p className="text-purple-100 text-sm mt-1">
                    Comparing {selectedProducts.length} products side-by-side
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={clearComparison}
                  className="px-4 py-2 bg-white/20 dark:bg-white/10 hover:bg-white/30 dark:hover:bg-white/20 rounded-lg transition-all text-sm font-medium"
                >
                  Clear All
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Close comparison"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Winner Banner */}
          <div className="px-6 pt-6">
            {selectedProducts.length > 0 && winnerIndex >= 0 && (
              <div className="flex items-center justify-between rounded-xl p-4 border dark:border-slate-700"
                   style={{
                     background: 'linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)'
                   }}>
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500 animate-pop" />
                  <div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Sentiment Winner</div>
                    <div className="font-bold text-gray-900 dark:text-gray-100">
                      {getProductName(selectedProducts[winnerIndex])}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Overall Sentiment</div>
                  <div className="text-lg font-extrabold" style={{
                    color: scores[winnerIndex] >= 75 ? '#10b981' : scores[winnerIndex] >= 50 ? '#f59e0b' : '#ef4444'
                  }}>
                    {Number(scores[winnerIndex] || 0).toFixed(1)}/100
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <PartyPopper className="w-5 h-5 text-amber-400 animate-pop" />
                  <PartyPopper className="w-5 h-5 text-pink-300 animate-pop delay-150" />
                </div>
              </div>
            )}
          </div>

          {/* Figures & Analysis: Sentiment Donuts */}
          <div className="px-6 pt-4">
            {selectedProducts.length > 0 && (
              <div className="rounded-xl border dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">Figures & Analysis</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProducts.map((p) => {
                    const agg = getAggregateSentiment(p);
                    const gradient = `conic-gradient(#10b981 0 ${agg.posPct}%, #f59e0b 0 ${agg.posPct + agg.neuPct}%, #ef4444 0 100%)`;
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border dark:border-slate-700">
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: gradient, position: 'relative' }}>
                          <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'white' }} className="dark:bg-slate-900" />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#10b981' }}>{agg.posPct}%</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 dark:text-gray-100 line-clamp-1">{getProductName(p)}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Reviews analyzed: {p.reviewsAnalyzed ?? '—'}</div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:'#10b981'}}></span> Positive {agg.pos}</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:'#f59e0b'}}></span> Neutral {agg.neu}</span>
                            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background:'#ef4444'}}></span> Negative {agg.neg}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800">
                  <th className="sticky left-0 z-10 bg-gray-50 dark:bg-slate-800 p-4 text-left font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700 min-w-[200px]">
                    Feature
                  </th>
                  {selectedProducts.map((product, idx) => {
                    const name = getProductName(product);
                    const img = getImage(product);
                    const s = Number(scores[idx] || 0);
                    const barColor = s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
                    const sentiments = product.sentiments || product.sentimentAnalysis?.aspects || {};
                    const topKeys = Object.keys(sentiments).slice(0, 4);
                    const topSentiments = topKeys.reduce((o,k)=>{o[k]=sentiments[k];return o;},{});
                    const isWin = idx === winnerIndex && selectedProducts.length > 1;
                    const isLose = selectedProducts.length > 1 && scores.every(n=>!isNaN(n)) && idx !== winnerIndex && idx === scores.reduce((worst, v, i, arr)=> (v < arr[worst] ? i : worst), 0);
                    return (
                      <th key={product.id} className="p-4 min-w-[300px] border-l border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center gap-3">
                          {/* Product Image with badges */}
                          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
                            {img ? (
                              <img src={img} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <Package className="w-10 h-10" />
                              </div>
                            )}
                            <button
                              onClick={() => removeFromComparison(product.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                              aria-label="Remove from comparison"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            {isWin && (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 animate-pop">
                                <Trophy className="w-3.5 h-3.5" /> Winner
                              </span>
                            )}
                            {isLose && (
                              <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-shake">
                                <ThumbsDown className="w-3.5 h-3.5" /> Loser
                              </span>
                            )}
                          </div>
                          {/* Product Name */}
                          <div className="text-center w-full">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">{name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{product.category}</p>
                            {/* Sentiment score gauge */}
                            <div className="mt-2">
                              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, s))}%`, background: barColor, transition: 'width 600ms ease' }} />
                              </div>
                              <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Sentiment: <span style={{ color: barColor, fontWeight: 700 }}>{s.toFixed(1)}%</span></div>
                            </div>
                            {/* Mini sentiment badges (top 4) */}
                            {topKeys.length > 0 && (
                              <div className="mt-2">
                                <SentimentBadgeList sentiments={topSentiments} />
                              </div>
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {/* Price Row */}
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-violet-900/30">
                  <td className="sticky left-0 z-10 bg-purple-50 dark:bg-violet-900/30 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      Price
                    </div>
                  </td>
                  {selectedProducts.map((product, index) => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                          {(() => {
                            const p = getSinglePrice(product);
                            return p !== null ? `₹${p.toLocaleString()}` : '—';
                          })()}
                        </span>
                        {index > 0 && (
                          <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                            vs. Product 1: {(() => {
                              const base = getSinglePrice(selectedProducts[0]);
                              const current = getSinglePrice(product);
                              if (base && current) {
                                return calculatePriceDiff(base, current);
                              }
                              return <span className="text-gray-600 dark:text-gray-400">N/A</span>;
                            })()}
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Rating
                    </div>
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {product.reviews} reviews
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Dynamic Technical Specifications */}
                {specKeys.map((key) => (
                  <tr key={key} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                      {toTitle(key)}
                    </td>
                    {selectedProducts.map((product) => {
                      const val = product?.[key];
                      let display;
                      if (val === null || val === undefined || val === '') {
                        display = <span className="text-gray-400 dark:text-gray-500">—</span>;
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
                        <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                          <span className="text-gray-800 dark:text-gray-200">{display}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Match Score Row (if available) */}
                {selectedProducts.some(p => p.match) && (
                  <tr className="border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/30">
                    <td className="sticky left-0 z-10 bg-blue-50 dark:bg-blue-900/30 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                        Match Score
                      </div>
                    </td>
                    {selectedProducts.map(product => (
                      <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                        {product.match ? (
                          <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full font-semibold">
                            {product.match}%
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">N/A</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Sentiment Score Row with Winner highlight */}
                <tr className="border-t border-gray-200 dark:border-gray-700">
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                    Sentiment Score
                  </td>
                  {selectedProducts.map((product, idx) => {
                    const s = Number(scores[idx] || 0);
                    const colorClass = s >= 75
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : s >= 50
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                    const isWinner = idx === winnerIndex && selectedProducts.length > 1;
                    return (
                      <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center gap-2">
                          {isWinner && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                              <Trophy className="w-3.5 h-3.5" /> Winner
                            </span>
                          )}
                          <span className={`inline-block px-3 py-1 rounded-full font-semibold ${colorClass}`}>
                            {s.toFixed(1)}/100
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Aspect Sentiments */}
                {commonAspects.length > 0 && (
                  <>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800">
                      <td colSpan={selectedProducts.length + 1} className="p-4 font-bold text-gray-700 dark:text-gray-200">
                        Aspect-Based Sentiments
                      </td>
                    </tr>
                    
                    {commonAspects.map((aspect, index) => (
                      <tr key={aspect} className={`border-t border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}`}>
                        <td className={`sticky left-0 z-10 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} p-4 font-medium text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700 capitalize`}>
                          {aspect.replace(/_/g, ' ')}
                        </td>
                        {selectedProducts.map(product => {
                          const sentiment = getAspectSentiment(product, aspect);
                          return (
                            <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
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

                {/* Leader Board Metrics */}
                <tr className="border-t-2 border-gray-200 dark:border-gray-700 bg-purple-50/60 dark:bg-violet-900/30">
                  <td colSpan={selectedProducts.length + 1} className="p-4">
                    {(() => {
                      const ratings = selectedProducts.map(getRating);
                      const prices = selectedProducts.map(getSinglePrice);
                      const topSentiment = winnerIndex;
                      const topRating = ratings.every(isNaN) ? -1 : ratings.reduce((b, v, i, arr) => (Number(v||0) > Number(arr[b]||0) ? i : b), 0);
                      const bestPrice = prices.every(v => !Number.isFinite(v)) ? -1 : prices.reduce((b, v, i, arr) => (Number.isFinite(v) && (!Number.isFinite(arr[b]) || v < arr[b]) ? i : b), 0);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-lg p-3 border dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 font-semibold"><Crown className="w-4 h-4"/> Best Sentiment</div>
                            {topSentiment >= 0 ? (
                              <div className="mt-1 text-sm text-gray-800 dark:text-gray-100">{getProductName(selectedProducts[topSentiment])} • {Number(scores[topSentiment]||0).toFixed(1)}%</div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-500">N/A</div>
                            )}
                          </div>
                          <div className="rounded-lg p-3 border dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-300 font-semibold"><Star className="w-4 h-4"/> Best Rating</div>
                            {topRating >= 0 ? (
                              <div className="mt-1 text-sm text-gray-800 dark:text-gray-100">{getProductName(selectedProducts[topRating])} • {Number(getRating(selectedProducts[topRating])||0).toFixed(1)}</div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-500">N/A</div>
                            )}
                          </div>
                          <div className="rounded-lg p-3 border dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 font-semibold"><DollarSign className="w-4 h-4"/> Best Price</div>
                            {bestPrice >= 0 ? (
                              <div className="mt-1 text-sm text-gray-800 dark:text-gray-100">{getProductName(selectedProducts[bestPrice])} • ₹{Number(getSinglePrice(selectedProducts[bestPrice])||0).toLocaleString()}</div>
                            ) : (
                              <div className="mt-1 text-sm text-gray-500">N/A</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                </tr>
                {/* Availability Row */}
                <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-4 font-semibold text-gray-700 dark:text-gray-200 border-r-2 border-gray-200 dark:border-gray-700">
                    Availability
                  </td>
                  {selectedProducts.map(product => (
                    <td key={product.id} className="p-4 text-center border-l border-gray-200 dark:border-gray-700">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                        In Stock
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-slate-800 rounded-b-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
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
          {/* Local styles for simple animations */}
          <style>{`
            @keyframes popIn { 0% { transform: scale(0.9); opacity: 0 } 60% { transform: scale(1.05); opacity: 1 } 100% { transform: scale(1); } }
            .animate-pop { animation: popIn 450ms ease-out both; }
            @keyframes shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-2px) } 75% { transform: translateX(2px) } }
            .animate-shake { animation: shake 700ms ease-in-out both; }
            .delay-150 { animation-delay: 150ms; }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default ProductComparisonModal;
