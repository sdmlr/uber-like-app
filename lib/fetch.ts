import {useState, useEffect, useCallback} from "react";

import { Platform } from "react-native"; // ✅ Add this

export const useFetch = <T>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // 🧪 Guard: No fetch on web
    if (Platform.OS === "web") return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchAPI(url, options);
      setData(result.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (Platform.OS !== "web") fetchData(); // 🔁 Optional double safety
  }, [fetchData]);

  return {
    data: Platform.OS === "web" ? null : data,
    loading: Platform.OS === "web" ? false : loading,
    error: Platform.OS === "web" ? null : error,
    refetch: fetchData,
  };
};
