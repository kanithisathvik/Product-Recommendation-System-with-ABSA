// Heuristic product tag generator with caching

const TAG_CACHE_PREFIX = 'product_tags:';

const readLS = (key) => {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const writeLS = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

export function generateProductTags(product) {
  if (!product) return [];
  const id = String(product.id ?? product._id ?? '');
  if (id) {
    const cached = readLS(TAG_CACHE_PREFIX + id);
    if (cached && Array.isArray(cached)) return cached;
  }

  const tags = new Set();

  const price = Number(product.selling_price ?? product.price ?? 0) || 0;
  const weight = String(product.weight || '').toLowerCase();
  const form = String(product.form_factor || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();
  const gpu = String(product.graphics_coprocessor || '').toLowerCase();
  const ram = Number(product.ram_gb || 0);
  const screen = String(product.standing_screen_display_size || '').toLowerCase();
  const sentiments = product.sentiments || {};

  // Price-based
  if (price && price < 60000) tags.add('Budget');
  if (price && price >= 150000) tags.add('Premium');

  // Category/spec-based
  if (category.includes('gaming') || gpu.includes('rtx')) tags.add('Gaming');
  if (form.includes('ultra') || category.includes('ultra') || weight.includes('kg') || weight.includes('light')) tags.add('Lightweight');
  if (ram >= 16) tags.add('Multitasking');
  if (screen.includes('15') || screen.includes('17')) tags.add('Large Display');
  if (screen.includes('13') || screen.includes('14')) tags.add('Portable');

  // Sentiment-based hints
  const pos = (aspect) => (sentiments[aspect]?.positive || 0) > (sentiments[aspect]?.negative || 0);
  if (pos('battery life')) tags.add('Long Battery');
  if (pos('display')) tags.add('Great Display');
  if (pos('performance')) tags.add('High Performance');
  if (pos('build quality')) tags.add('Durable');

  const out = Array.from(tags).slice(0, 6);
  if (id) writeLS(TAG_CACHE_PREFIX + id, out);
  return out;
}

export default generateProductTags;
