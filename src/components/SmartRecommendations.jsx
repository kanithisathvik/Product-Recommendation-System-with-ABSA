import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../services/getRecommendations';
import { useTheme } from '../context/ThemeContext';

const SmartRecommendations = ({ baseProducts = [], allProducts = [] }) => {
  const [recs, setRecs] = useState([]);
  const { isDark } = useTheme();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await getRecommendations({ baseProducts, allProducts });
        if (mounted) setRecs(r || []);
      } catch {
        if (mounted) setRecs([]);
      }
    })();
    return () => { mounted = false; };
  }, [baseProducts, allProducts]);

  if (!allProducts || allProducts.length === 0) return null;
  if (!recs || recs.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 800, fontSize: '1.25rem' }}>Recommended for You</h3>
        <div style={{ fontSize: '0.875rem', color: isDark ? '#9ca3af' : '#6b7280' }}>{recs.length} picks</div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {recs.map(p => (
          <div key={p.id} style={{
            minWidth: '260px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(31,41,55,0.98) 80%, rgba(59,130,246,0.08) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.98) 70%, rgba(59,130,246,0.06) 100%)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(17,24,39,0.08)',
            borderRadius: '0.75rem',
            padding: '0.75rem',
            boxShadow: isDark ? '0 6px 20px rgba(0,0,0,0.35)' : '0 6px 20px rgba(17,24,39,0.08)'
          }}>
            {p.image && (
              <div style={{ height: '120px', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <img src={p.image} alt={p.product_name || p.name || 'Product'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>
              {p.product_name || p.name || 'Product'}
            </div>
            <div style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {p.brand || '—'} • {p.category || '—'}
            </div>
            <div style={{ color: isDark ? '#10b981' : '#059669', fontWeight: 700, marginTop: '0.5rem' }}>
              {p.selling_price ? `₹${Number(p.selling_price).toLocaleString()}` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartRecommendations;
