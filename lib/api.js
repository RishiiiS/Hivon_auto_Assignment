import { getToken, removeToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetcher(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // If token is expired or unauthorized globally, you might trigger a logout here
    if (response.status === 401) {
      removeToken();
      // Optionally trigger redirect to login event
    }
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}

export const api = {
  get: (endpoint) => fetcher(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetcher(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetcher(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetcher(endpoint, { method: 'DELETE' }),
};
