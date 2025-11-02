import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position: 'relative',
        width: '3.5rem',
        height: '2rem',
        padding: '0.25rem',
        background: isDark 
          ? 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(124,58,237,0.9))' 
          : 'linear-gradient(135deg, rgba(251,191,36,0.9), rgba(245,158,11,0.9))',
        borderRadius: '9999px',
        border: '2px solid',
        borderColor: isDark ? 'rgba(168,85,247,0.5)' : 'rgba(251,191,36,0.5)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDark 
          ? '0 4px 15px rgba(168,85,247,0.4)' 
          : '0 4px 15px rgba(251,191,36,0.4)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 6px 20px rgba(168,85,247,0.6)' 
          : '0 6px 20px rgba(251,191,36,0.6)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isDark 
          ? '0 4px 15px rgba(168,85,247,0.4)' 
          : '0 4px 15px rgba(251,191,36,0.4)';
      }}
    >
      {/* Toggle Circle */}
      <div
        style={{
          position: 'absolute',
          width: '1.5rem',
          height: '1.5rem',
          background: 'white',
          borderRadius: '50%',
          transform: isDark ? 'translateX(1.5rem)' : 'translateX(0)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isDark ? (
          <Moon 
            size={16} 
            color="#8b5cf6" 
            style={{
              animation: 'rotate 0.4s ease-out'
            }}
          />
        ) : (
          <Sun 
            size={16} 
            color="#f59e0b" 
            style={{
              animation: 'rotate 0.4s ease-out'
            }}
          />
        )}
      </div>

      {/* Background Icons */}
      <div style={{
        position: 'absolute',
        left: '0.5rem',
        opacity: isDark ? 0 : 1,
        transition: 'opacity 0.3s ease'
      }}>
        <Sun size={14} color="white" />
      </div>
      <div style={{
        position: 'absolute',
        right: '0.5rem',
        opacity: isDark ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}>
        <Moon size={14} color="white" />
      </div>

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg) scale(0.8); opacity: 0; }
          to { transform: rotate(360deg) scale(1); opacity: 1; }
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle;
