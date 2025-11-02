import { useEffect, useState } from 'react';
import { Check, X, Heart } from 'lucide-react';

const Toast = ({ message, show, onClose, type = 'success' }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Trigger animation after mount
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    if (message.includes('❤️') || message.toLowerCase().includes('favorites')) {
      return <Heart size={20} fill="#fff" color="#fff" />;
    }
    return type === 'success' ? <Check size={20} /> : <X size={20} />;
  };

  const getColors = () => {
    if (message.includes('removed')) {
      return {
        background: 'linear-gradient(135deg, rgba(239,68,68,0.95), rgba(220,38,38,0.95))',
        border: '#ef4444',
        shadow: 'rgba(239,68,68,0.4)'
      };
    }
    return {
      background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
      border: '#10b981',
      shadow: 'rgba(16,185,129,0.4)'
    };
  };

  const colors = getColors();

  return (
    <div
      style={{
        position: 'fixed',
        top: isAnimating ? '2rem' : '-100px',
        right: '2rem',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem 1.5rem',
        background: colors.background,
        border: `2px solid ${colors.border}`,
        borderRadius: '0.75rem',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        boxShadow: `0 10px 40px ${colors.shadow}`,
        backdropFilter: 'blur(10px)',
        minWidth: '300px',
        maxWidth: '500px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isAnimating ? 1 : 0,
        transform: isAnimating ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        animation: isAnimating ? 'slideInBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
      }}
      className="dark:shadow-2xl"
    >
      {/* Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem',
        height: '2.5rem',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '50%',
        flexShrink: 0,
        animation: 'pulse 2s infinite'
      }}>
        {getIcon()}
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '1.75rem',
          height: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideInBounce {
          0% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
          60% {
            transform: translateY(10px) scale(1.05);
            opacity: 1;
          }
          80% {
            transform: translateY(-5px) scale(0.98);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          div[style*="position: fixed"] {
            right: 1rem !important;
            left: 1rem !important;
            min-width: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
