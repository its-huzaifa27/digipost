export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Standard fetch wrapper that automatically includes credentials (cookies)
 * and handles common error parsing.
 *
 * @param {string} endpoint - The API endpoint (e.g., '/api/dashboard')
 * @param {object} options - Fetch options (method, headers, body)
 */
export const apiFetch = async (endpoint, options = {}) => {
  // Ensure credentials are included for Cookie support
  const defaultOptions = {
    headers: {
      // Only set Content-Type to JSON if body is NOT FormData
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      // Add Authorization header if token exists
      ...(localStorage.getItem('token')
        ? { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        : {})
    },
    credentials: "include", // Important for HttpOnly cookies
  };

  const url = `${API_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const response = await fetch(url, { ...defaultOptions, ...options });

  // Attempt to parse JSON
  let data;
  try {
    data = await response.json();
  } catch (e) {
    // If response is OK but not JSON (e.g. 204), data is null
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || `API Error: ${response.statusText}`);
  }

  return data;
};
