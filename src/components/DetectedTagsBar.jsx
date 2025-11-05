import React from 'react';

// Shows tags detected from the user's prompt (extractedAspects/currentAspects)
// Optional onClick to re-apply a tag
const DetectedTagsBar = ({ tags = [], onClick }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div style={{
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap'
    }}>
      <span style={{ color: '#a855f7', fontWeight: 700, fontSize: '0.8rem' }}>Detected tags:</span>
      {tags.map((t) => (
        <button
          key={t}
          type="button"
          onClick={(e) => { e.stopPropagation(); onClick && onClick(t); }}
          style={{
            padding: '0.3rem 0.65rem',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            color: '#c084fc',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export default DetectedTagsBar;
