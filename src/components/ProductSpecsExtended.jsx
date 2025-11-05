import React, { useState } from 'react';

const ProductSpecsExtended = ({ product, extractFields }) => {
  const [open, setOpen] = useState(false);
  if (!product) return null;
  const fields = extractFields ? extractFields(product) : [];
  if (!fields || fields.length === 0) return null;

  const extra = fields.slice(12, 28); // show beyond the first 12 already on card
  if (extra.length === 0) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.35)',
          color: '#93c5fd',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        {open ? 'Show less' : 'Show more specs'}
      </button>
      {open && (
        <div style={{
          marginTop: '0.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.5rem',
          transition: 'all 200ms ease-out'
        }}>
          {extra.map((field, idx) => (
            <div key={idx} style={{
              padding: '0.6rem',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{field.key}</div>
              <div style={{ fontSize: '0.85rem', color: '#e5e7eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={String(field.value)}>
                {String(field.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductSpecsExtended;
