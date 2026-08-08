import { useState, useEffect, useCallback, useRef } from "react";
import { getItem, setItem } from "@/services/storage";

// Hook generik: baca sekali dari storage saat mount, simpan balik (debounced)
// setiap kali value berubah lewat setValue.
export function usePersistedState(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const stored = await getItem(key, fallback);
      if (mounted) {
        setValue(stored);
        setLoaded(true);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const persist = useCallback(
    (next) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setItem(key, next);
      }, 150);
    },
    [key]
  );

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        persist(resolved);
        return resolved;
      });
    },
    [persist]
  );

  return [value, update, loaded];
}
