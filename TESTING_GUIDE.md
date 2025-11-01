# Testing ABSA Feature - Quick Guide

## 🧪 How to Test

### 1. Start the App
```bash
npm run dev
```
Open http://localhost:5173

### 2. Click "Sentiment Filter" Button

### 3. Enter Aspects
Try these:
```
battery life, display, performance
```

### 4. Click "Apply Filter"

### 5. Open Browser Console (F12)
You will see detailed logs showing:

```
[ABSA API] ==========================================
[ABSA API] Connecting to Gradio API...
[ABSA API] Model: sathvik1223/Aspect_based_sentiment_analysis
[ABSA API] Connected successfully!
[ABSA API] ==========================================
[ABSA API] INPUT TO MODEL:
[ABSA API] Review: The performance is absolutely amazing...
[ABSA API] Aspects: battery life, display, performance
[ABSA API] ==========================================
[ABSA API] RAW API RESPONSE:
[ABSA API] Full result object: { ... }
[ABSA API] result.data: ...
[ABSA API] ==========================================
```

## 📊 What Happens

### With API:
- Each of 4 reviews per product is sent to Hugging Face
- API returns sentiment for each aspect
- Results are aggregated

### With Fallback (if API fails):
- Keyword-based analysis is used
- Looks for positive/negative words near aspect mentions
- Example:
  - "battery life is terrible" → negative
  - "display is amazing" → positive
  - "performance is good" → positive

## 🔍 Checking Results

Look for these in product cards:

1. **Sentiment Badges** - Shows aggregated sentiment per aspect
2. **Sentiment Score** - Overall score (e.g., "75.0%")
3. **Review Analysis** - Click to expand and see individual review sentiments

## 🐛 Debugging

If you see all "neutral":
1. Check console for error messages
2. Look at "RAW API RESPONSE" to see what the API returned
3. Fallback analysis will kick in automatically
4. The fallback uses keyword matching and should show varied sentiments

## 📝 Sample Reviews in Data

Each product has 4 reviews. For example, ASUS ROG Strix G16:

1. "The performance is amazing but battery life could be better"
   - performance: positive
   - battery life: negative

2. "Display quality is stunning with vibrant colors"
   - display: positive

3. "Cooling system works exceptionally well during gaming"
   - (mentions cooling, not in your aspects list)

4. "Build quality feels premium despite the price"
   - (mentions build quality, not in your aspects list)

## ✅ Expected Results

When you test with "battery life, display, performance":

**ASUS ROG Strix G16:**
- battery life: negative (1 mention)
- display: positive (1 mention)
- performance: positive (1 mention)
- Sentiment Score: ~33%

**HP Pavilion Aero 13:**
- battery life: positive (multiple positive mentions)
- display: positive
- performance: positive
- Sentiment Score: ~100%

**MacBook Air M2:**
- battery life: positive (exceptional mentions)
- display: positive
- performance: positive
- Sentiment Score: ~100%

Products will be ranked with highest sentiment scores at the top!
