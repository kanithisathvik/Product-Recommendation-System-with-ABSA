/**
 * AspectFilterModal Component
 * 
 * Modal dialog for users to input aspects and apply sentiment-based filtering
 * Features:
 * - Comma-separated aspect input
 * - Category filter (optional)
 * - Loading state during analysis
 * - Error handling
 */

import React, { useState } from 'react';
import { X, Filter, Sparkles, AlertCircle } from 'lucide-react';

const AspectFilterModal = ({ isOpen, onClose, onApplyFilter, isLoading, extractedAspects = [] }) => {
  const [aspects, setAspects] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState('');

  // Update aspects input when extractedAspects changes
  React.useEffect(() => {
    if (extractedAspects.length > 0 && isOpen) {
      // Pre-fill with extracted aspects from search query
      setAspects(extractedAspects.join(', '));
    }
  }, [extractedAspects, isOpen]);

  // Predefined aspect suggestions
  const aspectSuggestions = [
    'battery life',
    'display',
    'performance',
    'build quality',
    'keyboard',
    'speakers',
    'trackpad',
    'cooling'
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'ultrabook', label: 'Ultrabook' },
    { value: 'professional', label: 'Professional' },
    { value: 'business', label: 'Business' },
    { value: 'budget', label: 'Budget' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate input
    if (!aspects.trim()) {
      setError('Please enter at least one aspect to analyze');
      return;
    }

    // Parse aspects from comma-separated string
    const aspectList = aspects
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0);

    if (aspectList.length === 0) {
      setError('Please enter valid aspects');
      return;
    }

    // Call parent handler
    onApplyFilter({
      aspects: aspectList,
      category: category
    });
  };

  const handleAddSuggestion = (suggestion) => {
    if (aspects.includes(suggestion)) return;
    
    setAspects(prev => {
      if (prev.trim() === '') return suggestion;
      return prev + ', ' + suggestion;
    });
  };

  const handleClear = () => {
    setAspects('');
    setCategory('all');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <Filter className="icon" />
            </div>
            <div>
              <h2 className="modal-title">Aspect-Based Sentiment Filter</h2>
              <p className="modal-subtitle">
                Analyze products based on specific aspects you care about
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Show message if aspects were detected from search query */}
          {extractedAspects.length > 0 && (
            <div className="info-banner" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Sparkles size={18} />
              <span>
                <strong>Auto-detected aspects from your search:</strong> {extractedAspects.join(', ')}
                <br />
                <small style={{ opacity: 0.9 }}>You can add more aspects below to analyze them together!</small>
              </span>
            </div>
          )}

          {/* Aspects Input */}
          <div className="form-group">
            <label htmlFor="aspects" className="form-label">
              <Sparkles className="label-icon" />
              Aspects to Analyze
            </label>
            <input
              id="aspects"
              type="text"
              className="form-input"
              placeholder="e.g., battery life, display, performance"
              value={aspects}
              onChange={(e) => setAspects(e.target.value)}
              disabled={isLoading}
            />
            <p className="form-help">
              Enter aspects separated by commas. {extractedAspects.length > 0 ? 'Add more aspects to combine with auto-detected ones.' : 'These are the features you want to analyze sentiment for.'}
            </p>
          </div>

          {/* Aspect Suggestions */}
          <div className="form-group">
            <label className="form-label">Quick Add Suggestions</label>
            <div className="suggestion-chips">
              {aspectSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className={`suggestion-chip ${aspects.includes(suggestion) ? 'active' : ''}`}
                  onClick={() => handleAddSuggestion(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Product Category (Optional)
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Box */}
          <div className="info-box">
            <div className="info-icon">💡</div>
            <div className="info-text">
              <strong>How it works:</strong> We'll analyze customer reviews to determine sentiment 
              (positive, negative, or neutral) for each aspect you specify. Products are then 
              ranked based on overall sentiment scores.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Filter className="btn-icon" />
                  <span>Apply Filter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AspectFilterModal;
