import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';

beforeEach(() => {
  global.fetch = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        items: [], 
        total: 0, 
        page: 1, 
        limit: 20, 
        totalPages: 0 
      }),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Items navigation link', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  const linkElement = screen.getByRole('link', { name: /items/i });
  expect(linkElement).toBeInTheDocument();
});

test('renders main app structure', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  
  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});
