import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';
import './App.css';

function App() {
  return (
    <DataProvider>
      <div className="app">
        <nav className="navbar" role="navigation" aria-label="Main navigation">
          <Link to="/" className="nav-link">
            <span className="nav-icon" aria-hidden="true">📦</span>
            Items
          </Link>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

export default App;
