function getApiBase() {
  const envBase = process.env.NEXT_PUBLIC_API_URL;
  if (!envBase) return '/api';

  const trimmed = envBase.replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) return trimmed;
  return `${trimmed}/api`;
}

const API_BASE = getApiBase();

async function fetcher(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data;
  const textRaw = await response.text();
  try {
    data = JSON.parse(textRaw);
  } catch (err) {
    if (response.status === 500) {
      throw new Error(`Server Error (500): The backend crashed. Did you restart the server after updating .env?`);
    }
    throw new Error(`API returned non-JSON response: ${textRaw.substring(0, 100)}`);
  }

  if (!response.ok) {
    // Return custom error object instead of explicitly throwing unhandled exceptions to UI
    return { error: data.error || 'API Request Failed', status: response.status };
  }

  return data;
}

export const api = {
  get: (endpoint) => fetcher(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetcher(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetcher(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetcher(endpoint, { method: 'DELETE' }),
};
