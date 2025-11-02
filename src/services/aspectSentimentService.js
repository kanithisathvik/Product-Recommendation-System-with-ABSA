/**
 * Aspect-Based Sentiment Analysis Service
 * 
 * This service handles communication with the Gradio API model:
 * sathvik1223/Aspect_based_sentiment_analysis
 * 
 * Features:
 * - Analyzes sentiment for specific product aspects
 * - Caches results in localStorage for performance
 * - Handles errors gracefully
 * - Supports batch processing of reviews
 */

import { Client } from "@gradio/client";

const GRADIO_API_URL = "sathvik1223/Aspect_based_sentiment_analysis";
const CACHE_PREFIX = "absa_cache_";
const CACHE_EXPIRY_HOURS = 24;

/**
 * Get cache key for a specific product and aspects
 */
const getCacheKey = (productId, aspects) => {
  const aspectsKey = aspects.sort().join(',');
  return `${CACHE_PREFIX}${productId}_${aspectsKey}`;
};

/**
 * Check if cached result is still valid
 */
const isCacheValid = (cacheData) => {
  if (!cacheData || !cacheData.timestamp) return false;
  
  const now = Date.now();
  const expiryTime = cacheData.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
  
  return now < expiryTime;
};

/**
 * Get cached sentiment analysis result
 */
export const getCachedSentiment = (productId, aspects) => {
  try {
    const cacheKey = getCacheKey(productId, aspects);
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    const cacheData = JSON.parse(cached);
    
    if (isCacheValid(cacheData)) {
      console.log(`[ABSA Cache] Hit for product ${productId}`);
      return cacheData.result;
    } else {
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      return null;
    }
  } catch (error) {
    console.error('[ABSA Cache] Error reading cache:', error);
    return null;
  }
};

/**
 * Save sentiment analysis result to cache
 */
export const cacheSentimentResult = (productId, aspects, result) => {
  try {
    const cacheKey = getCacheKey(productId, aspects);
    const cacheData = {
      timestamp: Date.now(),
      result: result
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.log(`[ABSA Cache] Saved for product ${productId}`);
  } catch (error) {
    console.error('[ABSA Cache] Error saving cache:', error);
  }
};

/**
 * Clear all ABSA cache entries
 */
export const clearSentimentCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    console.log('[ABSA Cache] Cleared all cache');
  } catch (error) {
    console.error('[ABSA Cache] Error clearing cache:', error);
  }
};

/**
 * Parse sentiment result from Gradio API response
 * The API returns a string with format: "aspect1: sentiment1, aspect2: sentiment2"
 * OR it might return an array or object depending on the model output
 */
const parseSentimentResult = (resultData) => {
  const sentiments = {};
  
  try {
    console.log('[ABSA Parse] Raw API response:', resultData);
    console.log('[ABSA Parse] Type:', typeof resultData);
    
    // Handle different response formats
    let resultString = '';
    
    if (Array.isArray(resultData)) {
      // If it's an array, join or take first element
      resultString = Array.isArray(resultData[0]) ? resultData[0][0] : resultData[0];
      console.log('[ABSA Parse] Array format, extracted:', resultString);
    } else if (typeof resultData === 'object' && resultData !== null) {
      // If it's an object, try to extract the text
      resultString = resultData.text || resultData.value || resultData.label || JSON.stringify(resultData);
      console.log('[ABSA Parse] Object format, extracted:', resultString);
    } else if (typeof resultData === 'string') {
      resultString = resultData;
      console.log('[ABSA Parse] String format:', resultString);
    } else {
      console.warn('[ABSA Parse] Unknown format, converting to string');
      resultString = String(resultData);
    }
    
    if (!resultString || resultString.trim() === '') {
      console.warn('[ABSA Parse] Empty result string');
      return sentiments;
    }
    
    // Clean the string - remove extra whitespace, quotes, brackets
    resultString = resultString.replace(/[\[\]"']/g, '').trim();
    
    console.log('[ABSA Parse] Cleaned string:', resultString);
    
    // Parse the result string
    // Expected formats:
    // 1. "battery life: positive, display: negative, performance: neutral"
    // 2. "battery life positive, display negative"
    // 3. Just check for aspect names and sentiment words
    
    const pairs = resultString.split(',').map(s => s.trim());
    console.log('[ABSA Parse] Split into pairs:', pairs);
    
    pairs.forEach(pair => {
      // Try to find aspect and sentiment in the pair
      const lowerPair = pair.toLowerCase();
      
      // Split by colon first
      let aspect = '';
      let sentimentRaw = '';
      
      if (pair.includes(':')) {
        const colonIndex = pair.lastIndexOf(':');
        aspect = pair.substring(0, colonIndex).trim().toLowerCase();
        sentimentRaw = pair.substring(colonIndex + 1).trim().toLowerCase();
      } else {
        // No colon - try to parse without it
        const words = pair.toLowerCase().split(/\s+/);
        
        // Look for sentiment words
        if (words.includes('positive') || words.includes('good') || words.includes('great')) {
          sentimentRaw = 'positive';
          aspect = words.filter(w => w !== 'positive' && w !== 'good' && w !== 'great').join(' ');
        } else if (words.includes('negative') || words.includes('bad') || words.includes('poor')) {
          sentimentRaw = 'negative';
          aspect = words.filter(w => w !== 'negative' && w !== 'bad' && w !== 'poor').join(' ');
        } else if (words.includes('neutral') || words.includes('mixed') || words.includes('okay')) {
          sentimentRaw = 'neutral';
          aspect = words.filter(w => w !== 'neutral' && w !== 'mixed' && w !== 'okay').join(' ');
        } else {
          // Can't parse - skip
          console.warn('[ABSA Parse] Could not parse pair:', pair);
          return;
        }
      }
      
      console.log('[ABSA Parse] Parsing:', { aspect, sentimentRaw });
      
      // Normalize sentiment values
      let sentiment = 'neutral';
      if (sentimentRaw.includes('positive') || sentimentRaw.includes('good') || sentimentRaw.includes('great') || sentimentRaw.includes('excellent')) {
        sentiment = 'positive';
      } else if (sentimentRaw.includes('negative') || sentimentRaw.includes('bad') || sentimentRaw.includes('poor') || sentimentRaw.includes('terrible')) {
        sentiment = 'negative';
      } else if (sentimentRaw.includes('neutral') || sentimentRaw.includes('mixed') || sentimentRaw.includes('okay') || sentimentRaw.includes('average')) {
        sentiment = 'neutral';
      }
      
      if (aspect && aspect.length > 0) {
        sentiments[aspect] = sentiment;
      }
    });
    
    console.log('[ABSA Parse] Final parsed sentiments:', sentiments);
  } catch (error) {
    console.error('[ABSA Parse] Error parsing result:', error);
  }
  
  return sentiments;
};

/**
 * Fallback sentiment analysis using keyword matching
 * Used if API parsing fails or for testing
 */
const fallbackSentimentAnalysis = (reviewText, aspects) => {
  console.log('[ABSA Fallback] Using keyword-based sentiment analysis');
  
  const sentiments = {};
  const lowerReview = reviewText.toLowerCase();
  
  // Positive and negative keywords
  const positiveWords = ['amazing', 'excellent', 'great', 'good', 'best', 'love', 'perfect', 'outstanding', 'fantastic', 'wonderful', 'impressive', 'solid', 'premium', 'stunning', 'gorgeous', 'powerful', 'smooth', 'fast', 'exceptional', 'comfortable', 'responsive'];
  const negativeWords = ['terrible', 'bad', 'poor', 'worst', 'hate', 'awful', 'disappointing', 'slow', 'weak', 'plasticky', 'cheap', 'mediocre', 'underwhelming', 'lacking', 'fails', 'drains', 'loud', 'heavy', 'limited'];
  
  aspects.forEach(aspect => {
    const aspectLower = aspect.toLowerCase();
    
    // Find sentences mentioning this aspect
    const sentences = reviewText.split(/[.!?]+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence mentions this aspect
      if (lowerSentence.includes(aspectLower) || 
          (aspectLower === 'battery life' && lowerSentence.includes('battery')) ||
          (aspectLower === 'display' && (lowerSentence.includes('screen') || lowerSentence.includes('monitor'))) ||
          (aspectLower === 'performance' && (lowerSentence.includes('speed') || lowerSentence.includes('fast') || lowerSentence.includes('slow')))) {
        
        // Count positive and negative words in this sentence
        positiveWords.forEach(word => {
          if (lowerSentence.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
          if (lowerSentence.includes(word)) negativeCount++;
        });
      }
    });
    
    // Determine sentiment
    if (positiveCount > negativeCount) {
      sentiments[aspectLower] = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiments[aspectLower] = 'negative';
    } else {
      sentiments[aspectLower] = 'neutral';
    }
    
    console.log(`[ABSA Fallback] ${aspect}: ${sentiments[aspectLower]} (pos: ${positiveCount}, neg: ${negativeCount})`);
  });
  
  return sentiments;
};

/**
 * Analyze sentiment for a single review text
 * 
 * @param {string} reviewText - The review text to analyze
 * @param {string[]} aspects - Array of aspects to analyze
 * @returns {Promise<Object>} - Object mapping aspects to sentiments
 */
export const analyzeSentiment = async (reviewText, aspects) => {
  try {
    console.log('[ABSA API] ==========================================');
    console.log('[ABSA API] Connecting to Gradio API...');
    console.log('[ABSA API] Model: sathvik1223/Aspect_based_sentiment_analysis');
    
    // Connect to the Gradio API
    const client = await Client.connect("sathvik1223/Aspect_based_sentiment_analysis");
    
    console.log('[ABSA API] Connected successfully!');
    
    // Prepare aspects as comma-separated string
    const aspectsString = aspects.join(', ');
    
    console.log('[ABSA API] ==========================================');
    console.log('[ABSA API] INPUT TO MODEL:');
    console.log('[ABSA API] Review:', reviewText);
    console.log('[ABSA API] Aspects:', aspectsString);
    console.log('[ABSA API] ==========================================');
    
    // Call the predict endpoint with exact parameter names
    const result = await client.predict("/predict", {
      sentence: reviewText,      // The review text
      aspects: aspectsString     // Comma-separated aspects
    });
    
    console.log('[ABSA API] ==========================================');
    console.log('[ABSA API] RAW API RESPONSE:');
    console.log('[ABSA API] Full result object:', JSON.stringify(result, null, 2));
    console.log('[ABSA API] result.data:', result.data);
    console.log('[ABSA API] result.data type:', typeof result.data);
    console.log('[ABSA API] ==========================================');
    
    // Parse the result - handle different possible formats
    let sentiments = parseSentimentResult(result.data);
    
    // If parsing failed or returned empty, use fallback
    if (Object.keys(sentiments).length === 0) {
      console.warn('[ABSA API] Parsing failed or returned empty. Using fallback analysis.');
      sentiments = fallbackSentimentAnalysis(reviewText, aspects);
    }
    
    console.log('[ABSA API] ==========================================');
    console.log('[ABSA API] FINAL SENTIMENTS:', sentiments);
    console.log('[ABSA API] ==========================================');
    
    return sentiments;
  } catch (error) {
    console.error('[ABSA API] ==========================================');
    console.error('[ABSA API] ERROR analyzing sentiment:');
    console.error('[ABSA API] Error message:', error.message);
    console.error('[ABSA API] Using fallback analysis...');
    console.error('[ABSA API] ==========================================');
    
    // Use fallback on error
    return fallbackSentimentAnalysis(reviewText, aspects);
  }
};

/**
 * Analyze sentiment for multiple reviews and aggregate results
 * Uses map function to iterate through all reviews
 * 
 * @param {string[]} reviews - Array of review texts
 * @param {string[]} aspects - Array of aspects to analyze
 * @returns {Promise<Object>} - Aggregated sentiment scores per aspect
 */
export const analyzeMultipleReviews = async (reviews, aspects) => {
  try {
    console.log(`\n[ABSA Multi-Review] ==========================================`);
    console.log(`[ABSA Multi-Review] Starting analysis for ${reviews.length} reviews`);
    console.log(`[ABSA Multi-Review] Aspects to analyze:`, aspects);
    console.log(`[ABSA Multi-Review] First review preview:`, reviews[0] ? String(reviews[0]).substring(0, 100) + '...' : 'N/A');
    console.log(`[ABSA Multi-Review] ==========================================\n`);
    
    const sentimentCounts = {};
    
    // Initialize counters for each aspect
    aspects.forEach(aspect => {
      sentimentCounts[aspect.toLowerCase()] = {
        positive: 0,
        negative: 0,
        neutral: 0,
        total: 0,
        reviewDetails: [] // Store individual review results
      };
    });
    
    // Use map to create array of promises for parallel processing (optional)
    // For sequential processing to avoid rate limits, we'll use a for loop
    // But store results in an array using map-like structure
    
    const reviewResults = [];
    
    // Iterate through each review using forEach (map-like iteration)
    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      
      try {
        console.log(`[ABSA] Analyzing review ${i + 1}/${reviews.length}:`, review.substring(0, 50) + '...');
        
        // Call Hugging Face API via Gradio for each review
        const sentiments = await analyzeSentiment(review, aspects);
        
        console.log(`[ABSA] Review ${i + 1} sentiments:`, sentiments);
        
        // Store individual review result
        reviewResults.push({
          reviewIndex: i,
          reviewText: review,
          sentiments: sentiments
        });
        
        // Update aggregate counts for each aspect
        Object.entries(sentiments).forEach(([aspect, sentiment]) => {
          const aspectLower = aspect.toLowerCase();
          if (sentimentCounts[aspectLower]) {
            sentimentCounts[aspectLower][sentiment]++;
            sentimentCounts[aspectLower].total++;
            sentimentCounts[aspectLower].reviewDetails.push({
              reviewIndex: i,
              sentiment: sentiment
            });
          }
        });
        
        // Small delay to avoid rate limiting the Hugging Face API
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
        console.warn(`[ABSA] Error analyzing review ${i + 1}, skipping:`, error.message);
        reviewResults.push({
          reviewIndex: i,
          reviewText: review,
          error: error.message
        });
      }
    }
    
    console.log('[ABSA] All reviews analyzed. Results:', reviewResults);
    
    // Calculate dominant sentiment for each aspect using map
    const dominantSentiments = {};
    const aspectScores = {};
    
    Object.entries(sentimentCounts).forEach(([aspect, counts]) => {
      if (counts.total === 0) {
        dominantSentiments[aspect] = 'neutral';
        aspectScores[aspect] = 0;
      } else {
        // Find the sentiment with highest count
        const max = Math.max(counts.positive, counts.negative, counts.neutral);
        
        if (counts.positive === max) {
          dominantSentiments[aspect] = 'positive';
        } else if (counts.negative === max) {
          dominantSentiments[aspect] = 'negative';
        } else {
          dominantSentiments[aspect] = 'neutral';
        }
        
        // Calculate aspect score: (positive - negative) / total
        aspectScores[aspect] = (counts.positive - counts.negative) / counts.total;
      }
    });
    
    console.log('[ABSA] Aggregated sentiments:', dominantSentiments);
    console.log('[ABSA] Aspect scores:', aspectScores);
    
    return {
      sentiments: dominantSentiments,
      details: sentimentCounts,
      scores: aspectScores,
      reviewResults: reviewResults,
      totalReviewsAnalyzed: reviewResults.filter(r => !r.error).length,
      totalReviews: reviews.length
    };
  } catch (error) {
    console.error('[ABSA] Error analyzing multiple reviews:', error);
    throw error;
  }
};

/**
 * Analyze product with caching support
 * 
 * @param {Object} product - Product object with id and reviews
 * @param {string[]} aspects - Array of aspects to analyze
 * @returns {Promise<Object>} - Sentiment analysis result
 */
export const analyzeProductSentiment = async (product, aspects) => {
  console.log(`[Sentiment Service] Analyzing product: ${product.product_name || product.name || 'Unknown'}`);
  console.log(`[Sentiment Service] Product ID: ${product.id || 'No ID'}`);
  console.log(`[Sentiment Service] Number of reviews received: ${product.reviews ? product.reviews.length : 0}`);
  console.log(`[Sentiment Service] Aspects to analyze:`, aspects);
  
  // Check if product has reviews
  if (!product.reviews || product.reviews.length === 0) {
    console.warn(`[Sentiment Service] No reviews found for product ${product.product_name || product.id}`);
    return {
      sentiments: {},
      details: {},
      scores: {},
      reviewResults: [],
      totalReviewsAnalyzed: 0,
      totalReviews: 0
    };
  }
  
  // Check cache first
  const cached = getCachedSentiment(product.id, aspects);
  if (cached) {
    console.log(`[Sentiment Service] Using cached result for product ${product.product_name}`);
    return cached;
  }
  
  console.log(`[Sentiment Service] Starting fresh analysis for product ${product.product_name}`);
  
  // Analyze reviews
  const result = await analyzeMultipleReviews(product.reviews, aspects);
  
  console.log(`[Sentiment Service] Analysis complete for product ${product.product_name}:`, {
    totalReviews: result.totalReviews,
    reviewsAnalyzed: result.totalReviewsAnalyzed,
    sentiments: result.sentiments
  });
  
  // Cache the result
  cacheSentimentResult(product.id, aspects, result);
  
  return result;
};

/**
 * Calculate overall sentiment score for ranking products
 * 
 * This function provides a comprehensive scoring mechanism that:
 * 1. Considers ALL aspects (positive, neutral, and negative)
 * 2. Weights each sentiment appropriately:
 *    - Positive: +1.0 point
 *    - Neutral: +0.5 points (neutral is better than negative)
 *    - Negative: 0 points
 * 3. Returns a normalized score between 0-100 for easy interpretation
 * 
 * @param {Object} sentiments - Object mapping aspects to sentiment values
 * @param {Object} aspectScores - Optional detailed scores for each aspect (-1 to 1)
 * @returns {number} - Overall sentiment score (0-100)
 */
export const calculateSentimentScore = (sentiments, aspectScores = null) => {
  if (!sentiments || Object.keys(sentiments).length === 0) {
    return 0;
  }
  
  let totalScore = 0;
  let maxPossibleScore = 0;
  let aspectCount = 0;
  
  // If detailed scores are provided, use them for more accurate calculation
  if (aspectScores && Object.keys(aspectScores).length > 0) {
    Object.entries(aspectScores).forEach(([aspect, score]) => {
      // Score ranges from -1 to 1, convert to 0 to 100
      // -1 = 0 points, 0 = 50 points, 1 = 100 points
      totalScore += (score + 1) * 50;
      maxPossibleScore += 100;
      aspectCount++;
    });
  } else {
    // Fallback to simple sentiment-based scoring
    Object.values(sentiments).forEach(sentiment => {
      aspectCount++;
      maxPossibleScore += 100;
      
      if (sentiment === 'positive') {
        totalScore += 100; // Full points for positive
      } else if (sentiment === 'neutral') {
        totalScore += 50;  // Half points for neutral
      } else if (sentiment === 'negative') {
        totalScore += 0;   // No points for negative
      }
    });
  }
  
  // Return normalized score (0-100)
  const finalScore = aspectCount > 0 ? totalScore / aspectCount : 0;
  
  console.log(`[Score Calculation] Aspects: ${aspectCount}, Total: ${totalScore}, Average: ${finalScore.toFixed(2)}`);
  
  return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
};

export default {
  analyzeSentiment,
  analyzeMultipleReviews,
  analyzeProductSentiment,
  calculateSentimentScore,
  getCachedSentiment,
  cacheSentimentResult,
  clearSentimentCache
};
