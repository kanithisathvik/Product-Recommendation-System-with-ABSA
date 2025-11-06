import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useFavorites } from '../context/FavoritesContext.jsx';
import RecentlyViewedButton from './RecentlyViewedButton';

const Navbar = () => {
  const navigate = useNavigate();
  const { favoritesCount } = useFavorites();

  return (
    <nav className="navbar">
      <div className="brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
        <div className="logo">
          <ShoppingBag className="icon" />
        </div>
        <span className="brand-name">Advanced Product Recommendation System</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" type="button" onClick={() => navigate('/about')}>About</button>
        <button className="nav-link" type="button" onClick={() => navigate('/features')}>Features</button>

        <button 
          className="nav-link" 
          type="button"
          onClick={() => navigate('/favorites')}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Heart size={18} fill={favoritesCount > 0 ? '#ef4444' : 'none'} color={favoritesCount > 0 ? '#ef4444' : 'currentColor'} />
          Favorites
          {favoritesCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              padding: '2px 6px',
              borderRadius: '999px',
              minWidth: '20px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
            }}>
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Recently Viewed dropdown trigger */}
        <RecentlyViewedButton />

        <div style={{ marginLeft: '0.5rem' }}>
          <ThemeToggle />
        </div>
        
        <button className="cta-button" type="button" onClick={() => navigate('/') }>
          <span>Get Started</span>
          <div className="button-shimmer"></div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
