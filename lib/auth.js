// Helper auth functions for dealing with localStorage JWT
const AUTH_CHANGED_EVENT = 'auth:changed';

export function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getDecodedUser() {
  const token = getToken();
  if (!token) return null;
  // A basic decode helper; real validation happens on the backend
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
