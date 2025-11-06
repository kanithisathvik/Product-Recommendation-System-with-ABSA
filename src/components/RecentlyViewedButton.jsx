import React, { useEffect, useRef, useState } from 'react';
import { Clock, Package, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useNavigate } from 'react-router-dom';

const RecentlyViewedButton = () => {
  const { isDark } = useTheme();
  const { getRecentlyViewedProducts, clearRecentlyViewed } = useRecentlyViewed();
  const items = getRecentlyViewedProducts();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (!open) return;
      if (!ref.current) return;
      if (ref.current.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        className="nav-link"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <Clock size={18} />
        Recent
      </button>

      {open && (
        <div
          ref={ref}
          role="menu"
          className="recently-viewed-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            maxHeight: 420,
            overflowY: 'auto',
            background: isDark ? 'rgba(31,41,55,0.98)' : '#ffffff',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(17,24,39,0.08)',
            borderRadius: 12,
            boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.4)' : '0 12px 36px rgba(17,24,39,0.12)',
            padding: 12,
            zIndex: 50
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: isDark ? '#e5e7eb' : '#111827' }}>Recently Viewed</div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => clearRecentlyViewed()}
                title="Clear all"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12,
                  color: isDark ? '#ef4444' : '#b91c1c',
                  background: 'transparent',
                  border: 'none', cursor: 'pointer'
                }}
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              No items yet
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate(`/product/${p.id}`, { state: { product: p } });
                  }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr',
                    gap: 12,
                    alignItems: 'center',
                    textAlign: 'left',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(17,24,39,0.04)',
                    border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(17,24,39,0.08)',
                    borderRadius: 10,
                    padding: 8,
                    color: isDark ? '#e5e7eb' : '#111827',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 8, overflow: 'hidden',
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {p.image ? (
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={20} style={{ color: isDark ? '#9ca3af' : '#64748b' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }} className="line-clamp-2">{p.name}</div>
                    <div style={{ fontSize: 12, color: isDark ? '#9ca3af' : '#6b7280', marginTop: 2 }}>
                      {p.category || '—'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentlyViewedButton;
