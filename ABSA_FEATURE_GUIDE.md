# Aspect-Based Sentiment Analysis (ABSA) Feature Guide

## 🎯 Overview

This project now includes an **Aspect-Based Sentiment Analysis** feature that uses the Hugging Face Gradio API (`sathvik1223/Aspect_based_sentiment_analysis`) to analyze product reviews and rank products based on specific aspects you care about.

## 🔄 How It Works - Complete Flow

### 1. **Data Structure** (`/public/data/products.json`)

Each product contains an array of customer reviews:

```json
{
  "id": 1,
  "product_name": "ASUS ROG Strix G16",
  "reviews": [
    "The performance is amazing but battery life could be better",
    "Display quality is stunning with vibrant colors",
    "Cooling system works exceptionally well during gaming",
    "Build quality feels premium despite the price"
  ]
}
```

### 2. **User Input Flow**

```
User clicks "Sentiment Filter" button
    ↓
Modal opens with aspect input fields
    ↓
User enters aspects: "battery life, display, performance"
    ↓
User clicks "Apply Filter"
```

### 3. **Backend Processing (Using Map Functions)**

#### Step 1: Load Products
```javascript
// Products are loaded from JSON
useEffect(() => {
  const loadProducts = async () => {
    const response = await fetch('/data/products.json');
    const data = await response.json();
    setProducts(data); // All 8 products with reviews
  };
  loadProducts();
}, []);
```

#### Step 2: Iterate Through Products
```javascript
// In handleApplyFilter() - ProductRecommendationApp.jsx
for (let index = 0; index < productsToAnalyze.length; index++) {
  const product = productsToAnalyze[index];
  
  // Analyze each product's reviews
  const result = await analyzeProductSentiment(product, aspects);
  
  analyzedProducts.push({
    ...product,
    sentiments: result.sentiments,
    reviewResults: result.reviewResults
  });
}
```

#### Step 3: Iterate Through Reviews (Map Function)
```javascript
// In analyzeMultipleReviews() - aspectSentimentService.js

// For each product, iterate through ALL reviews
for (let i = 0; i < reviews.length; i++) {
  const review = reviews[i];
  
  // Call Hugging Face API for THIS review
  const sentiments = await analyzeSentiment(review, aspects);
  
  // Store result
  reviewResults.push({
    reviewIndex: i,
    reviewText: review,
    sentiments: sentiments // e.g., { battery: 'negative', display: 'positive' }
  });
}
```

#### Step 4: Call Hugging Face API
```javascript
// In analyzeSentiment() - aspectSentimentService.js

export const analyzeSentiment = async (reviewText, aspects) => {
  // Connect to Gradio API
  const client = await Client.connect("sathvik1223/Aspect_based_sentiment_analysis");
  
  // Send review + aspects to API
  const result = await client.predict("/predict", {
    sentence: reviewText,  // Single review text
    aspects: "battery life, display, performance"  // Comma-separated
  });
  
  // API returns: "battery life: negative, display: positive, performance: positive"
  return parseSentimentResult(result.data);
};
```

### 4. **API Response Processing**

#### Example API Call and Response:
```javascript
// INPUT to Hugging Face API
{
  sentence: "The display is amazing but the battery drains fast.",
  aspects: "battery life, display"
}

// OUTPUT from API
"battery life: negative, display: positive"

// PARSED Result
{
  "battery life": "negative",
  "display": "positive"
}
```

### 5. **Aggregation Using Map**

After analyzing ALL reviews for a product, we aggregate the results:

```javascript
// Count sentiments across all reviews
const sentimentCounts = {
  "battery life": { positive: 1, negative: 3, neutral: 0, total: 4 },
  "display": { positive: 4, negative: 0, neutral: 0, total: 4 }
};

// Calculate dominant sentiment
dominantSentiments = {
  "battery life": "negative",  // 3 negative > 1 positive
  "display": "positive"        // 4 positive > 0 negative
};

// Calculate score: (positive - negative) / total
aspectScores = {
  "battery life": (1 - 3) / 4 = -0.5,
  "display": (4 - 0) / 4 = 1.0
};

// Overall sentiment score (average of all aspects)
sentimentScore = (-0.5 + 1.0) / 2 = 0.25
```

### 6. **Product Ranking**

Products are sorted by overall sentiment score:

```javascript
analyzedProducts.sort((a, b) => b.sentimentScore - a.sentimentScore);
```

### 7. **Display Results with Map**

```javascript
// Display all products
{filteredProducts.map((product, index) => (
  <div key={product.id}>
    {/* Show sentiment badges */}
    <SentimentBadgeList sentiments={product.sentiments} />
    
    {/* Show individual review analysis */}
    {product.reviewResults.map((reviewResult, i) => (
      <div key={i}>
        Review: {reviewResult.reviewText}
        Sentiments: {reviewResult.sentiments}
      </div>
    ))}
  </div>
))}
```

## 📊 Complete Data Flow Diagram

```
products.json (8 products × 4 reviews each = 32 reviews total)
    ↓
User inputs aspects: ["battery life", "display", "performance"]
    ↓
FOR EACH PRODUCT (8 iterations):
    ↓
    FOR EACH REVIEW (4 iterations per product):
        ↓
        API Call to Hugging Face:
        - Input: review text + aspects
        - Output: sentiment per aspect
        ↓
        Store individual review result
    ↓
    Aggregate sentiments across all 4 reviews
    ↓
    Calculate product sentiment score
    ↓
Sort all 8 products by sentiment score
    ↓
Display ranked products with sentiment badges
```

## 🔧 Key Functions Using Map/Iteration

### 1. **analyzeMultipleReviews** (Main Review Iterator)
```javascript
// Iterates through ALL reviews in a product
for (let i = 0; i < reviews.length; i++) {
  const review = reviews[i];
  const sentiments = await analyzeSentiment(review, aspects);
  reviewResults.push({ reviewIndex: i, sentiments });
}
```

### 2. **Display Products** (Map for Rendering)
```javascript
{filteredProducts.map((product, index) => (
  <ProductCard key={product.id} product={product} />
))}
```

### 3. **Display Review Details** (Nested Map)
```javascript
{product.reviewResults.map((reviewResult, index) => (
  <div key={index}>
    {Object.entries(reviewResult.sentiments).map(([aspect, sentiment]) => (
      <Badge key={aspect} aspect={aspect} sentiment={sentiment} />
    ))}
  </div>
))}
```

## 🎨 UI Components

### 1. **AspectFilterModal**
- User input for aspects
- Category filter
- Quick-add suggestions

### 2. **SentimentBadge**
- Color-coded pills (green=positive, red=negative, gray=neutral)
- Shows aspect name and sentiment

### 3. **ReviewAnalysisDetails** (NEW)
- Expandable section
- Shows EACH review with its sentiments
- Uses map to display all review results
- Summary statistics

## 🚀 Testing the Feature

### Step 1: Start the App
```bash
npm install
npm run dev
```

### Step 2: Click "Sentiment Filter"
- The modal opens

### Step 3: Enter Aspects
```
battery life, display, performance
```

### Step 4: Apply Filter
- Watch console logs to see:
  - Product being analyzed
  - Each review being sent to API
  - API responses
  - Aggregated results

### Step 5: View Results
- Products ranked by sentiment score
- Sentiment badges show dominant sentiment
- Click "Review-by-Review Analysis" to see individual results

## 📝 Console Output Example

```
[ABSA] Starting analysis for aspects: ["battery life", "display", "performance"]
[ABSA] Analyzing 8 products...
[ABSA] Analyzing product 1/8: ASUS ROG Strix G16
[ABSA] Product has 4 reviews
[ABSA] Analyzing review 1/4: The performance is amazing but...
[ABSA API] Raw result: "battery life: negative, display: neutral, performance: positive"
[ABSA] Review 1 sentiments: { "battery life": "negative", "display": "neutral", "performance": "positive" }
[ABSA] Analyzing review 2/4: Display quality is stunning...
[ABSA API] Raw result: "display: positive, performance: positive"
[ABSA] Review 2 sentiments: { "display": "positive", "performance": "positive" }
...
[ABSA] Product analysis complete: {
  reviewsAnalyzed: 4,
  sentiments: { "battery life": "negative", "display": "positive", "performance": "positive" },
  scores: { "battery life": -0.5, "display": 0.75, "performance": 1.0 }
}
```

## 🎯 Key Features

✅ **Iterates through ALL reviews** using for loops (map-like iteration)  
✅ **Calls Hugging Face API** for each review with specified aspects  
✅ **Aggregates sentiments** across all reviews  
✅ **Ranks products** by overall sentiment score  
✅ **Displays individual review analysis** using map functions  
✅ **Caches results** in localStorage for performance  
✅ **Shows detailed breakdown** of which reviews contributed to each sentiment  

## 🔍 Debugging

Open browser console (F12) to see detailed logs of:
- Which product is being analyzed
- Each review being sent to API
- API responses
- Aggregation calculations
- Final ranking

## 📦 Files Structure

```
src/
├── services/
│   └── aspectSentimentService.js  # API calls, review iteration, aggregation
├── components/
│   ├── AspectFilterModal.jsx      # User input modal
│   ├── SentimentBadge.jsx         # Sentiment display badges
│   └── ReviewAnalysisDetails.jsx  # Review-by-review breakdown (uses map)
├── ProductRecommendationApp.jsx   # Main app (uses map for products)
└── index.css                      # Styles for all components

public/
└── data/
    └── products.json              # Product data with reviews array
```

## 🎓 Learning Points

This implementation demonstrates:
1. **Array iteration** with for loops (equivalent to map for async operations)
2. **API integration** with Hugging Face Gradio
3. **Data aggregation** across multiple API calls
4. **React map rendering** for dynamic UI
5. **State management** for async operations
6. **Caching strategy** with localStorage
7. **Error handling** for failed API calls

---

**Created for Capstone Project - Advanced Product Recommendation System**
