import React, { createContext, useCallback, useContext, useState, useRef } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const abortControllerRef = useRef(null);

  const fetchItems = useCallback(async (options = {}) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    const {
      page = pagination.page,
      limit = pagination.limit,
      q = searchQuery
    } = options;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (q) params.append('q', q);

      const res = await fetch(`${API_BASE}/api/items?${params}`, { signal });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      
      setItems(json.items || []);
      setPagination({
        page: json.page || 1,
        limit: json.limit || limit,
        total: json.total || 0,
        totalPages: json.totalPages || 0
      });
      setSearchQuery(q);
      
      return json;
    } catch (err) {
      if (err.name === 'AbortError') {
        return null;
      }
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  const cancelFetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const goToPage = useCallback((page) => {
    return fetchItems({ page });
  }, [fetchItems]);

  const search = useCallback((query) => {
    return fetchItems({ q: query, page: 1 });
  }, [fetchItems]);

  const value = {
    items,
    loading,
    error,
    pagination,
    searchQuery,
    fetchItems,
    cancelFetch,
    goToPage,
    search
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
