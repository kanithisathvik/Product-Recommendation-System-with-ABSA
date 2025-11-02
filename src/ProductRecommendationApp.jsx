import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Sparkles, TrendingUp, Star, ArrowRight, Zap, Filter, Heart, ExternalLink, Mic, MicOff } from 'lucide-react';
import AspectFilterModal from './components/AspectFilterModal';
import { SentimentBadgeList } from './components/SentimentBadge';
import ReviewAnalysisDetails from './components/ReviewAnalysisDetails';
import { analyzeProductSentiment, calculateSentimentScore } from './services/aspectSentimentService';
import { speechToText } from './services/speechToTextService';

const ProductRecommendationApp = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animatedText, setAnimatedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [route, setRoute] = useState(window.location.hash === '#/about' ? 'about' : 'home');
  const mouseRef = useRef({ x: 0, y: 0 });

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

  // Load products from JSON file
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/data/products.json');
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      }
    };
    
    loadProducts();
  }, []);

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

  const [productCount] = useCountUp(10000000, 2000);
  const [accuracyCount] = useCountUp(95, 1500);
  const [userCount] = useCountUp(50000, 2500);

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

  // Simple hash-based routing for About page
  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash === '#/about' ? 'about' : 'home');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goToAbout = () => {
    window.location.hash = '#/about';
  };

  const goHome = () => {
    window.location.hash = '#/';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);

    // Extract aspects from user's search query
    const aspectsFromQuery = extractAspectsFromPrompt(prompt);
    
    console.log('[Search] User query:', prompt);
    console.log('[Search] Extracted aspects from query:', aspectsFromQuery);

    // Store extracted aspects for later merging with manual filter
    setExtractedAspects(aspectsFromQuery);

    if (aspectsFromQuery.length > 0) {
      // User mentioned specific aspects - trigger ABSA analysis
      console.log('[Search] Triggering automatic ABSA analysis with extracted aspects');
      await handleApplyFilter({
        aspects: aspectsFromQuery,
        category: 'all'
      });
    } else {
      // No aspects mentioned - show regular results
      console.log('[Search] No aspects detected, showing regular results');
      setTimeout(() => {
        setIsLoading(false);
        setShowResults(true);
      }, 2000);
    }
    
    setIsLoading(false);
  };

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
    
    console.log('[Aspect Extraction] Found aspects:', foundAspects);
    return foundAspects;
  };

  // Handle ABSA Filter Application
  const handleApplyFilter = async (filterData) => {
    const { aspects: manualAspects, category } = filterData;
    
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
      let productsToAnalyze = products;
      if (category && category !== 'all') {
        productsToAnalyze = products.filter(p => p.category === category);
      }
      
      console.log(`[ABSA] Analyzing ${productsToAnalyze.length} products...`);
      
      // Analyze each product using map-like iteration
      const analyzedProducts = [];
      
      for (let index = 0; index < productsToAnalyze.length; index++) {
        const product = productsToAnalyze[index];
        
        try {
          console.log(`[ABSA] Analyzing product ${index + 1}/${productsToAnalyze.length}: ${product.product_name}`);
          console.log(`[ABSA] Product has ${product.reviews.length} reviews`);
          
          // Analyze product sentiment with ALL merged aspects
          const result = await analyzeProductSentiment(product, allAspects);
          
          console.log(`[ABSA] Product analysis complete:`, {
            name: product.product_name,
            reviewsAnalyzed: result.totalReviewsAnalyzed,
            totalReviews: result.totalReviews,
            sentiments: result.sentiments,
            scores: result.scores
          });
          
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
          console.error(`[ABSA] Error analyzing product ${product.id}:`, error);
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
      
      // Sort by sentiment score (highest first)
      analyzedProducts.sort((a, b) => b.sentimentScore - a.sentimentScore);
      
      console.log('[ABSA] Products ranked by sentiment score');
      
      setFilteredProducts(analyzedProducts);
      setShowResults(true);
      setIsFilterModalOpen(false);
      
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
      text: "AI-Driven Suggestions", 
      desc: "Smart algorithms analyze your preferences using advanced machine learning",
      gradient: "from-purple-500 to-pink-500"
    },
    { 
      icon: TrendingUp, 
      text: "Trending Products", 
      desc: "Stay ahead with real-time trending items and market insights",
      gradient: "from-blue-500 to-cyan-500"
    },
    { 
      icon: Star, 
      text: "Personalized Results", 
      desc: "Recommendations tailored specifically to your unique preferences",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const examplePrompts = [
    "Find laptops with good battery life and display",
    "I need excellent performance and keyboard quality",
    "Looking for laptops with great battery and build quality",
    "Show me laptops with good speakers and display"
  ];

  return (
    <div className="app">
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
      <nav className="navbar">
        <div className="brand" onClick={goHome} style={{cursor: 'pointer'}}>
          <div className="logo">
            <ShoppingBag className="icon" />
          </div>
          <span className="brand-name">Advanced Product Recommendation System</span>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={goToAbout}>About</button>
          <button className="nav-link">Features</button>
          <button className="cta-button">
            <span>Get Started</span>
            <div className="button-shimmer"></div>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        {route === 'about' ? (
          <div className="hero" style={{textAlign: 'left'}}>
            <div className="badge">
              <Zap className="badge-icon" />
              <span>About This Capstone</span>
            </div>
            <h1 className="hero-title">Team Members</h1>
            <p className="hero-desc" style={{maxWidth: 900}}>
              Below are the contributors to this project along with their registration numbers.
            </p>
            <div className="features" style={{marginTop: '2rem'}}>
              <div className="feature-card tilt-card">
                <h3>Abdulla Shahensha Razwaa</h3>
                <p>Reg No: 22BCE9149</p>
              </div>
              <div className="feature-card tilt-card">
                <h3>Binayak Sinha</h3>
                <p>Reg No: 22BCE8642</p>
              </div>
              <div className="feature-card tilt-card">
                <h3>Vudathu Rahul</h3>
                <p>Reg No: 22BCE9172</p>
              </div>
              <div className="feature-card tilt-card">
                <h3>Kanithi Tirumala Satya Sathvik</h3>
                <p>Reg No: 22BCE8492</p>
              </div>
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

          {/* Enhanced Search Interface */}
          <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Describe the product you're looking for..."
                disabled={isLoading || isRecording || isSpeechProcessing}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="search-input"
              />

              <button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="search-btn magnetic-btn"
              >
                {isLoading ? (
                  <div className="advanced-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                  </div>
                ) : (
                  <>
                    <span>Find Products</span>
                    <ArrowRight className="arrow" />
                    <div className="button-ripple"></div>
                  </>
                )}
              </button>
              
              {/* Voice Input Button - After Find Products */}
              <button
                onClick={handleVoiceInput}
                disabled={isLoading || isRecording || isSpeechProcessing}
                className="voice-input-btn magnetic-btn"
                title={isRecording ? "Recording..." : isSpeechProcessing ? "Processing..." : "Voice Search"}
                style={{
                  marginLeft: '12px',
                  padding: '0.75rem 1.5rem',
                  background: isRecording 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : isSpeechProcessing 
                    ? 'linear-gradient(135deg, #facc15, #eab308)'
                    : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: isRecording || isSpeechProcessing ? 'not-allowed' : 'pointer',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: isRecording 
                    ? '0 0 25px rgba(239, 68, 68, 0.6)' 
                    : '0 8px 16px rgba(139, 92, 246, 0.3)',
                  animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isRecording ? (
                  <>
                    <MicOff size={20} />
                    <span>Recording...</span>
                  </>
                ) : isSpeechProcessing ? (
                  <>
                    <div className="advanced-spinner" style={{ width: '20px', height: '20px' }}>
                      <div className="spinner-ring" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    </div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Mic size={20} />
                    <span>Voice Search</span>
                  </>
                )}
                <div className="button-ripple"></div>
              </button>
            </div>
            
            {/* Voice Input Status Messages */}
            {(isRecording || isSpeechProcessing || speechError) && (
              <div style={{
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: speechError ? '#ef4444' : isRecording ? '#8b5cf6' : '#facc15',
                fontWeight: 500,
                padding: '8px 16px',
                background: speechError 
                  ? 'rgba(239, 68, 68, 0.1)' 
                  : isRecording 
                  ? 'rgba(139, 92, 246, 0.1)'
                  : 'rgba(250, 204, 21, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${speechError ? '#ef4444' : isRecording ? '#8b5cf6' : '#facc15'}33`
              }}>
                {speechError ? (
                  <span>❌ {speechError}</span>
                ) : isRecording ? (
                  <span>🎤 Listening... Speak now! (Auto-stops in 10 seconds)</span>
                ) : isSpeechProcessing ? (
                  <span>⏳ Processing your speech... Please wait</span>
                ) : null}
              </div>
            )}
            
            <div className="search-glow"></div>
          </div>

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
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">
                {currentAspects.length > 0 
                  ? `Products Ranked by: ${currentAspects.join(', ')}`
                  : 'Laptop Matches Found'}
              </h2>
              <div className="results-filters">
                <button 
                  className="filter-btn"
                  onClick={() => setIsFilterModalOpen(true)}
                  disabled={isAnalyzing}
                >
                  <Filter size={16} />
                  <span>Sentiment Filter</span>
                </button>
                {currentAspects.length > 0 && (
                  <button 
                    className="filter-btn reset"
                    onClick={handleResetFilters}
                  >
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
            <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {/* Display analyzed products with sentiment badges */}
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-card" style={{
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
                  transition: 'box-shadow 0.3s',
                }}>
                  {/* Product Image */}
                  {product.image && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <img 
                        src={product.image} 
                        alt={product.product_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}

                  {/* Sentiment Badges */}
                  {product.sentiments && Object.keys(product.sentiments).length > 0 && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#9ca3af', 
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
                              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>/100</span>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            color: '#9ca3af',
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

                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                    {product.product_name}
                  </div>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem', color: '#d1d5db' }}>
                    <div><strong style={{color:'#a855f7'}}>Brand:</strong> {product.brand}</div>
                    <div><strong style={{color:'#10b981'}}>Series:</strong> {product.series}</div>
                    <div><strong style={{color:'#3b82f6'}}>Color:</strong> {product.colour}</div>
                    <div><strong style={{color:'#f472b6'}}>Form Factor:</strong> {product.form_factor}</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.95rem', color: '#d1d5db' }}>
                    <div><strong style={{color:'#facc15'}}>Display:</strong> {product.standing_screen_display_size} ({product.screen_resolution})</div>
                    <div><strong style={{color:'#a3e635'}}>Processor:</strong> {product.processor_type}</div>
                    <div><strong style={{color:'#34d399'}}>RAM:</strong> {product.ram_gb} GB</div>
                    <div><strong style={{color:'#60a5fa'}}>Storage:</strong> {product.storage_gb} GB SSD</div>
                  </div>
                  
                  <div style={{ fontSize: '0.95rem', color: '#d1d5db' }}>
                    <strong style={{color:'#f472b6'}}>Graphics:</strong> {product.graphics_coprocessor}
                  </div>
                  
                  <div style={{ fontSize: '0.95rem', color: '#d1d5db' }}>
                    <strong style={{color:'#a855f7'}}>OS:</strong> {product.operating_system}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '1rem', color: '#f3f4f6', marginTop: '0.5rem' }}>
                    <div><strong style={{color:'#facc15'}}>MRP:</strong> ₹{product.mrp.toLocaleString()}</div>
                    <div><strong style={{color:'#10b981'}}>Price:</strong> ₹{product.selling_price.toLocaleString()}</div>
                    <div><strong style={{color:'#a855f7'}}>Discount:</strong> {product.discount}%</div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '1rem', color: '#f3f4f6' }}>
                    <div><strong style={{color:'#f472b6'}}>Rating:</strong> {product.rating} / 5</div>
                    <div><strong style={{color:'#3b82f6'}}>Reviews:</strong> {product.reviews_count}</div>
                  </div>

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
          </div>
        )}

        {/* Enhanced Features */}
        {route === 'home' && (
          <div className="features">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card tilt-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`feature-icon bg-gradient-to-br ${feature.gradient}`}>
                  <feature.icon className="icon" />
                </div>
                <h3>{feature.text}</h3>
                <p>{feature.desc}</p>
                <div className="card-shine"></div>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Stats */}
        {route === 'home' && (
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{productCount.toLocaleString()}+</div>
              <p>Products Analyzed</p>
            </div>
            <div className="stat-item">
              <div className="stat-value">{accuracyCount}%</div>
              <p>Accuracy Rate</p>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userCount.toLocaleString()}+</div>
              <p>Happy Users</p>
            </div>
          </div>
        )}
      </main>

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
    </div>
  );
};

export default ProductRecommendationApp;