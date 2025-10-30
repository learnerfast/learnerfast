import { useState, useEffect } from 'react';

export function useOptimisticData(fetchFn, initialData = null) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);

  useEffect(() => {
    let mounted = true;
    
    fetchFn().then(result => {
      if (mounted) {
        setData(result);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, []);

  return { data, isLoading, setData };
}
