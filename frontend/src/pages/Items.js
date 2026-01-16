import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { List } from 'react-window';

function ItemRow({ index, style, items }) {
  const item = items?.[index];
  if (!item) return null;
  
  return (
    <div style={style} className="item-row" role="listitem">
      <Link 
        to={`/items/${item.id}`} 
        className="item-link"
        aria-label={`View details for ${item.name}`}
      >
        <span className="item-name">{item.name}</span>
        <span className="item-category">{item.category}</span>
        <span className="item-price">${item.price.toLocaleString()}</span>
      </Link>
    </div>
  );
}

function Items() {
  const { 
    items, 
    loading, 
    error, 
    pagination, 
    fetchItems, 
    cancelFetch, 
    goToPage, 
    search 
  } = useData();
  
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    fetchItems({ page: 1, limit: 20 });
    
    return () => {
      cancelFetch();
    };
  }, [fetchItems, cancelFetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      search(debouncedSearch);
    }
  }, [debouncedSearch, search]);

  const handleSearchChange = useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  const handlePrevPage = useCallback(() => {
    if (pagination.page > 1) {
      goToPage(pagination.page - 1);
    }
  }, [pagination.page, goToPage]);

  const handleNextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      goToPage(pagination.page + 1);
    }
  }, [pagination.page, pagination.totalPages, goToPage]);

  const listHeight = useMemo(() => {
    return Math.min(items.length * 60, 400);
  }, [items.length]);

  const rowProps = useMemo(() => ({ items }), [items]);

  if (error) {
    return (
      <div className="container error-container" role="alert">
        <h2>Error Loading Items</h2>
        <p>{error}</p>
        <button onClick={() => fetchItems()} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="items-header">
        <h1>Items</h1>
        <p className="items-count">
          {loading ? 'Loading...' : `${pagination.total} items found`}
        </p>
      </header>

      <div className="search-container">
        <label htmlFor="search-input" className="visually-hidden">
          Search items
        </label>
        <input
          id="search-input"
          type="search"
          placeholder="Search by name or category..."
          value={searchInput}
          onChange={handleSearchChange}
          className="search-input"
          aria-describedby="search-help"
        />
        <span id="search-help" className="visually-hidden">
          Search updates automatically as you type
        </span>
      </div>

      {loading && items.length === 0 ? (
        <div className="skeleton-container" aria-busy="true" aria-live="polite">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row" aria-hidden="true">
              <div className="skeleton skeleton-name"></div>
              <div className="skeleton skeleton-category"></div>
              <div className="skeleton skeleton-price"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state" role="status">
          <p>No items found. Try a different search term.</p>
        </div>
      ) : (
        <div className="items-list" role="list" aria-label="Items list" style={{ height: listHeight }}>
          <List
            rowCount={items.length}
            rowHeight={60}
            style={{ width: '100%', height: '100%' }}
            rowComponent={ItemRow}
            rowProps={rowProps}
          />
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Items pagination">
          <button
            onClick={handlePrevPage}
            disabled={pagination.page <= 1 || loading}
            className="pagination-btn"
            aria-label="Go to previous page"
          >
            Previous
          </button>
          <span className="pagination-info" aria-current="page">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="pagination-btn"
            aria-label="Go to next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}

export default Items;
