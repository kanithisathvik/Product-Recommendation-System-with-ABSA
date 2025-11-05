import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const RecentlyViewedPanel = () => {
  const { getRecentlyViewedProducts } = useRecentlyViewed();
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
          background: 'rgba(17,24,39,0.9)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: open ? '0.75rem' : '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 -8px 24px rgba(0,0,0,0.35)'
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
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              color: '#e5e7eb',
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
                  background: 'rgba(31,41,55,0.8)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem'
                }}>
                  <div style={{
                    width: '100%', height: '100px', borderRadius: '0.375rem', overflow: 'hidden',
                    background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem'
                  }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: 600, lineHeight: 1.3 }} title={item.name}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
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
