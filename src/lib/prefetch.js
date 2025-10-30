export const prefetchData = async (fetchFn) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = await fetchFn();
    return data;
  } catch {
    return null;
  }
};

export const createDataCache = () => {
  const cache = new Map();
  
  return {
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
    has: (key) => cache.has(key),
    clear: () => cache.clear(),
  };
};

export const dataCache = createDataCache();
