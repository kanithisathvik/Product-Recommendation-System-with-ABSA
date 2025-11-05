import React from 'react';

// Expects product.ratingDistribution as { 5: count, 4: count, ... } or similar
const RatingBreakdown = ({ distribution, onClick }) => {
  if (!distribution) return null;
  const total = Object.values(distribution).reduce((a,b) => a + (Number(b)||0), 0);
  if (!total) return null;

  const max = Math.max(...Object.values(distribution));

  return (
    <div onClick={(e) => { e.stopPropagation(); onClick && onClick(); }} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {[5,4,3,2,1].map(stars => {
        const count = Number(distribution[stars] || 0);
        const width = max ? (count / max) * 100 : 0;
        return (
          <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <div style={{ color: '#facc15', width: '20px', textAlign: 'right', fontSize: '0.75rem' }}>{stars}★</div>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${width}%`, height: '100%', background: '#facc15' }} />
            </div>
            <div style={{ color: '#9ca3af', fontSize: '0.75rem', width: '36px', textAlign: 'left' }}>{count}</div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingBreakdown;
