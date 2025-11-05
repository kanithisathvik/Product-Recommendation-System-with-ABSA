// Lightweight recommendations using current results as a source

export async function getRecommendations({ baseProducts = [], allProducts = [] }) {
  // If no baseProducts, just return top by rating or sentiment
  const pool = Array.isArray(allProducts) ? allProducts : [];
  if (pool.length === 0) return [];

  if (!baseProducts || baseProducts.length === 0) {
    return pool
      .slice()
      .sort((a,b) => (Number(b.sentimentScore||0) - Number(a.sentimentScore||0)) || (Number(b.rating||0) - Number(a.rating||0)))
      .slice(0, 10);
  }

  const categories = new Set(baseProducts.map(p => String(p.category||'').toLowerCase()).filter(Boolean));
  const brands = new Set(baseProducts.map(p => String(p.brand||'').toLowerCase()).filter(Boolean));

  // score candidates by shared category/brand and closeness of price/rating
  const score = (p) => {
    let s = 0;
    if (categories.size && categories.has(String(p.category||'').toLowerCase())) s += 3;
    if (brands.size && brands.has(String(p.brand||'').toLowerCase())) s += 2;
    s += Math.min(Number(p.sentimentScore||0)/25, 3); // up to +3
    s += Math.min(Number(p.rating||0), 5)/2; // up to +2.5
    return s;
  };

  const excludeIds = new Set(baseProducts.map(p => String(p.id)));
  return pool
    .filter(p => !excludeIds.has(String(p.id)))
    .slice()
    .sort((a,b) => score(b)-score(a))
    .slice(0, 10);
}

export default getRecommendations;
