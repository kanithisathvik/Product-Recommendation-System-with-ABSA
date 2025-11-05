import React from 'react';
import { Share2 } from 'lucide-react';
import generateShareURL from '../utils/generateShareURL';
import { useTheme } from '../context/ThemeContext';

const ShareProductButton = ({ product, filters }) => {
  if (!product && !filters) return null;
  const url = generateShareURL({ product, filters });
  const { isDark } = useTheme();

  const handleShare = async (e) => {
    e?.stopPropagation?.();
    const title = product?.product_name || product?.name || 'Product';
    const text = 'Check this out';
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {}

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
      return;
    } catch {}

    // As final fallback, open new tab (twitter intent as example)
    const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweet, '_blank');
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Share"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px', height: '36px',
        borderRadius: '0.5rem',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.06)',
        border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(17,24,39,0.08)',
        color: isDark ? '#e5e7eb' : '#111827',
        cursor: 'pointer'
      }}
    >
      <Share2 size={16} />
    </button>
  );
};

export default ShareProductButton;
