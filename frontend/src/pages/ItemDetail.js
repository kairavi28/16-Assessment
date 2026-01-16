import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchItem = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/items/${id}`, { signal });
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Item not found');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setItem(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div className="detail-container" aria-busy="true">
        <div className="skeleton-row" style={{ marginBottom: '1rem' }}>
          <div className="skeleton" style={{ width: '100px', height: '20px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '60%', height: '32px', marginBottom: '1.5rem' }}></div>
        <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '0.5rem' }}></div>
        <div className="skeleton" style={{ width: '30%', height: '20px' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-container error-container" role="alert">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="retry-btn">
          Back to Items
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="detail-container">
        <p>Item not found</p>
        <Link to="/" className="back-link">Back to Items</Link>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <Link to="/" className="back-link" aria-label="Go back to items list">
        ← Back to Items
      </Link>
      
      <header className="detail-header">
        <h1>{item.name}</h1>
      </header>
      
      <div className="detail-info">
        <div className="detail-row">
          <span className="detail-label">Category:</span>
          <span className="detail-value">{item.category || 'Uncategorized'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Price:</span>
          <span className="detail-value detail-price">
            ${item.price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
