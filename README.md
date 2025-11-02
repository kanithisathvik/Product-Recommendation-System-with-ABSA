# React + Vite - Product Recommendation System with ABSA

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 🆕 NEW FEATURE: Aspect-Based Sentiment Analysis (ABSA)

This project now includes an advanced **Aspect-Based Sentiment Filter** that analyzes customer reviews to determine sentiment (positive, negative, or neutral) for specific product aspects like "battery life", "display", "performance", etc.

### How It Works

1. **Browse Products**: View laptop products with detailed specifications
2. **Open Sentiment Filter**: Click the "Sentiment Filter" button in the results section
3. **Enter Aspects**: Type aspects you care about (e.g., "battery life, display, performance")
4. **Apply Filter**: Products are analyzed using AI and ranked by sentiment scores
5. **View Results**: Each product shows sentiment badges for the aspects you selected

### Key Features

- ✨ **AI-Powered Analysis**: Uses Hugging Face Gradio API (`sathvik1223/Aspect_based_sentiment_analysis`)
- 🎯 **Smart Ranking**: Products ranked by overall sentiment score
- � **Automatic Aspect Detection**: Extracts aspects from your search query automatically
- 🤝 **Aspect Merging**: Combines auto-detected aspects with manually added ones
- �💾 **Caching**: Results cached in localStorage for 24 hours for faster subsequent queries
- 🎨 **Beautiful UI**: Animated sentiment badges (positive/negative/neutral)
- 📱 **Responsive**: Works seamlessly on mobile and desktop
- 📊 **Review-by-Review Breakdown**: See sentiment for each individual review

### Technical Implementation

**Frontend Stack:**
- React 19.1.1
- Vite 7.1.7
- Tailwind CSS 4.1.13
- @gradio/client 1.10.0
- GSAP 3.13.0 for animations
- Lucide React for icons

**New Components:**
- `AspectFilterModal.jsx` - Modal UI for aspect input
- `SentimentBadge.jsx` - Sentiment pill badges
- `aspectSentimentService.js` - API integration and caching

**Data:**
- `/public/data/products.json` - 8 laptop products with reviews

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Project

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📖 Usage Guide

### Testing the ABSA Feature

1. **Start the app** and wait for products to load
2. **Click "Sentiment Filter"** button in the results section
3. **Try these example aspects:**
   - `battery life, display`
   - `performance, build quality`
   - `keyboard, speakers, trackpad`
4. **Select a category** (optional): Gaming, Ultrabook, Professional, etc.
5. **Click "Apply Filter"** and wait for analysis (may take 30-60 seconds)
6. **View ranked products** with sentiment badges

### Understanding Sentiment Badges

- 🟢 **Positive** (Green): Customers are happy with this aspect
- 🔴 **Negative** (Red): Customers are unhappy with this aspect
- ⚪ **Neutral** (Gray): Mixed or neutral sentiment

### Performance Tips

- Results are cached for 24 hours - re-analyzing same aspects is instant
- Analyzing all products may take 1-2 minutes on first run
- Use category filter to analyze fewer products faster
- Clear cache from browser DevTools if needed: `localStorage.clear()`

## 🏗️ Project Structure

```
product-recommendation-s-ver-main/
├── public/
│   └── data/
│       └── products.json          # Product data with reviews
├── src/
│   ├── components/
│   │   ├── AspectFilterModal.jsx  # ABSA filter modal
│   │   ├── SentimentBadge.jsx     # Sentiment badges
│   │   ├── DotGrid.jsx            # Interactive background
│   │   └── DotGrid.css
│   ├── services/
│   │   └── aspectSentimentService.js  # ABSA API & caching
│   ├── App.jsx
│   ├── ProductRecommendationApp.jsx   # Main component
│   ├── main.jsx
│   ├── index.css                      # Global styles + ABSA styles
│   └── App.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Gradio API Configuration

The ABSA service connects to: `sathvik1223/Aspect_based_sentiment_analysis`

To modify caching settings, edit `src/services/aspectSentimentService.js`:

```javascript
const CACHE_EXPIRY_HOURS = 24;  // Change cache duration
```

### Adding More Products

Edit `public/data/products.json` and add products with this structure:

```json
{
  "id": 9,
  "product_name": "Product Name",
  "brand": "Brand",
  "category": "gaming|ultrabook|professional|business|budget",
  "reviews": [
    "Review text 1 mentioning various aspects",
    "Review text 2 with sentiment",
    "Review text 3 with opinions"
  ],
  // ... other product fields
}
```

## 🐛 Troubleshooting

### ABSA Analysis Fails

- **Check internet connection**: API requires network access
- **Try fewer products**: Use category filter
- **Clear cache**: Run `localStorage.clear()` in browser console
- **Check console logs**: Open DevTools > Console for detailed errors

### Products Not Loading

- Ensure `public/data/products.json` exists
- Check browser console for fetch errors
- Verify file path is correct

### Slow Performance

- First analysis takes longer (building cache)
- Subsequent analyses are much faster (cached)
- Reduce number of aspects (3-4 recommended)
- Use category filter to analyze fewer products

## 🎓 Team Members

- Abdulla Shahensha Razwaa (22BCE9149)
- Binayak Sinha (22BCE8642)
- Vudathu Rahul (22BCE9172)
- Kanithi Tirumala Satya Sathvik (22BCE8492)

## 📝 Plugins Available

# 🚀 Advanced Product Recommendation System with Aspect-Based Sentiment Analysis

An AI-powered product recommendation system built with React, Vite, and Hugging Face's Aspect-Based Sentiment Analysis API. This capstone project combines modern web technologies with intelligent sentiment analysis to help users find the perfect products based on specific aspects they care about.

## ✨ Features

### 🎯 Core Features
- **AI-Powered Product Discovery** - Modern, responsive interface for product search
- **Aspect-Based Sentiment Analysis (ABSA)** - Analyze products based on specific aspects using Hugging Face AI
- **Automatic Aspect Detection** - Extracts aspects from user search queries automatically
- **Intelligent Product Ranking** - Products ranked by sentiment scores for queried aspects
- **Review-by-Review Analysis** - See individual sentiment breakdown for each review
- **Caching System** - LocalStorage caching to improve performance and reduce API calls
- **Fallback Analysis** - Keyword-based sentiment analysis if API fails

### 🎨 UI/UX Features
- Beautiful gradient animations and effects
- Interactive sentiment badges (positive/negative/neutral)
- Expandable review details with sentiment visualization
- Responsive design for all devices
- Real-time loading indicators
- Modal-based filtering interface

## 🛠️ Tech Stack

- **Frontend Framework:** React 19.1.1
- **Build Tool:** Vite 7.1.7
- **Styling:** Tailwind CSS 4.1.13 + Custom CSS
- **Icons:** Lucide React
- **Animations:** GSAP 3.13.0
- **AI Integration:** Hugging Face Gradio Client (@gradio/client)
- **Language:** JavaScript (ES6+)

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/product-recommendation-system.git
cd product-recommendation-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

## 🚀 Usage

### Basic Search
1. Enter a product query in the search box
2. View all available products with detailed specifications

### Aspect-Based Sentiment Search (Automatic)
1. Enter a query mentioning specific aspects:
   - "laptop with good **battery life** and **display**"
   - "I need excellent **performance** and **keyboard**"
2. System automatically detects aspects
3. Products are analyzed and ranked by sentiment
4. View sentiment badges on each product

### Manual Aspect Filtering
1. Click the **"Sentiment Filter"** button
2. Enter aspects (comma-separated): `battery life, display, performance`
3. Optionally select a product category
4. Click **"Apply Filter"**
5. View ranked products with sentiment analysis

### View Detailed Analysis
1. Click **"Review-by-Review Analysis"** on any product card
2. See individual sentiment for each review
3. Understand how the overall sentiment was calculated

## 🎯 Detected Aspects

The system recognizes these aspects automatically:

| Aspect | Keywords |
|--------|----------|
| **Battery Life** | battery, power, charge, charging, hours |
| **Display** | display, screen, monitor, resolution, brightness, colors |
| **Performance** | performance, speed, fast, processor, cpu, gpu, gaming |
| **Keyboard** | keyboard, typing, keys, keypad |
| **Build Quality** | build, construction, material, solid, sturdy, premium |
| **Speakers** | speakers, audio, sound, volume, bass |
| **Trackpad** | trackpad, touchpad, mouse, cursor |
| **Cooling** | cooling, heat, temperature, fan, thermal |

## 📊 How ABSA Works

### Complete Flow
```
User Search Query
    ↓
Aspect Extraction (if aspects mentioned)
    ↓
Load Product Data (8 products)
    ↓
For Each Product:
    ├─ For Each Review (4 reviews/product)
    │   ├─ Call Hugging Face API
    │   │   - Model: sathvik1223/Aspect_based_sentiment_analysis
    │   │   - Input: review text + aspects
    │   │   - Output: sentiment per aspect
    │   ├─ OR Use Fallback (keyword-based)
    │   └─ Store Result
    ├─ Aggregate All Reviews
    ├─ Calculate Sentiment Score
    └─ Cache Result
    ↓
Rank Products by Sentiment Score
    ↓
Display Results with Badges
```

### API Integration
```javascript
import { Client } from "@gradio/client";

const client = await Client.connect("sathvik1223/Aspect_based_sentiment_analysis");
const result = await client.predict("/predict", {
  sentence: "The battery life is amazing but display is just okay",
  aspects: "battery life, display"
});

// Output: "battery life: positive, display: neutral"
```

## 📁 Project Structure

```
product-recommendation-s-ver-main/
├── public/
│   └── data/
│       └── products.json          # Product data with reviews
├── src/
│   ├── components/
│   │   ├── AspectFilterModal.jsx  # Filter modal UI
│   │   ├── SentimentBadge.jsx     # Sentiment display badges
│   │   ├── ReviewAnalysisDetails.jsx # Review breakdown
│   │   └── DotGrid.jsx            # Background effects
│   ├── services/
│   │   └── aspectSentimentService.js # API integration & analysis
│   ├── ProductRecommendationApp.jsx  # Main app component
│   ├── App.jsx                    # App wrapper
│   ├── main.jsx                   # Entry point
│   ├── index.css                  # Global styles + ABSA styles
│   └── App.css                    # Component styles
├── ABSA_FEATURE_GUIDE.md          # Detailed ABSA documentation
├── AUTO_ASPECT_DETECTION.md       # Auto-detection guide
└── TESTING_GUIDE.md               # Testing instructions
```

## 🧪 Testing

### Test Queries
```bash
# Test auto-aspect detection
"laptop with good battery life and display"
"I need excellent performance and keyboard quality"
"Looking for great build quality and speakers"

# Test manual filter
1. Click "Sentiment Filter"
2. Enter: "battery life, display, performance"
3. Apply filter
```

### Debug Mode
Open browser console (F12) to see:
- Aspect extraction logs
- API calls and responses
- Sentiment parsing process
- Aggregation calculations
- Final rankings

## 🎓 Capstone Team

- **Abdulla Shahensha Razwaa** - 22BCE9149
- **Binayak Sinha** - 22BCE8642
- **Vudathu Rahul** - 22BCE9172
- **Kanithi Tirumala Satya Sathvik** - 22BCE8492

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### All sentiments showing as neutral?
- Check browser console for API errors
- Fallback keyword-based analysis should activate automatically
- Verify network connection for Hugging Face API

### No products showing?
- Check if `public/data/products.json` exists
- Verify fetch API call in console
- Clear browser cache

## 📝 License

This project is created as a capstone project for educational purposes.

## 🙏 Acknowledgments

- Hugging Face for the ABSA model (`sathvik1223/Aspect_based_sentiment_analysis`)
- React and Vite communities
- Tailwind CSS team
- Lucide Icons

## 🔗 Resources

- [ABSA Feature Guide](./ABSA_FEATURE_GUIDE.md) - Complete technical documentation
- [Auto-Aspect Detection](./AUTO_ASPECT_DETECTION.md) - Aspect extraction details
- [Testing Guide](./TESTING_GUIDE.md) - How to test features

---

**Built with ❤️ for VIT Capstone Project 2025**

## 🔮 Future Enhancements

- Add more product categories
- Implement product comparison feature
- Add sentiment trend visualization
- Support multiple languages
- Add user authentication
- Implement product wishlist

## 📄 License

© Advanced Product Recommendation System | Capstone Project
