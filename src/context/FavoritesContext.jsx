import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    // Load favorites from localStorage on init
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Save to localStorage whenever favorites change
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (product) => {
    console.log('[FavoritesContext] Adding product to favorites:', product);
    setFavorites(prev => {
      // Check if already exists
      if (prev.find(p => p.id === product.id)) {
        console.log('[FavoritesContext] Product already in favorites');
        return prev;
      }
      // Get product name dynamically
      const productName = product.product_name || product.name || product.title || product.productName || 'Product';
      showToast(`${productName} added to favorites!`);
      const newFavorites = [...prev, product];
      console.log('[FavoritesContext] New favorites count:', newFavorites.length);
      return newFavorites;
    });
  };

  const removeFromFavorites = (productId) => {
    setFavorites(prev => {
      const product = prev.find(p => p.id === productId);
      if (product) {
        // Get product name dynamically
        const productName = product.product_name || product.name || product.title || product.productName || 'Product';
        showToast(`${productName} removed from favorites`);
      }
      return prev.filter(p => p.id !== productId);
    });
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(p => p.id === productId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    showToast('All favorites cleared');
  };

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
    showNotification,
    notificationMessage
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
