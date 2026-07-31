import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Shared list fetch + toast helper for CRUD pages.
 */
export function useEntityList({ endpoint, dataKey, initialParams = {} }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async (params = {}) => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams({ ...initialParams, ...params }).toString();
      const url = query ? `${endpoint}?${query}` : endpoint;
      const { data } = await api.get(url);
      const payload = data.data?.[dataKey] ?? data.data ?? data[dataKey] ?? [];
      setItems(Array.isArray(payload) ? payload : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, dataKey, initialParams]);

  return { items, setItems, loading, error, fetchItems };
}
