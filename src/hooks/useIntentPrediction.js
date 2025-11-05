import { useEffect, useMemo, useState } from 'react';

// Suggest filters based on the current prompt
export const useIntentPrediction = (prompt) => {
  const [suggestions, setSuggestions] = useState([]);

  const computed = useMemo(() => {
    if (!prompt || prompt.trim().length < 3) return [];
    const p = prompt.toLowerCase();
    const out = new Set();

    const addIf = (cond, tag) => { if (cond) out.add(tag); };
    addIf(/gaming|rtx|fps|aaa/.test(p), 'Gaming');
    addIf(/budget|cheap|affordable|under\s*\d+/.test(p), 'Budget');
    addIf(/light|thin|portable|ultra/.test(p), 'Lightweight');
    addIf(/battery|long\s*battery|hours/.test(p), 'Long Battery');
    addIf(/display|screen|color|4k|oled/.test(p), 'Great Display');
    addIf(/performance|fast|speed|i7|ryzen/.test(p), 'High Performance');
    addIf(/durable|build|aluminum|metal/.test(p), 'Durable');

    return Array.from(out).slice(0, 6);
  }, [prompt]);

  useEffect(() => { setSuggestions(computed); }, [computed]);

  return {
    suggestions,
  };
};

export default useIntentPrediction;
