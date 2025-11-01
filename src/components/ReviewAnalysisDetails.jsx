/**
 * ReviewAnalysisDetails Component
 * 
 * Displays detailed information about review analysis for a product
 * Uses map function to iterate and display all review results
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const ReviewAnalysisDetails = ({ product }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!product.reviewResults || product.reviewResults.length === 0) {
    return null;
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <ThumbsUp size={14} style={{ color: '#34d399' }} />;
      case 'negative':
        return <ThumbsDown size={14} style={{ color: '#fca5a5' }} />;
      default:
        return <Minus size={14} style={{ color: '#d1d5db' }} />;
    }
  };

  return (
    <div style={{
      marginTop: '1rem',
      padding: '1rem',
      background: 'rgba(17, 24, 39, 0.5)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          color: '#d1d5db',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={16} style={{ color: '#a855f7' }} />
          <span>Review-by-Review Analysis ({product.reviewResults.length} reviews)</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div style={{ marginTop: '1rem' }}>
          {/* Use map to iterate through all review results */}
          {product.reviewResults.map((reviewResult, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                background: 'rgba(31, 41, 55, 0.4)',
                borderRadius: '0.5rem',
                marginBottom: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginBottom: '0.5rem',
                fontWeight: 600
              }}>
                Review #{reviewResult.reviewIndex + 1}
              </div>
              
              <div style={{
                fontSize: '0.875rem',
                color: '#d1d5db',
                marginBottom: '0.75rem',
                lineHeight: 1.5
              }}>
                "{reviewResult.reviewText}"
              </div>

              {reviewResult.error ? (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#fca5a5',
                  fontStyle: 'italic'
                }}>
                  ⚠ Analysis failed: {reviewResult.error}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {/* Use map to display sentiment for each aspect */}
                  {Object.entries(reviewResult.sentiments || {}).map(([aspect, sentiment]) => (
                    <div
                      key={aspect}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.5rem',
                        background: 'rgba(55, 65, 81, 0.5)',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        color: '#d1d5db'
                      }}
                    >
                      {getSentimentIcon(sentiment)}
                      <span style={{ textTransform: 'capitalize' }}>{aspect}</span>
                      <span style={{ 
                        color: sentiment === 'positive' ? '#34d399' : 
                               sentiment === 'negative' ? '#fca5a5' : '#9ca3af'
                      }}>
                        {sentiment}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Summary using map to calculate stats */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: '#60a5fa',
              fontWeight: 600,
              marginBottom: '0.5rem'
            }}>
              Analysis Summary
            </div>
            <div style={{ fontSize: '0.75rem', color: '#d1d5db' }}>
              {product.reviewsAnalyzed} reviews successfully analyzed via Hugging Face API
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewAnalysisDetails;
