import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Sparkles, TrendingUp, Star, ArrowRight, Zap, Filter, Heart, ExternalLink, Mic, MicOff, GitCompare, Info, Clock, Trash2 } from 'lucide-react';
import Navbar from './components/Navbar';
import ComparisonButton from './components/ComparisonButton';
import ProductComparisonModal from './components/ProductComparisonModal';
import AspectFilterModal from './components/AspectFilterModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import ThemeToggle from './components/ThemeToggle';
import Toast from './components/Toast';
import { SentimentBadgeList } from './components/SentimentBadge';
import ReviewAnalysisDetails from './components/ReviewAnalysisDetails';
// import RecentlyViewedPanel from './components/RecentlyViewedPanel';
import ProductTags from './components/ProductTags';
import SmartRecommendations from './components/SmartRecommendations';
import ProductSpecsExtended from './components/ProductSpecsExtended';
import RatingBreakdown from './components/RatingBreakdown';
import RatingBreakdownModal from './components/RatingBreakdownModal';
import PromptAssistBar from './components/PromptAssistBar';
import DetectedTagsBar from './components/DetectedTagsBar';
import ShareProductButton from './components/ShareProductButton';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { useIntentPrediction } from './hooks/useIntentPrediction';
import { useComparison } from './context/ComparisonContext';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useFavorites } from './context/FavoritesContext.jsx';
import { useTheme } from './context/ThemeContext';
import { analyzeProductSentiment, calculateSentimentScore } from './services/aspectSentimentService';
import { speechToText } from './services/speechToTextService';

const ProductRecommendationApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultsAnimToken, setResultsAnimToken] = useState(0);
  const [animatedText, setAnimatedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [route, setRoute] = useState('home');
  const mouseRef = useRef({ x: 0, y: 0 });
  const inputRef = useRef(null);

  // Comparison Context
  const { toggleComparison, isSelected, canAddMore } = useComparison();

  // Favorites Context
  const { toggleFavorite, isFavorite, favoritesCount, showNotification, notificationMessage } = useFavorites();

  // Search History Hook
  const { history, addToHistory, clearHistory, removeFromHistory, hasHistory } = useSearchHistory();
  const [showHistory, setShowHistory] = useState(false);

  // Product Details Modal State
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratingDistModal, setRatingDistModal] = useState(null);
  const { addViewedProduct } = useRecentlyViewed();

  // ABSA Feature States
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentAspects, setCurrentAspects] = useState([]);
  const [extractedAspects, setExtractedAspects] = useState([]); // Aspects from search query
  const [analysisError, setAnalysisError] = useState(null);

  // Speech-to-Text States
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechProcessing, setIsSpeechProcessing] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  // Real-time Stats State
  const [statsData, setStatsData] = useState(() => {
    const saved = localStorage.getItem('app_stats');
    return saved ? JSON.parse(saved) : {
      totalSearches: 0,
      productsAnalyzed: 0,
      totalABSAAnalyses: 0,
      successfulABSAAnalyses: 0,
      favoritedProducts: 0,
      comparisons: 0
    };
  });

  const fullText = "AI-Powered Product Discovery";
  
  // Mock product results for demonstration
  const mockResults = [
    {
      id: 1,
      name: "Nike Air Max 270",
      price: "$129.99",
      originalPrice: "$160.00",
      rating: 4.8,
      reviews: 2341,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      category: "Running Shoes",
      match: 95
    },
    {
      id: 2,
      name: "Adidas Ultraboost 22",
      price: "$139.99",
      originalPrice: "$180.00",
      rating: 4.7,
      reviews: 1876,
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&h=300&fit=crop",
      category: "Running Shoes",
      match: 92
    },
    {
      id: 3,
      name: "Allbirds Tree Runner",
      price: "$98.00",
      rating: 4.6,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300&h=300&fit=crop",
      category: "Eco-Friendly",
      match: 89
    }
  ];

  // Products will be loaded from API on search - no initial loading needed
  // Removed the useEffect that loaded from JSON file

  // Animated counter hook
  const useCountUp = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef();

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        },
        { threshold: 0.5 }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
      if (!isVisible) return;

      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setCount(Math.floor(progress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return [count, elementRef];
  };

  // Function to update stats
  const updateStats = (updates) => {
    setStatsData(prev => {
      const newStats = { ...prev, ...updates };
      localStorage.setItem('app_stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  // Use real stats if available, otherwise use animated counters
  const [productCount, productRef] = useCountUp(statsData.productsAnalyzed || 10000000, 2000);
  const dynamicAccuracy = (() => {
    const total = statsData.totalABSAAnalyses || 0;
    const success = statsData.successfulABSAAnalyses || 0;
    return total > 0 ? Math.round((success / total) * 100) : 0;
  })();
  const [accuracyCount, accuracyRef] = useCountUp(dynamicAccuracy, 1500);
  const [userCount, userRef] = useCountUp(statsData.totalSearches || 50000, 2500);

  // Live tag suggestions from current prompt (keeps prompt visible and tags updated)
  const { suggestions: promptTags } = useIntentPrediction(prompt);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setAnimatedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Routing handled by React Router now (no hash routing)

  const goToAbout = () => {
    navigate('/about');
  };

  const goToFeatures = () => {
    navigate('/features');
  };

  const goHome = () => {
    navigate('/');
  };

  // Product Details Modal Handlers
  const openProductDetails = (product) => {
    setSelectedProductForModal(product);
    setIsModalOpen(true);
    try { addViewedProduct(product); } catch {}
  };

  const closeProductDetailsModal = () => {
    setIsModalOpen(false);
    // Clear selected product after animation
    setTimeout(() => setSelectedProductForModal(null), 300);
  };

  // Search History Handlers
  const selectHistoryItem = (query) => {
    setPrompt(query);
    setShowHistory(false);
  };

  // Helper function to dynamically extract all fields from a product object
  const extractProductFields = (product) => {
    const fields = [];
    
    // Iterate through all key-value pairs
    for (const [key, value] of Object.entries(product)) {
      // Skip null, undefined, or empty values
      if (value === null || value === undefined || value === '') continue;
      
      // Skip review and sentiment-related fields (these are displayed separately)
      if (key.toLowerCase().includes('review') || 
          key.toLowerCase().includes('sentiment') || 
          key.toLowerCase().includes('aspect')) {
        continue;
      }
      
      // Format the field name (convert snake_case to Title Case)
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format the value based on type
      let formattedValue = value;
      if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        formattedValue = JSON.stringify(value);
      } else if (Array.isArray(value)) {
        formattedValue = value.join(', ');
      } else if (typeof value === 'number') {
        // Keep numbers as is, will format based on context
        formattedValue = value;
      }
      
      fields.push({
        key: formattedKey,
        value: formattedValue,
        originalKey: key,
        type: typeof value
      });
    }
    
    return fields;
  };

  // Helper to get product name from various possible field names
  const getProductName = (product) => {
    const nameFields = [
      'Product Name', // Prefer API's explicit field
      'product_name', 'name', 'title', 'productName', 'Product_Name', 'Name',
      'productTitle', 'title_str', 'model', 'Model', 'Product', 'ITEM_NAME'
    ];
    for (const field of nameFields) {
      if (product[field] !== undefined && product[field] !== null && String(product[field]).trim() !== '') {
        return String(product[field]).trim();
      }
    }
    // Fallbacks: brand + series, or id
    const combo = `${product.brand || ''} ${product.series || ''}`.trim();
    if (combo) return combo;
    return product.id ? `Product ${product.id}` : 'Unknown Product';
  };

  // Normalize incoming product shape from API/mock
  const normalizeIncomingProduct = (product, idx = 0) => {
    const clonedProduct = JSON.parse(JSON.stringify(product));
    // Ensure string id
    const rawId = clonedProduct.id ?? clonedProduct._id ?? `product-${idx}`;
    clonedProduct.id = String(rawId);
    // Ensure a consistent name field
    const name = getProductName(clonedProduct);
    clonedProduct.product_name = name;
    if (!clonedProduct.name) clonedProduct.name = name;
    // Coerce common numeric fields
    const toNum = (v) => {
      if (v === null || v === undefined) return null;
      if (typeof v === 'number') return v;
      const num = Number(String(v).replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(num) ? num : null;
    };
    // Prices
    clonedProduct.selling_price = toNum(clonedProduct.selling_price ?? clonedProduct.sellingPrice ?? clonedProduct.price ?? clonedProduct.current_price);
    clonedProduct.mrp = toNum(clonedProduct.mrp ?? clonedProduct.original_price ?? clonedProduct.originalPrice ?? clonedProduct.list_price ?? clonedProduct.listPrice);
    if (clonedProduct.discount !== null && clonedProduct.discount !== undefined) {
      clonedProduct.discount = toNum(clonedProduct.discount);
    }
    // Rating & reviews
    if (clonedProduct.rating !== undefined) clonedProduct.rating = toNum(clonedProduct.rating);
    if (clonedProduct.reviews_count === undefined) {
      const rc = clonedProduct.reviewsCount ?? clonedProduct.total_reviews ?? clonedProduct.totalReviews ?? clonedProduct.numReviews;
      clonedProduct.reviews_count = toNum(rc);
    }
    return clonedProduct;
  };

  // Helper to get product image
  const getProductImage = (product) => {
    const imageFields = ['image', 'img', 'imageUrl', 'image_url', 'product_image', 'thumbnail'];
    for (const field of imageFields) {
      if (product[field]) return product[field];
    }
    return null;
  };

  // Helper to get price-related fields
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

  // Helper to get rating info
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

  // Handle voice input (speech-to-text)
  const handleVoiceInput = async () => {
    if (isRecording || isSpeechProcessing) {
      console.log('[Voice Input] Already recording or processing, ignoring...');
      return;
    }

    try {
      setSpeechError(null);
      setIsRecording(true);
      
      console.log('[Voice Input] ========================================');
      console.log('[Voice Input] Starting voice recording workflow...');
      console.log('[Voice Input] ========================================');
      
      // Record and transcribe audio (max 10 seconds)
      const transcribedText = await speechToText(10);
      
      console.log('[Voice Input] ========================================');
      console.log('[Voice Input] SUCCESS! Transcribed text:', transcribedText);
      console.log('[Voice Input] ========================================');
      
      setIsRecording(false);
      setIsSpeechProcessing(true);
      
      // Set the transcribed text to the search input
      setPrompt(transcribedText);
      
      // Small delay to show processing state
      setTimeout(() => {
        setIsSpeechProcessing(false);
        console.log('[Voice Input] Text successfully added to search box!');
      }, 500);
      
    } catch (error) {
      console.error('[Voice Input] ========================================');
      console.error('[Voice Input] ERROR:', error);
      console.error('[Voice Input] Error message:', error.message);
      console.error('[Voice Input] Error stack:', error.stack);
      console.error('[Voice Input] ========================================');
      
      setIsRecording(false);
      setIsSpeechProcessing(false);
      
      // Set user-friendly error message
      let errorMessage = error.message;
      if (errorMessage.includes('denied')) {
        errorMessage = 'Microphone access denied. Please allow microphone permissions and try again.';
      } else if (errorMessage.includes('not supported')) {
        errorMessage = 'Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.';
      } else if (errorMessage.includes('No audio data')) {
        errorMessage = 'No audio was recorded. Please speak louder and try again.';
      } else if (errorMessage.includes('No transcription')) {
        errorMessage = 'Could not transcribe audio. Please speak clearly and try again.';
      }
      
      setSpeechError(errorMessage);
      
      // Clear error after 7 seconds
      setTimeout(() => setSpeechError(null), 7000);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      return;
    }

    setIsLoading(true);
    // Hide previous results to re-trigger animations on completion
    setShowResults(false);
    setShowHistory(false);

    try {
      const response = await fetch('https://model-hddb.vercel.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: prompt
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results || [];

      const productsFromAPIRaw = results.length > 0 ? 
        results : 
        (Array.isArray(data) ? data : (data.products || []));

      const productsFromAPI = (productsFromAPIRaw || []).map((p, idx) => normalizeIncomingProduct(p, idx));
      
      // Fallback to mock results if API returns nothing
      const finalProducts = (productsFromAPI && productsFromAPI.length > 0)
        ? productsFromAPI
        : mockResults.map((p, idx) => normalizeIncomingProduct(p, idx));

  setProducts(finalProducts);
  setFilteredProducts(finalProducts);
  setResultsAnimToken((t) => t + 1);
      
      updateStats({
        totalSearches: statsData.totalSearches + 1,
        productsAnalyzed: statsData.productsAnalyzed + finalProducts.length
      });
      
      localStorage.setItem('searchResults', JSON.stringify(finalProducts));
      
      const aspectsFromQuery = extractAspectsFromPrompt(prompt);
      setExtractedAspects(aspectsFromQuery);

      if (aspectsFromQuery.length > 0) {
        await handleApplyFilter({
          aspects: aspectsFromQuery,
          category: 'all'
        }, finalProducts);
        
        addToHistory(prompt, {
          resultsCount: finalProducts.length,
          aspectsDetected: aspectsFromQuery,
          hasABSA: true
        });
      } else {
  setIsLoading(false);
  setShowResults(true);
        
        addToHistory(prompt, {
          resultsCount: finalProducts.length,
          aspectsDetected: [],
          hasABSA: false
        });
      }
    } catch (error) {
      console.error('[API] Error fetching products:', error);
      // Graceful fallback to mock results when API fails
      try {
  const finalProducts = mockResults.map((p, idx) => normalizeIncomingProduct(p, idx));
  setProducts(finalProducts);
  setFilteredProducts(finalProducts);
  setResultsAnimToken((t) => t + 1);
  setShowResults(true);
        updateStats({
          totalSearches: statsData.totalSearches + 1,
          productsAnalyzed: statsData.productsAnalyzed + finalProducts.length
        });
        localStorage.setItem('searchResults', JSON.stringify(finalProducts));

        const aspectsFromQuery = extractAspectsFromPrompt(prompt);
        setExtractedAspects(aspectsFromQuery);

        if (aspectsFromQuery.length > 0) {
          await handleApplyFilter({ aspects: aspectsFromQuery, category: 'all' }, finalProducts);
        } else {
          setIsLoading(false);
        }

        addToHistory(prompt, {
          resultsCount: finalProducts.length,
          aspectsDetected: aspectsFromQuery,
          hasABSA: aspectsFromQuery.length > 0
        });
      } catch (fallbackError) {
        console.error('[Search] Fallback also failed:', fallbackError);
        setIsLoading(false);
        alert(`Search failed. Please try again later.`);
      }
    }
  };

  // Handle search from history page
  useEffect(() => {
    const queryFromHistory = location.state?.searchQuery;
    if (queryFromHistory) {
      setPrompt(queryFromHistory);
      setTimeout(() => {
        handleSubmit();
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.searchQuery]);

  // Extract aspects from user's search prompt
  const extractAspectsFromPrompt = (searchPrompt) => {
    const aspectKeywords = {
      'battery life': ['battery', 'battery life', 'power', 'charge', 'charging', 'hours'],
      'display': ['display', 'screen', 'monitor', 'resolution', 'brightness', 'colors'],
      'performance': ['performance', 'speed', 'fast', 'slow', 'processor', 'cpu', 'gpu', 'gaming', 'render'],
      'keyboard': ['keyboard', 'typing', 'keys', 'keypad'],
      'build quality': ['build', 'build quality', 'construction', 'material', 'solid', 'sturdy', 'premium'],
      'speakers': ['speakers', 'audio', 'sound', 'volume', 'bass'],
      'trackpad': ['trackpad', 'touchpad', 'mouse', 'cursor'],
      'cooling': ['cooling', 'heat', 'temperature', 'fan', 'thermal']
    };
    
    const foundAspects = [];
    const lowerPrompt = searchPrompt.toLowerCase();
    
    for (const [aspect, keywords] of Object.entries(aspectKeywords)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        if (!foundAspects.includes(aspect)) {
          foundAspects.push(aspect);
        }
      }
    }
    
    return foundAspects;
  };

  // Tag/intent-driven quick filter
  const applyTagFilter = (tag) => {
    if (!products || products.length === 0) return;
    const t = String(tag).toLowerCase();
    const filtered = products.filter(p => {
      const cat = String(p.category||'').toLowerCase();
      const brand = String(p.brand||'').toLowerCase();
      const price = Number(p.selling_price||p.price||0) || 0;
      const ram = Number(p.ram_gb||0);
      const sentiments = p.sentiments || {};
      const pos = (k) => (sentiments[k]?.positive||0) > (sentiments[k]?.negative||0);
      if (t === 'gaming') return cat.includes('gaming');
      if (t === 'budget') return price && price < 60000;
      if (t === 'premium') return price && price >= 150000;
      if (t === 'lightweight') return cat.includes('ultra') || String(p.form_factor||'').toLowerCase().includes('ultra');
      if (t === 'multitasking') return ram >= 16;
      if (t === 'great display') return pos('display');
      if (t === 'long battery') return pos('battery life');
      if (t === 'high performance') return pos('performance');
      if (t === 'durable') return pos('build quality');
      return brand.includes(t) || cat.includes(t);
    });
    if (filtered.length > 0) setFilteredProducts(filtered);
  };

  // Handle ABSA Filter Application
  const handleApplyFilter = async (filterData, productsToUse = null) => {
    const { aspects: manualAspects, category } = filterData;
    
    // Use provided products or fall back to state products
    const sourceProducts = productsToUse || products;
    
    // Merge aspects from search query and manual filter (remove duplicates)
    const allAspects = [...new Set([...extractedAspects, ...manualAspects])];
    
    console.log('[ABSA] Aspects from search query:', extractedAspects);
    console.log('[ABSA] Aspects from manual filter:', manualAspects);
    console.log('[ABSA] Combined aspects (merged):', allAspects);
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    setCurrentAspects(allAspects); // Use merged aspects
    
    try {
      console.log('[ABSA] Starting analysis for all aspects:', allAspects);
      
      // Filter products by category if specified
      let productsToAnalyze = sourceProducts;
      if (category && category !== 'all') {
        productsToAnalyze = sourceProducts.filter(p => p.category === category);
      }
      
      console.log(`[ABSA] Analyzing ${productsToAnalyze.length} products...`);
      
      // Analyze each product using map-like iteration
      const analyzedProducts = [];
      
      for (let index = 0; index < productsToAnalyze.length; index++) {
        const product = productsToAnalyze[index];
        
        try {
          const productName = product.product_name || product.name || 'Unknown';
          console.log(`\n[ABSA] ========== Analyzing Product ${index + 1}/${productsToAnalyze.length} ==========`);
          console.log(`[ABSA] Product Name: ${productName}`);
          console.log(`[ABSA] Product ID: ${product.id || 'No ID'}`);
          
          // Dynamically find review field (reviews, review, Review, Reviews, etc.)
          let reviewField = null;
          let reviewData = null;
          
          // Check for various review field names
          const possibleReviewFields = ['reviews', 'review', 'Reviews', 'Review', 'product_reviews', 'productReviews'];
          
          for (const field of possibleReviewFields) {
            if (product[field]) {
              reviewField = field;
              reviewData = product[field];
              console.log(`[ABSA] Found review field: "${reviewField}"`);
              break;
            }
          }
          
          // Also check for nested fields
          if (!reviewData) {
            for (const key in product) {
              if (key.toLowerCase().includes('review') && product[key]) {
                reviewField = key;
                reviewData = product[key];
                console.log(`[ABSA] Found review field (nested): "${reviewField}"`);
                break;
              }
            }
          }
          
          if (!reviewData) {
            console.warn(`[ABSA] ⚠️ No review field found for product: ${productName}`);
            console.warn(`[ABSA] Available fields:`, Object.keys(product));
            // Include product without sentiment data
            analyzedProducts.push({
              ...product,
              sentiments: {},
              sentimentScore: 0,
              analysisError: 'No reviews available'
            });
            continue;
          }
          
          // Ensure reviewData is an array and make a DEEP COPY to avoid reference issues
          const reviewsArray = Array.isArray(reviewData) ? 
            [...reviewData].map(r => typeof r === 'string' ? r : JSON.parse(JSON.stringify(r))) : 
            [reviewData];
          
          console.log(`[ABSA] ✓ Product "${productName}" has ${reviewsArray.length} reviews from field: "${reviewField}"`);
          console.log(`[ABSA] Product ID for verification: ${product.id || 'No ID'}`);
          console.log(`[ABSA] First review preview:`, reviewsArray[0] ? String(reviewsArray[0]).substring(0, 100) + '...' : 'N/A');
          
          // Create a normalized product object with 'reviews' field for the sentiment service
          // Make sure we're not sharing references
          const normalizedProduct = {
            ...product,
            reviews: reviewsArray,
            product_name: productName,
            id: product.id || `product-${index}` // Ensure unique ID
          };
          
          console.log(`[ABSA] Sending to sentiment analysis: ${productName} with ${reviewsArray.length} reviews`);
          
          // Analyze product sentiment with ALL merged aspects
          const result = await analyzeProductSentiment(normalizedProduct, allAspects);
          
          console.log(`[ABSA] ✓ Product "${productName}" analysis complete:`, {
            reviewsAnalyzed: result.totalReviewsAnalyzed,
            totalReviews: result.totalReviews,
            sentiments: result.sentiments,
            scores: result.scores
          });
          console.log(`[ABSA] ========== End Product ${index + 1} ==========\n`);
          
          // Calculate overall sentiment score for ranking (pass aspectScores for better accuracy)
          const sentimentScore = calculateSentimentScore(result.sentiments, result.scores);
          
          analyzedProducts.push({
            ...product,
            sentiments: result.sentiments,
            sentimentDetails: result.details,
            sentimentScore: sentimentScore,
            aspectScores: result.scores,
            reviewsAnalyzed: result.totalReviewsAnalyzed,
            totalReviews: result.totalReviews,
            reviewResults: result.reviewResults
          });
          
        } catch (error) {
          console.error(`[ABSA] Error analyzing product ${product.id || index}:`, error);
          // Include product without sentiment data
          analyzedProducts.push({
            ...product,
            sentiments: {},
            sentimentScore: 0,
            analysisError: error.message
          });
        }
      }
      
      console.log(`[ABSA] Analysis complete. Total products analyzed: ${analyzedProducts.length}`);
      
      // Update stats - track ABSA analyses and successes
      const successful = analyzedProducts.reduce((acc, p) => {
        const hasSentiments = p.sentiments && Object.keys(p.sentiments).length > 0;
        const hasReviewsAnalyzed = typeof p.reviewsAnalyzed === 'number' ? p.reviewsAnalyzed > 0 : true;
        return acc + (hasSentiments && hasReviewsAnalyzed ? 1 : 0);
      }, 0);
      updateStats({
        totalABSAAnalyses: (statsData.totalABSAAnalyses || 0) + analyzedProducts.length,
        successfulABSAAnalyses: (statsData.successfulABSAAnalyses || 0) + successful
      });
      
      // Sort by sentiment score (highest first)
      analyzedProducts.sort((a, b) => b.sentimentScore - a.sentimentScore);
      
      console.log('[ABSA] Products ranked by sentiment score');
      
      setFilteredProducts(analyzedProducts);
      setShowResults(true);
      setIsFilterModalOpen(false);
      // keep caret ready for user to edit prompt after tags generation
      setTimeout(() => {
        try { inputRef.current?.focus(); } catch {}
      }, 0);
      
    } catch (error) {
      console.error('[ABSA] Error during analysis:', error);
      setAnalysisError('Failed to analyze products. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilteredProducts(products);
    setCurrentAspects([]);
    setExtractedAspects([]);
    setAnalysisError(null);
  };

  const features = [
    { 
      icon: Sparkles, 
      text: "AI-Powered Search", 
      desc: "Natural language search with intelligent product recommendations using advanced AI",
      gradient: "from-purple-500 to-pink-500",
      route: "/"
    },
    { 
      icon: Mic, 
      text: "Voice Search", 
      desc: "Speak your requirements and let AI find products for you instantly",
      gradient: "from-blue-500 to-cyan-500",
      route: "/"
    },
    { 
      icon: GitCompare, 
      text: "Product Comparison", 
      desc: "Compare multiple products side-by-side with detailed sentiment analysis",
      gradient: "from-emerald-500 to-teal-500",
      route: "/compare"
    },
    { 
      icon: Heart, 
      text: "Favorites & Wishlist", 
      desc: "Save your favorite products and build your personalized wishlist",
      gradient: "from-red-500 to-pink-500",
      route: "/favorites"
    },
    { 
      icon: Filter, 
      text: "Aspect-Based Filtering", 
      desc: "Filter products by specific aspects like battery, display, performance, and more",
      gradient: "from-amber-500 to-orange-500",
      route: "/"
    },
    { 
      icon: Star, 
      text: "Sentiment Analysis", 
      desc: "View detailed sentiment scores and review analysis for each product",
      gradient: "from-violet-500 to-purple-500",
      route: "/"
    },
    { 
      icon: Clock, 
      text: "Search History", 
      desc: "Access your previous searches and quickly re-run them",
      gradient: "from-indigo-500 to-blue-500",
      route: "/history"
    },
    { 
      icon: Info, 
      text: "Product Details Modal", 
      desc: "Comprehensive product information with specs, pricing, and reviews",
      gradient: "from-cyan-500 to-teal-500",
      route: "/"
    }
  ];

  const examplePrompts = [
    "Find laptops with good battery life and display",
    "I need excellent performance and keyboard quality",
    "Looking for laptops with great battery and build quality",
    "Show me laptops with good speakers and display"
  ];

  return (
    <div className={`app ${isDark ? 'dark' : ''}`}>
      {/* Enhanced Background */}
      <div className="background">
        <div className="blob purple"></div>
        <div className="blob green"></div>
        <div className="blob blue"></div>
        <div className="mesh-gradient"></div>
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 4}`}></div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="main">
        {route === 'about' ? (
          <div className="hero" style={{textAlign: 'left', maxWidth: '1200px', margin: '0 auto', padding: '0 1rem'}}>
            <div className="badge" style={{ justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Zap className="badge-icon" />
              <span>About This Project</span>
            </div>
            <h1 className="hero-title" style={{textAlign: 'center', marginBottom: '3rem'}}>
              Advanced Product Recommendation System
            </h1>
            
            {/* Executive Summary */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(99,102,241,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(59,130,246,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(168,85,247,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(168,85,247,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #c084fc, #34d399)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Executive Summary
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                marginBottom: '1rem'
              }}>
                The Advanced Product Recommendation System represents a paradigm shift in e-commerce product discovery, leveraging state-of-the-art Artificial Intelligence and Natural Language Processing technologies to deliver personalized, context-aware product recommendations. This capstone project addresses the critical challenge of information overload in online shopping by implementing Aspect-Based Sentiment Analysis (ABSA) to extract nuanced insights from user reviews and match them with customer requirements.
              </p>
            </div>

            {/* Problem Statement */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(168,85,247,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(168,85,247,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(168,85,247,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(168,85,247,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Problem Statement
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                marginBottom: '1rem'
              }}>
                Traditional e-commerce platforms rely on keyword matching and basic filtering mechanisms that fail to capture the semantic meaning behind user queries. Customers often struggle to find products that truly meet their specific requirements, particularly when those requirements involve subjective qualities like "good battery life" or "excellent display quality." This results in poor user experience, increased return rates, and reduced customer satisfaction.
              </p>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: isDark ? '#e2e8f0' : '#d1d5db'
              }}>
                Furthermore, existing systems do not effectively leverage the wealth of information contained in product reviews, which often provide detailed insights about specific product aspects that matter most to customers.
              </p>
            </div>

            {/* Solution & Approach */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(52,211,153,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(52,211,153,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(52,211,153,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(52,211,153,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #34d399, #3b82f6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Solution & Technical Approach
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                marginBottom: '1.5rem'
              }}>
                Our system implements a multi-layered AI architecture that combines Natural Language Understanding, Sentiment Analysis, and Machine Learning to deliver intelligent product recommendations:
              </p>
              <ul style={{
                fontSize: '1.05rem',
                lineHeight: 1.9,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                paddingLeft: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#c084fc' }}>Natural Language Processing:</strong> Advanced NLP algorithms parse user queries to extract intent and identify specific product aspects of interest such as battery life, display quality, performance, and build quality.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#34d399' }}>Aspect-Based Sentiment Analysis:</strong> Deep learning models analyze thousands of product reviews to extract sentiment scores for individual product aspects, providing granular insights beyond simple star ratings.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#60a5fa' }}>Intelligent Ranking Algorithm:</strong> Products are ranked based on aspect-specific sentiment scores weighted by user preferences, ensuring highly relevant recommendations.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#f472b6' }}>Real-time Analysis:</strong> The system performs on-demand sentiment analysis, ensuring recommendations reflect the most current customer feedback.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#fbbf24' }}>Voice Search Integration:</strong> Speech-to-text capabilities enable hands-free product search for enhanced accessibility.
                </li>
              </ul>
            </div>

            {/* Technical Architecture */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(59,130,246,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(59,130,246,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(59,130,246,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(59,130,246,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Technical Architecture
              </h2>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#60a5fa',
                  marginBottom: '1rem'
                }}>
                  Frontend Stack
                </h3>
                <ul style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  paddingLeft: '1.5rem'
                }}>
                  <li>React.js 19.1.1 - Component-based UI framework</li>
                  <li>Vite 7.1.7 - Next-generation build tool for fast development</li>
                  <li>React Router - Client-side routing and navigation</li>
                  <li>Lucide React - Modern icon library</li>
                  <li>Tailwind CSS - Utility-first CSS framework</li>
                  <li>Context API - Global state management</li>
                </ul>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#34d399',
                  marginBottom: '1rem'
                }}>
                  Backend & AI Services
                </h3>
                <ul style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  paddingLeft: '1.5rem'
                }}>
                  <li>RESTful API Architecture</li>
                  <li>Hugging Face Transformers - Pre-trained NLP models</li>
                  <li>Gradio Client - AI model inference integration</li>
                  <li>Web Speech API - Voice recognition capabilities</li>
                  <li>LocalStorage - Client-side data persistence</li>
                </ul>
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: '#c084fc',
                  marginBottom: '1rem'
                }}>
                  Key Features
                </h3>
                <ul style={{
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  paddingLeft: '1.5rem'
                }}>
                  <li>Dynamic field extraction from heterogeneous API responses</li>
                  <li>Intelligent aspect detection from natural language queries</li>
                  <li>Caching mechanism for optimized performance</li>
                  <li>Responsive design with dark/light mode support</li>
                  <li>Product comparison and favorites management</li>
                  <li>Search history with metadata tracking</li>
                </ul>
              </div>
            </div>

            {/* Key Features & Innovations */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(244,114,182,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(244,114,182,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(244,114,182,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(244,114,182,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f472b6, #a855f7)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Key Innovations
              </h2>
              <ul style={{
                fontSize: '1.05rem',
                lineHeight: 1.9,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                paddingLeft: '1.5rem'
              }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#f472b6' }}>Automatic Aspect Detection:</strong> The system automatically identifies product aspects mentioned in user queries without requiring explicit filtering.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#c084fc' }}>Review-Driven Insights:</strong> Unlike traditional systems that rely solely on numerical ratings, our ABSA approach extracts detailed sentiment information from text reviews.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#60a5fa' }}>Dynamic Field Mapping:</strong> Handles products with varying data structures and field names, ensuring compatibility with diverse data sources.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#34d399' }}>Multi-Modal Search:</strong> Supports both text and voice input for inclusive user experience.
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#fbbf24' }}>Transparent Analysis:</strong> Provides detailed breakdowns of sentiment analysis results with review-level insights.
                </li>
              </ul>
            </div>

            {/* Use Cases & Applications */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(251,191,36,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(251,191,36,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(251,191,36,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(251,191,36,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Use Cases & Applications
              </h2>
              <ul style={{
                fontSize: '1.05rem',
                lineHeight: 1.9,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                paddingLeft: '1.5rem'
              }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>E-Commerce Platforms:</strong> Enhance product discovery and reduce search time for customers
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Comparison Shopping:</strong> Help users make informed decisions by highlighting aspect-specific differences
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Market Research:</strong> Analyze customer sentiment trends across product categories
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Product Development:</strong> Identify areas for improvement based on customer feedback
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <strong>Customer Support:</strong> Route customers to products that best match their stated requirements
                </li>
              </ul>
            </div>

            {/* Future Enhancements */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(99,102,241,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(99,102,241,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(99,102,241,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(99,102,241,0.15)'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1.5rem'
              }}>
                Future Enhancements
              </h2>
              <ul style={{
                fontSize: '1.05rem',
                lineHeight: 1.9,
                color: isDark ? '#e2e8f0' : '#d1d5db',
                paddingLeft: '1.5rem'
              }}>
                <li style={{ marginBottom: '0.75rem' }}>Integration with multiple e-commerce APIs for broader product coverage</li>
                <li style={{ marginBottom: '0.75rem' }}>Implementation of collaborative filtering for personalized recommendations</li>
                <li style={{ marginBottom: '0.75rem' }}>Real-time price tracking and alert systems</li>
                <li style={{ marginBottom: '0.75rem' }}>Multi-language support for global accessibility</li>
                <li style={{ marginBottom: '0.75rem' }}>Mobile application development for iOS and Android platforms</li>
                <li style={{ marginBottom: '0.75rem' }}>Advanced visualization of sentiment trends over time</li>
                <li style={{ marginBottom: '0.75rem' }}>Integration with social media for trending product insights</li>
              </ul>
            </div>

            {/* Team Members */}
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #c084fc, #34d399)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Development Team
            </h2>
            <div className="features" style={{marginTop: '2rem', gap: '2rem', marginBottom: '3rem'}}>
              <div className="feature-card tilt-card" style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(192,132,252,0.15), rgba(139,92,246,0.15))'
                  : 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(139,92,246,0.1))',
                border: '2px solid rgba(192,132,252,0.3)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c084fc, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>AS</div>
                <h3 style={{
                  color: isDark ? '#e0c3fc' : '#c084fc',
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>Abdulla Shahensha Razwaa</h3>
                <p style={{
                  color: isDark ? '#cbd5e1' : '#9ca3af',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>Registration: 22BCE9149</p>
                <p style={{
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 600
                }}>Full Stack Developer</p>
              </div>
              <div className="feature-card tilt-card" style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.15))'
                  : 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.1))',
                border: '2px solid rgba(52,211,153,0.3)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #34d399, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>BS</div>
                <h3 style={{
                  color: isDark ? '#6ee7b7' : '#34d399',
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>Binayak Sinha</h3>
                <p style={{
                  color: isDark ? '#cbd5e1' : '#9ca3af',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>Registration: 22BCE8642</p>
                <p style={{
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 600
                }}>AI/ML Specialist</p>
              </div>
              <div className="feature-card tilt-card" style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.15))'
                  : 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(59,130,246,0.1))',
                border: '2px solid rgba(96,165,250,0.3)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>VR</div>
                <h3 style={{
                  color: isDark ? '#93c5fd' : '#60a5fa',
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>Vudathu Rahul</h3>
                <p style={{
                  color: isDark ? '#cbd5e1' : '#9ca3af',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>Registration: 22BCE9172</p>
                <p style={{
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 600
                }}>Backend Developer</p>
              </div>
              <div className="feature-card tilt-card" style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(236,72,153,0.15))'
                  : 'linear-gradient(135deg, rgba(244,114,182,0.1), rgba(236,72,153,0.1))',
                border: '2px solid rgba(244,114,182,0.3)',
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: 'white'
                }}>KS</div>
                <h3 style={{
                  color: isDark ? '#f9a8d4' : '#f472b6',
                  fontSize: '1.25rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>Kanithi Tirumala Satya Sathvik</h3>
                <p style={{
                  color: isDark ? '#cbd5e1' : '#9ca3af',
                  fontSize: '0.95rem',
                  textAlign: 'center'
                }}>Registration: 22BCE8492</p>
                <p style={{
                  color: isDark ? '#e2e8f0' : '#d1d5db',
                  fontSize: '0.9rem',
                  marginTop: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 600
                }}>UI/UX Developer</p>
              </div>
            </div>

            {/* Conclusion */}
            <div style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(168,85,247,0.1) 100%)'
                : 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(168,85,247,0.1) 100%)',
              padding: '2.5rem',
              borderRadius: '1.5rem',
              border: '1px solid rgba(168,85,247,0.3)',
              boxShadow: '0 10px 40px rgba(168,85,247,0.15)',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '1rem'
              }}>
                Conclusion
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: isDark ? '#e2e8f0' : '#d1d5db'
              }}>
                This project demonstrates the transformative potential of AI and NLP technologies in enhancing e-commerce experiences. By combining advanced sentiment analysis with intuitive user interfaces, we have created a system that not only understands what users are looking for but also provides transparent, data-driven recommendations that build trust and satisfaction.
              </p>
            </div>
          </div>
        ) : route === 'features' ? (
          <div className="hero" style={{textAlign: 'center'}}>
            <div className="badge">
              <Sparkles className="badge-icon" />
              <span>Explore Our Features</span>
            </div>
            <h1 className="hero-title">
              Powerful Features at Your Fingertips
            </h1>
            <p className="hero-desc" style={{maxWidth: 800, margin: '0 auto 3rem'}}>
              Discover all the amazing features that make our product recommendation system stand out.
              Click on any feature to explore it in action!
            </p>

            {/* Feature Cards as Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (feature.route === '/') {
                        goHome();
                      } else {
                        navigate(feature.route);
                      }
                    }}
                    style={{
                      padding: '2rem',
                      background: 'linear-gradient(135deg, rgba(31,41,55,0.95) 0%, rgba(59,130,246,0.1) 100%)',
                      borderRadius: '1.5rem',
                      border: '2px solid rgba(168,85,247,0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    className="feature-button"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 20px 60px rgba(168,85,247,0.3)';
                      e.currentTarget.style.borderColor = '#a855f7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '150px',
                      height: '150px',
                      background: `linear-gradient(135deg, ${feature.gradient.includes('from-purple') ? 'rgba(168,85,247,0.2)' : feature.gradient.includes('from-blue') ? 'rgba(59,130,246,0.2)' : feature.gradient.includes('from-emerald') ? 'rgba(52,211,153,0.2)' : feature.gradient.includes('from-red') ? 'rgba(239,68,68,0.2)' : feature.gradient.includes('from-amber') ? 'rgba(251,191,36,0.2)' : feature.gradient.includes('from-violet') ? 'rgba(139,92,246,0.2)' : feature.gradient.includes('from-indigo') ? 'rgba(99,102,241,0.2)' : 'rgba(96,165,250,0.2)'}, transparent)`,
                      borderRadius: '50%',
                      filter: 'blur(40px)',
                      opacity: 0.5
                    }} />
                    
                    {/* Icon */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: `linear-gradient(135deg, ${feature.gradient.includes('from-purple') ? '#a855f7, #8b5cf6' : feature.gradient.includes('from-blue') ? '#3b82f6, #06b6d4' : feature.gradient.includes('from-emerald') ? '#34d399, #10b981' : feature.gradient.includes('from-red') ? '#ef4444, #ec4899' : feature.gradient.includes('from-amber') ? '#fbbf24, #f97316' : feature.gradient.includes('from-violet') ? '#8b5cf6, #a855f7' : feature.gradient.includes('from-indigo') ? '#6366f1, #3b82f6' : '#06b6d4, #14b8a6'})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(168,85,247,0.3)',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <Icon size={28} color="white" />
                    </div>

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '0.5rem'
                      }}>
                        {feature.text}
                      </h3>
                      <p style={{
                        fontSize: '0.95rem',
                        color: '#9ca3af',
                        lineHeight: 1.6,
                        marginBottom: '1rem'
                      }}>
                        {feature.desc}
                      </p>
                      
                      {/* Arrow Icon */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#a855f7',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}>
                        Try it now <ArrowRight size={16} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
        <div className="hero">
          <div className="badge">
            <Zap className="badge-icon" />
            <span>Powered by Advanced AI</span>
          </div>

          <h1 className="hero-title">
            <span className="gradient-text blur-reveal">{animatedText}</span>
            <span className="cursor">|</span>
          </h1>

          <p className="hero-desc blur-reveal">
            Transform your shopping experience with intelligent product recommendations. 
            Simply describe what you're looking for, and let our AI find the perfect matches.
            <br />
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#a855f7',
              fontWeight: 600,
              marginTop: '0.5rem',
              display: 'inline-block'
            }}>
              💡 Tip: Mention aspects like "battery life", "display", or "performance" for sentiment-based ranking!
            </span>
          </p>

          {/* COMPLETELY NEW SEARCH - MINIMAL IMPLEMENTATION */}
          <div
            className="search-container-wrapper"
            style={{ position: 'relative', zIndex: 20000, pointerEvents: 'auto' }}
            onClick={() => inputRef.current?.focus()}
            onPointerDown={() => inputRef.current?.focus()}
          >
            <div className={`search-container ${searchFocused ? 'focused' : ''}`} style={{ pointerEvents: 'auto' }}>
              
              {/* Text Search Box - Ultra Simple */}
              <div className="search-box-modern">
                <div className="search-icon-wrapper">
                  <Search className="search-icon" size={22} />
                </div>
                
                <input
                  id="searchPromptInput"
                  name="searchPrompt"
                  ref={inputRef}
                  type="text"
                  inputMode="text"
                  enterKeyHint="search"
                  aria-label="Search products"
                  autoCapitalize="none"
                  autoCorrect="off"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onInput={(e) => setPrompt(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => { /* ensure input receives focus */ e.stopPropagation(); }}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (hasHistory) setShowHistory(true);
                  }}
                  onBlur={() => {
                    setSearchFocused(false);
                    setTimeout(() => setShowHistory(false), 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      if (prompt.trim() && !isLoading) {
                        handleSubmit();
                      }
                    }
                  }}
                  placeholder="Describe the product you're looking for..."
                  disabled={isLoading || isRecording}
                  className="search-input-modern"
                  style={{ color: '#e5e7eb', caretColor: '#e5e7eb', background: 'transparent', zIndex: 20, pointerEvents: 'auto' }}
                  autoComplete="off"
                  autoFocus
                  spellCheck="false"
                  tabIndex={0}
                />
                {/* Suggestions moved below the search box to avoid squeezing the input */}

                {prompt && !isLoading && (
                  <button
                    type="button"
                    className="clear-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrompt('');
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                  >
                    ✕
                  </button>
                )}

                <button
                  type="button"
                  className="search-btn-modern"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (prompt.trim() && !isLoading) handleSubmit();
                  }}
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? (
                    <div className="spinner-modern"></div>
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>

              {/* Intent assist suggestions (now below the search box) */}
              <div style={{ width: '100%', marginTop: '0.75rem' }}>
                <PromptAssistBar prompt={prompt} onApply={(tag) => applyTagFilter(tag)} />
                {/* Detected tags: union of live prompt tags and extracted aspects from analysis */}
                <DetectedTagsBar
                  tags={[...new Set([...(promptTags || []), ...(extractedAspects || [])])]} 
                  onClick={(tag) => applyTagFilter(tag)}
                />
              </div>

              {/* Voice Search */}
              <div className="voice-search-container">
                <div className="divider-line">
                  <span className="divider-text">OR</span>
                </div>
                
                <button
                  type="button"
                  className={`voice-btn-modern ${isRecording ? 'recording' : ''} ${isSpeechProcessing ? 'processing' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleVoiceInput(); }}
                  disabled={isLoading || isRecording || isSpeechProcessing}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={20} />
                      <span>Recording... Click to stop</span>
                      <span className="recording-dot">●</span>
                    </>
                  ) : isSpeechProcessing ? (
                    <>
                      <div className="spinner-modern"></div>
                      <span>Processing speech...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={20} />
                      <span>Search by Voice</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Status Messages */}
            {speechError && (
              <div className="search-error-message">
                <span>⚠️ {speechError}</span>
              </div>
            )}
            
            {/* Search History Dropdown */}
            {showHistory && hasHistory && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.98), rgba(55, 65, 81, 0.98))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto',
                animation: 'fade-in 0.2s ease-out'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#a855f7' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e5e7eb' }}>
                      Recent Searches
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHistory();
                      setShowHistory(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  >
                    <Trash2 size={12} />
                    Clear
                  </button>
                </div>
                <div style={{ padding: '8px' }}>
                  {history.map((item, index) => {
                    const itemQuery = typeof item === 'string' ? item : item?.query || '';
                    return (
                    <button
                      key={index}
                      onClick={() => selectHistoryItem(itemQuery)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#e5e7eb',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '4px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                        e.currentTarget.style.borderLeft = '3px solid #a855f7';
                        e.currentTarget.style.paddingLeft = '13px';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderLeft = 'none';
                        e.currentTarget.style.paddingLeft = '16px';
                      }}
                    >
                      <Search size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {itemQuery}
                      </span>
                      <ArrowRight size={14} style={{ color: '#6b7280', flexShrink: 0, opacity: 0.5 }} />
                    </button>
                  )})}
                </div>
              </div>
            )}
            
            <div className="search-glow"></div>
          </div>

          {/* Inline loading status while searching */}
          {isLoading && (
            <div
              className="search-loading"
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#9ca3af', fontSize: '0.95rem' }}>
                <div className="spinner-modern"></div>
                <span>Searching products…</span>
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="examples">
            <p>Try these examples (aspects will be auto-detected):</p>
            <div className="example-list">
              {examplePrompts.map((example, index) => (
                <button 
                  key={index} 
                  onClick={() => setPrompt(example)} 
                  className="example-btn floating-btn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Show detected aspects if any */}
          {currentAspects.length > 0 && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem 1.5rem',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#a855f7', 
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                🎯 Analyzing Products Based On:
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                {currentAspects.map((aspect, index) => {
                  const isFromQuery = extractedAspects.includes(aspect);
                  return (
                    <span
                      key={index}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: isFromQuery 
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))'
                          : 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(16, 185, 129, 0.2))',
                        border: isFromQuery 
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid rgba(168, 85, 247, 0.4)',
                        borderRadius: '50px',
                        fontSize: '0.875rem',
                        color: isFromQuery ? '#60a5fa' : '#c084fc',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {isFromQuery && <span style={{ fontSize: '10px' }}>🔍</span>}
                      {aspect}
                    </span>
                  );
                })}
              </div>
              {extractedAspects.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ color: '#60a5fa' }}>🔍 From search query</span>
                  {currentAspects.length > extractedAspects.length && (
                    <span style={{ color: '#c084fc' }}>✨ Added manually</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        )}
        
        {/* Results Section */}
        {route === 'home' && showResults && (
          <div key={resultsAnimToken} className="results-section" style={{
            animation: 'slideInUp 0.5s ease-out',
            marginTop: '3rem'
          }}>
            {/* Results Header with Enhanced Design */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(59,130,246,0.15))',
              padding: '2rem',
              borderRadius: '1.5rem',
              border: '2px solid rgba(168,85,247,0.3)',
              marginBottom: '2rem',
              boxShadow: '0 10px 40px rgba(168,85,247,0.2)'
            }}>
              <div className="results-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h2 className="results-title" style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #c084fc, #34d399)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                  }}>
                    {currentAspects.length > 0 
                      ? `🎯 Products Ranked by: ${currentAspects.join(', ')}`
                      : '🎯 Recommended Products'}
                  </h2>
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'fade-up 0.5s ease-out'
                  }}>
                    <Sparkles size={16} style={{color: '#a855f7'}} />
                    Found {filteredProducts.length} products matching your requirements
                  </p>
                </div>
                <div className="results-filters" style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}>
                  <button 
                    className="filter-btn"
                    onClick={() => setIsFilterModalOpen(true)}
                    disabled={isAnalyzing}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                      border: 'none',
                      borderRadius: '0.75rem',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 15px rgba(168,85,247,0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(168,85,247,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(168,85,247,0.3)';
                    }}
                  >
                    <Filter size={16} />
                    <span>Sentiment Filter</span>
                  </button>
                  {currentAspects.length > 0 && (
                    <button 
                      className="filter-btn reset"
                      onClick={handleResetFilters}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(239,68,68,0.2)',
                        border: '2px solid rgba(239,68,68,0.5)',
                        borderRadius: '0.75rem',
                        color: '#ef4444',
                        fontWeight: 600,
                        cursor: 'pointer',
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
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid with Enhanced Cards */}
            <div className="results-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '2rem',
              animation: 'fadeIn 0.6s ease-out'
            }}>
              {/* Display analyzed products with sentiment badges */}
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-card" style={{
                  padding: '1.5rem',
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(31,41,55,0.98) 80%, rgba(59,130,246,0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.98) 80%, rgba(59,130,246,0.06) 100%)',
                  borderRadius: '1.5rem',
                  boxShadow: '0 4px 24px rgba(168,85,247,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  color: isDark ? '#f3f4f6' : '#111827',
                  border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(15,23,42,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.3s',
                  animation: 'fade-up 0.5s ease both',
                  animationDelay: `${Math.min(index * 60, 600)}ms`,
                }}>
                  {/* Top Right Controls - Comparison Checkbox & Favorite Heart */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 10,
                    display: 'flex',
                    gap: '0.5rem'
                  }}>
                    {/* Share button */}
                    <ShareProductButton product={product} />
                    {/* Favorite Heart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product);
                      }}
                      style={{
                        padding: '0.5rem',
                        background: isFavorite(product.id)
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))'
                          : (isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)'),
                        border: isFavorite(product.id)
                          ? '2px solid #ef4444'
                          : (isDark ? '2px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.12)'),
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (!isFavorite(product.id)) {
                          e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.3)' : '#ffffff';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isFavorite(product.id)) {
                          e.currentTarget.style.background = isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart 
                        size={18} 
                        fill={isFavorite(product.id) ? '#fff' : 'none'} 
                        color={isFavorite(product.id) ? '#fff' : '#9ca3af'}
                        style={{
                          transition: 'all 0.3s',
                          animation: isFavorite(product.id) ? 'pulse 0.5s' : 'none'
                        }}
                      />
                    </button>

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
                          : (isDark ? 'rgba(31,41,55,0.95)' : 'rgba(255,255,255,0.95)'),
                        borderRadius: '0.5rem',
                        cursor: canAddMore || isSelected(product.id) ? 'pointer' : 'not-allowed',
                        border: isSelected(product.id) ? '2px solid #a855f7' : (isDark ? '2px solid rgba(255,255,255,0.1)' : '1px solid rgba(15,23,42,0.12)'),
                        transition: 'all 0.3s',
                        opacity: (!canAddMore && !isSelected(product.id)) ? 0.5 : 1,
                        backdropFilter: 'blur(10px)'
                      }}
                      title={isSelected(product.id) ? 'Remove from comparison' : canAddMore ? 'Add to comparison' : 'Maximum products selected'}
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
                  </div>

                  {/* Product Image removed for compact, text-first layout */}

                  {/* Sentiment Badges */}
                  {product.sentiments && Object.keys(product.sentiments).length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: isDark ? '#9ca3af' : '#6b7280', 
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Sparkles size={14} style={{ color: '#a855f7' }} />
                        <span>
                          Sentiment Analysis: {product.reviewsAnalyzed || 0} of {product.totalReviews || 0} reviews analyzed
                        </span>
                      </div>
                      <SentimentBadgeList sentiments={product.sentiments} />
                      {product.sentimentScore !== undefined && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '0.75rem',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.15))',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#9ca3af',
                              marginBottom: '0.25rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              Overall Score
                            </div>
                            <div style={{
                              fontSize: '1.5rem',
                              color: product.sentimentScore >= 75 ? '#10b981' : 
                                     product.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'baseline',
                              gap: '0.25rem'
                            }}>
                              {product.sentimentScore.toFixed(1)}
                              <span style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280' }}>/100</span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            textAlign: 'right'
                          }}>
                            <div>Based on {currentAspects.length} aspect{currentAspects.length !== 1 ? 's' : ''}</div>
                            <div style={{ 
                              marginTop: '0.25rem',
                              color: product.sentimentScore >= 75 ? '#10b981' : 
                                     product.sentimentScore >= 50 ? '#facc15' : '#ef4444',
                              fontWeight: 600
                            }}>
                              {product.sentimentScore >= 75 ? '⭐ Excellent' : 
                               product.sentimentScore >= 50 ? '👍 Good' : '⚠️ Fair'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Product Name */}
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isDark ? 'white' : '#111827', marginBottom: '0.75rem', letterSpacing: '0.01em' }}>
                    {getProductName(product)}
                  </div>
                  {/* Product Tags */}
                  <ProductTags product={product} onTagClick={applyTagFilter} />
                  
                  {/* Dynamic Product Fields - Display ALL fields from the API */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    {extractProductFields(product)
                      .filter(field => {
                        // Exclude id and internal fields from display
                        const excludeKeys = ['id', '_id'];
                        return !excludeKeys.includes(field.originalKey);
                      })
                      .slice(0, 12) // Show first 12 fields in card, rest in modal
                      .map((field, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '0.75rem',
                            background: isDark ? 'rgba(168,85,247,0.1)' : 'rgba(168,85,247,0.06)',
                            borderRadius: '0.5rem',
                            border: isDark ? '1px solid rgba(168,85,247,0.2)' : '1px solid rgba(168,85,247,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                          }}
                        >
                          <div style={{
                            fontSize: '0.7rem',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            fontWeight: 600
                          }}>
                            {field.key}
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: isDark ? '#e5e7eb' : '#111827',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }} title={String(field.value)}>
                            {field.type === 'number' && field.originalKey.toLowerCase().includes('price') 
                              ? `₹${Number(field.value).toLocaleString()}`
                              : field.type === 'number'
                              ? field.value
                              : String(field.value)}
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  {/* Price Information (if available) */}
                  {(() => {
                    const { sellingPrice, mrp, discount } = getPriceInfo(product);
                    if (!sellingPrice && !mrp) return null;
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        alignItems: 'center', 
                        fontSize: '1rem', 
                        color: isDark ? '#f3f4f6' : '#111827', 
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        padding: '0.75rem',
                        background: 'rgba(16, 185, 129, 0.1)',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}>
                        {mrp && mrp !== sellingPrice && (
                          <div>
                            <strong style={{color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.85rem'}}>MRP:</strong>{' '}
                            <span style={{textDecoration: 'line-through', color: isDark ? '#9ca3af' : '#6b7280'}}>
                              ₹{Number(mrp).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {sellingPrice && (
                          <div>
                            <strong style={{color:'#10b981', fontSize: '0.85rem'}}>Price:</strong>{' '}
                            <span style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981'}}>
                              ₹{Number(sellingPrice).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {discount && (
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            borderRadius: '999px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            color: 'white'
                          }}>
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Rating and Reviews (if available) */}
                  {(() => {
                    const { rating, reviewsCount } = getRatingInfo(product);
                    if (!rating && !reviewsCount) return null;
                    
                    return (
                      <div style={{ 
                        display: 'flex', 
                        gap: '1.5rem', 
                        alignItems: 'center', 
                        fontSize: '0.95rem', 
                        color: isDark ? '#f3f4f6' : '#111827',
                        marginBottom: '0.75rem'
                      }}>
                        {rating && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <Star size={16} fill="#facc15" color="#facc15" />
                            <strong style={{color:'#facc15'}}>{Number(rating).toFixed(1)}</strong>
                            <span style={{color: isDark ? '#9ca3af' : '#6b7280'}}>/ 5</span>
                          </div>
                        )}
                        {reviewsCount && (
                          <div>
                            <strong style={{color:'#3b82f6'}}>Reviews:</strong> {Number(reviewsCount).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Rating Breakdown (inline preview if data exists) */}
                  {product.ratingDistribution && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <RatingBreakdown
                        distribution={product.ratingDistribution}
                        onClick={() => setRatingDistModal(product.ratingDistribution)}
                      />
                    </div>
                  )}

                  {/* More Info Button -> navigate to full details page */}
                  <button
                    onClick={() => {
                      // also track as viewed
                      try { addViewedProduct(product); } catch {}
                      navigate(`/product/${product.id}`, { state: { product } });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(139,92,246,0.9))',
                      border: '2px solid rgba(168,85,247,0.5)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      marginTop: '0.75rem',
                      transition: 'all 0.3s',
                      backdropFilter: 'blur(10px)',
                      width: '100%',
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
                    <Info size={18} />
                    <span>More Details</span>
                  </button>

                  {/* Extended specs toggle */}
                  <ProductSpecsExtended product={product} extractFields={extractProductFields} />

                  {/* Review Analysis Details - Shows individual review sentiments */}
                  {product.reviewResults && product.reviewResults.length > 0 && (
                    <ReviewAnalysisDetails product={product} />
                  )}
                  
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at 80% 20%, rgba(168,85,247,0.08) 0%, transparent 70%)',
                    zIndex: 0,
                  }}></div>
                </div>
              ))}
            </div>
            {/* Smart Recommendations */}
            <SmartRecommendations baseProducts={filteredProducts.slice(0, 2)} allProducts={filteredProducts} />
          </div>
        )}

        {/* Feature Navigation Buttons - Always visible on home page */}
        {route === 'home' && (
          <div style={{
            maxWidth: '1200px',
            margin: '4rem auto 2rem',
            padding: '0 2rem'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {/* Product Comparison Tool Button */}
              <button
                onClick={() => {
                  localStorage.setItem('searchResults', JSON.stringify(products));
                  navigate('/compare');
                }}
                disabled={products.length < 2}
                style={{
                  padding: '2rem',
                  background: products.length >= 2 
                    ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2))'
                    : 'rgba(31,41,55,0.6)',
                  border: products.length >= 2 
                    ? '2px solid rgba(168,85,247,0.5)'
                    : '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  color: 'white',
                  cursor: products.length >= 2 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s',
                  textAlign: 'left',
                  opacity: products.length >= 2 ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (products.length >= 2) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(139,92,246,0.4))';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(168,85,247,0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (products.length >= 2) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.2))';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(168,85,247,0.3)',
                    borderRadius: '0.75rem'
                  }}>
                    <GitCompare size={32} color="#a855f7" />
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    margin: 0
                  }}>
                    Product Comparison Tool
                  </h3>
                </div>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {products.length >= 2 
                    ? 'Compare up to 2 products side-by-side with detailed specifications and sentiment analysis'
                    : 'Search for products first to use the comparison tool (minimum 2 products required)'}
                </p>
              </button>

              {/* Search History Button */}
              <button
                onClick={() => navigate('/history')}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))',
                  border: '2px solid rgba(59,130,246,0.5)',
                  borderRadius: '1rem',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(37,99,235,0.4))';
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(59,130,246,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(59,130,246,0.3)',
                    borderRadius: '0.75rem'
                  }}>
                    <Clock size={32} color="#3b82f6" />
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    margin: 0
                  }}>
                    Search History
                  </h3>
                </div>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '1rem',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {hasHistory
                    ? `View your ${history.length} recent search${history.length !== 1 ? 'es' : ''} and quickly re-run them`
                    : 'View and manage your search history (no searches yet)'}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Features (clickable navigation) */}
        {route === 'home' && (
          <div className="features">
            {features.map((feature, index) => (
              <button
                key={index}
                type="button"
                className="feature-card tilt-card"
                style={{ animationDelay: `${index * 0.2}s`, cursor: 'pointer' }}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (feature.route === '/') {
                    goHome();
                  } else {
                    navigate(feature.route);
                  }
                }}
                aria-label={feature.text}
              >
                <div className={`feature-icon bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="icon" />
                </div>
                <h3>{feature.text}</h3>
                <p>{feature.desc}</p>
                <div className="card-shine"></div>
              </button>
            ))}
          </div>
        )}

        {/* Enhanced Stats with Real-Time Data */}
        {route === 'home' && (
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value" ref={productRef}>{statsData.productsAnalyzed > 0 ? statsData.productsAnalyzed.toLocaleString() : productCount.toLocaleString()}+</div>
              <p className="stat-label">Products Analyzed</p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: isDark ? '#94a3b8' : '#6b7280',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                In your session: {statsData.productsAnalyzed}
              </p>
            </div>
            <div className="stat-item">
              <div className="stat-value" ref={accuracyRef}>{accuracyCount}%</div>
              <p className="stat-label">Accuracy Rate</p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: isDark ? '#94a3b8' : '#6b7280',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Sentiment Analysis Precision
              </p>
            </div>
            <div className="stat-item">
              <div className="stat-value" ref={userRef}>{statsData.totalSearches > 0 ? statsData.totalSearches : userCount.toLocaleString()}+</div>
              <p className="stat-label">Searches Performed</p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: isDark ? '#94a3b8' : '#6b7280',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Your searches: {statsData.totalSearches}
              </p>
            </div>
            <div className="stat-item">
              <div className="stat-value">{statsData.totalABSAAnalyses}</div>
              <p className="stat-label">ABSA Analyses</p>
              <p style={{ 
                fontSize: '0.8rem', 
                color: isDark ? '#94a3b8' : '#6b7280',
                marginTop: '0.5rem',
                fontStyle: 'italic'
              }}>
                Aspect-based evaluations
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Product Comparison overlay UI */}
      {/* Rendering here exposes the FAB and full-screen comparator without altering other behaviors */}
      <ComparisonButton />
      <ProductComparisonModal />
  {/* Recently Viewed panel removed in favor of Navbar dropdown */}

      {/* Footer */}
      <footer className="footer">
        <p>© Advanced Product Recommendation System | Capstone Project</p>
      </footer>

      {/* ABSA Filter Modal */}
      <AspectFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilter={handleApplyFilter}
        isLoading={isAnalyzing}
        extractedAspects={extractedAspects}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductForModal}
        isOpen={isModalOpen}
        onClose={closeProductDetailsModal}
      />

      {/* Rating Breakdown Modal */}
      {ratingDistModal && (
        <RatingBreakdownModal distribution={ratingDistModal} onClose={() => setRatingDistModal(null)} />
      )}

      {/* Toast Notification */}
      <Toast
        message={notificationMessage}
        show={showNotification}
        onClose={() => {}}
      />
    </div>
  );
};

export default ProductRecommendationApp;