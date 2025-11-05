import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useTheme } from '../context/ThemeContext';

const RecentlyViewedPanel = () => {
  const { getRecentlyViewedProducts } = useRecentlyViewed();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(true);
  const items = useMemo(() => getRecentlyViewedProducts(), [getRecentlyViewedProducts]);

  if (!items || items.length === 0) return null; // hidden if empty

  return (
    <div style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 30,
      pointerEvents: 'none'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 0.75rem',
        pointerEvents: 'auto'
      }}>
        <div style={{
          background: isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.98)',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: open ? '0.75rem' : '0.75rem',
          overflow: 'hidden',
          boxShadow: isDark ? '0 -8px 24px rgba(0,0,0,0.35)' : '0 -8px 24px rgba(17,24,39,0.08)'
        }}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)',
              border: 'none',
              color: isDark ? '#e5e7eb' : '#111827',
              cursor: 'pointer'
            }}
            aria-expanded={open}
          >
            Recently viewed
            {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          {open && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '0.75rem',
              overflowX: 'auto'
            }}>
              {items.map(item => (
                <div key={item.id} style={{
                  minWidth: '180px',
                  maxWidth: '220px',
                  background: isDark ? 'rgba(31,41,55,0.8)' : 'rgba(255,255,255,0.98)',
                  border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}>
                  <div style={{
                    width: '100%', height: '100px', borderRadius: '0.375rem', overflow: 'hidden',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.06)', marginBottom: '0.5rem'
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: isDark ? '#e5e7eb' : '#111827', fontWeight: 600, lineHeight: 1.3 }} title={item.name}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '0.25rem' }}>
                    {item.category || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewedPanel;
