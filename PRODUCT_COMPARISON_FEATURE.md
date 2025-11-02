# Product Comparison Feature

## Overview
A non-intrusive product comparison tool that allows users to select and compare up to 4 products side-by-side.

## Features
- ✅ **Checkbox on Product Cards**: Each product has a comparison checkbox in the top-right corner
- ✅ **Visual Feedback**: Selected products are highlighted with purple border and background
- ✅ **Smart Limits**: Maximum 4 products can be selected at once
- ✅ **Floating Button**: Appears only when 2+ products are selected
- ✅ **Full-Screen Modal**: Beautiful comparison view with all product details
- ✅ **Side-by-Side Comparison**: Compare prices, ratings, sentiments, and aspects
- ✅ **Non-Intrusive**: Doesn't affect existing functionality

## Usage

### For Users
1. Browse products in search results
2. Click the checkbox (with GitCompare icon) on products you want to compare
3. When 2+ products are selected, a floating button appears in the bottom-right
4. Click "Compare Products" button to open the comparison modal
5. View detailed side-by-side comparison
6. Remove products by clicking the ✕ button on them
7. Close the modal anytime

### For Developers

#### Components Added
```
src/
├── context/
│   └── ComparisonContext.jsx     # State management for comparison
├── components/
│   ├── ProductComparisonModal.jsx  # Full-screen comparison view
│   └── ComparisonButton.jsx        # Floating action button
```

#### Integration Points

**1. App.jsx**
```jsx
import { ComparisonProvider } from "./context/ComparisonContext";

function App() {
  return (
    <ComparisonProvider>
      <ProductRecommendationApp />
    </ComparisonProvider>
  );
}
```

**2. ProductRecommendationApp.jsx**
```jsx
// Import components
import ProductComparisonModal from './components/ProductComparisonModal';
import ComparisonButton from './components/ComparisonButton';
import { useComparison } from './context/ComparisonContext';

// Use comparison context
const { toggleComparison, isSelected, canAddMore } = useComparison();

// Add to JSX
return (
  <div className="app">
    <ProductComparisonModal />
    <ComparisonButton />
    {/* Rest of the app */}
  </div>
);
```

**3. Product Card Integration**
Each product card now has a checkbox in the top-right corner:
```jsx
<div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
  <label htmlFor={`compare-${product.id}`}>
    <input
      type="checkbox"
      checked={isSelected(product.id)}
      onChange={() => toggleComparison(product)}
      disabled={!canAddMore && !isSelected(product.id)}
    />
    <GitCompare size={16} />
  </label>
</div>
```

## API Reference

### ComparisonContext

#### Methods
- `addToComparison(product)` - Add a product to comparison
- `removeFromComparison(productId)` - Remove a product
- `toggleComparison(product)` - Toggle product selection
- `isSelected(productId)` - Check if product is selected
- `clearComparison()` - Clear all selections
- `openModal()` - Open comparison modal
- `closeModal()` - Close comparison modal

#### State
- `selectedProducts` - Array of selected products
- `count` - Number of selected products
- `canAddMore` - Boolean, true if < 4 products selected
- `maxComparison` - Maximum products allowed (4)
- `isModalOpen` - Modal visibility state

## Styling

### Custom Styles Added
```css
/* Product Comparison Styles */
.animate-fadeIn {
  animation: fade-in 0.3s ease-out;
}

/* Comparison checkbox hover effects */
input[type="checkbox"]:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

/* Scrollbar styling for comparison modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
```

## Design Decisions

### Why Context API?
- Global state without prop drilling
- Easy to extend with new features
- Clean separation of concerns
- No external dependencies

### Why Maximum 4 Products?
- Optimal for side-by-side comparison
- Prevents UI clutter
- Good user experience on most screens

### Why Floating Button?
- Non-intrusive (only shows when needed)
- Always accessible
- Shows count of selected products
- Preview of selected products

### Why Full-Screen Modal?
- Better comparison experience
- More space for detailed information
- Dedicated focus on comparison
- Professional appearance

## Browser Compatibility
- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support
- ✅ Mobile browsers - Responsive design

## Performance Considerations
- Uses React Context for efficient state management
- Minimal re-renders (only affected components update)
- CSS animations for smooth UX
- No external API calls for comparison

## Future Enhancements
- [ ] Export comparison as PDF/Image
- [ ] Share comparison via URL
- [ ] Save comparison to local storage
- [ ] Print-friendly comparison view
- [ ] Compare products from different searches
- [ ] Comparison history

## Testing
To test the feature:
1. Start the dev server: `npm run dev`
2. Search for products
3. Select 2-4 products using checkboxes
4. Click "Compare Products" button
5. Verify all product details appear correctly
6. Test removing products from comparison
7. Test clearing all selections
8. Test with different screen sizes

## Troubleshooting

### Checkbox not appearing?
- Ensure ComparisonProvider wraps the app
- Check that product cards have `position: relative`

### Modal not opening?
- Verify at least 2 products are selected
- Check browser console for errors

### Styles not applying?
- Clear browser cache
- Check for CSS conflicts
- Verify index.css is imported

## Credits
- Designed for Product Recommendation System with ABSA
- Built with React, Tailwind CSS, and Lucide icons
- Follows Material Design principles
