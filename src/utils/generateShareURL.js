export const generateShareURL = ({ product, filters = {} }) => {
  const base = window?.location?.origin || '';
  if (product) {
    const id = encodeURIComponent(String(product.id ?? product._id ?? ''));
    return `${base}/product/${id}`;
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k,v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') params.set(k, String(v));
  });
  return `${base}/?${params.toString()}`;
};

export default generateShareURL;
