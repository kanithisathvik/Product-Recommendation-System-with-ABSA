import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const RatingBreakdownModal = ({ distribution, onClose }) => {
  if (!distribution) return null;
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: '640px', background: 'rgba(17,24,39,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ color: 'white', fontWeight: 800 }}>Rating Breakdown</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#e5e7eb', cursor: 'pointer' }}><X /></button>
        </div>
        <div style={{ padding: '1rem' }}>
          {Object.entries(distribution).sort((a,b)=> Number(b[0]) - Number(a[0])).map(([stars, count]) => (
            <div key={stars} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ width: '60px', color: '#facc15', fontWeight: 700 }}>{stars}★</div>
              <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${(Number(count)||0) * 6}%`, height: '100%', background: '#facc15' }} />
              </div>
              <div style={{ width: '60px', color: '#9ca3af', textAlign: 'right' }}>{count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RatingBreakdownModal;
