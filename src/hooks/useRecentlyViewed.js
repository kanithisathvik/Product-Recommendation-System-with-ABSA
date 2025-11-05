// Track recently viewed products in localStorage
// Stores last 8 viewed product IDs and a lightweight cache of product snapshots

import { useCallback, useEffect, useState } from 'react';

const IDS_KEY = 'recently_viewed_ids';
const CACHE_KEY = 'recently_viewed_cache';
const MAX_ITEMS = 8;

const readLS = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const writeLS = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

export const useRecentlyViewed = () => {
  const [ids, setIds] = useState(() => readLS(IDS_KEY, []));
  const [cache, setCache] = useState(() => readLS(CACHE_KEY, {}));

  useEffect(() => writeLS(IDS_KEY, ids), [ids]);
  useEffect(() => writeLS(CACHE_KEY, cache), [cache]);

  const addViewedProduct = useCallback((product) => {
    if (!product) return;
    const id = String(product.id ?? product._id ?? '');
    if (!id) return;

    setIds(prev => {
      const existing = prev.filter(x => x !== id);
      return [id, ...existing].slice(0, MAX_ITEMS);
    });

    // store a tiny snapshot for panel rendering without relying on searchResults
    setCache(prev => ({
      ...prev,
      [id]: {
        id,
  name: product['Product Name'] || product.product_name || product.name || product.title || `Product ${id}`,
        image: product.image || product.img || product.thumbnail || null,
        price: product.selling_price ?? product.price ?? null,
        rating: product.rating ?? null,
        category: product.category || null
      }
    }));
  }, []);

  const getRecentlyViewed = useCallback(() => ids, [ids]);

  const getRecentlyViewedProducts = useCallback(() => {
    return ids
      .map(id => cache[id])
      .filter(Boolean);
  }, [ids, cache]);

  const clearRecentlyViewed = useCallback(() => {
    setIds([]);
    setCache({});
  }, []);

  return {
    ids,
    addViewedProduct,
    getRecentlyViewed,
    getRecentlyViewedProducts,
    clearRecentlyViewed,
    MAX_ITEMS
  };
};

export default useRecentlyViewed;
