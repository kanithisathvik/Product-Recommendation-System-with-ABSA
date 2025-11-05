import React from 'react';
import { useIntentPrediction } from '../hooks/useIntentPrediction';

const PromptAssistBar = ({ prompt, onApply }) => {
  const { suggestions } = useIntentPrediction(prompt);
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div style={{
      marginTop: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    }}>
      {suggestions.map(s => (
        <button
          key={s}
          type="button"
          onClick={(e) => { e.stopPropagation(); onApply && onApply(s); }}
          style={{
            padding: '0.35rem 0.7rem',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#34d399',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + {s}
        </button>
      ))}
    </div>
  );
};

export default PromptAssistBar;
