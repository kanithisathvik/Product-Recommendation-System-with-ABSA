import React, { useMemo } from 'react';
import generateProductTags from '../utils/generateProductTags';

const pill = {
  padding: '0.25rem 0.6rem',
  background: 'rgba(168,85,247,0.15)',
  border: '1px solid rgba(168,85,247,0.35)',
  color: '#c084fc',
  fontSize: '0.75rem',
  borderRadius: '999px',
  cursor: 'pointer',
  userSelect: 'none'
};

const ProductTags = ({ product, onTagClick }) => {
  const tags = useMemo(() => generateProductTags(product), [product]);
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
      {tags.map(tag => (
        <button
          key={tag}
          type="button"
          style={pill}
          onClick={(e) => { e.stopPropagation(); onTagClick && onTagClick(tag); }}
          aria-label={`filter by ${tag}`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

export default ProductTags;
