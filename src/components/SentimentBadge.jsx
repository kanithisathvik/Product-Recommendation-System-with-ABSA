/**
 * SentimentBadge Component
 * 
 * Displays sentiment for a specific aspect as a colored pill badge
 * Supports: positive, negative, neutral sentiments
 */

import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

const SentimentBadge = ({ aspect, sentiment }) => {
  const getSentimentConfig = () => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return {
          icon: ThumbsUp,
          className: 'sentiment-badge positive',
          label: 'Positive'
        };
      case 'negative':
        return {
          icon: ThumbsDown,
          className: 'sentiment-badge negative',
          label: 'Negative'
        };
      case 'neutral':
      default:
        return {
          icon: Minus,
          className: 'sentiment-badge neutral',
          label: 'Neutral'
        };
    }
  };

  const config = getSentimentConfig();
  const Icon = config.icon;

  return (
    <div className={config.className}>
      <Icon className="sentiment-icon" size={14} />
      <span className="sentiment-aspect">{aspect}</span>
      <span className="sentiment-label">{config.label}</span>
    </div>
  );
};

/**
 * SentimentBadgeList Component
 * 
 * Displays a list of sentiment badges for multiple aspects
 */
export const SentimentBadgeList = ({ sentiments }) => {
  if (!sentiments || Object.keys(sentiments).length === 0) {
    return null;
  }

  return (
    <div className="sentiment-badge-list">
      {Object.entries(sentiments).map(([aspect, sentiment]) => (
        <SentimentBadge
          key={aspect}
          aspect={aspect}
          sentiment={sentiment}
        />
      ))}
    </div>
  );
};

export default SentimentBadge;
