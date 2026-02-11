import { getAccessToken, getRefreshToken, saveAuthTokens, clearAuthTokens, TokenResponse } from './utils/auth';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Flag to prevent infinite loop when refreshing token
let isRefreshing = false;
let refreshPromise: Promise<TokenResponse | null> | null = null;

/**
 * Refresh access token using refresh token
 * This function uses raw fetch to avoid circular dependency with apiFetch
 * Exported for use in useRefreshToken hook
 */
export async function refreshAccessTokenInternal(): Promise<TokenResponse | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        clearAuthTokens();
        return null;
      }

      const base = process.env.NEXT_PUBLIC_API_URL;
      const version = process.env.NEXT_PUBLIC_API_VERSION;
      const url = `${base}/${version}/auth/refresh`;

      let response: Response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            refresh_token: refreshTokenValue,
          }),
        });
      } catch (error) {
        // Handle network errors (e.g., "Failed to fetch")
        // Log error for debugging but don't expose to user
        console.error('Network error during token refresh:', error);
        clearAuthTokens();
        return null;
      }

      if (response.status === 403) {
        clearAuthTokens();
        redirectToLoginIfNeeded();
        throw new ApiError('Access forbidden. Your account may have been deactivated.', 403, null);
      }

      if (!response.ok) {
        clearAuthTokens();
        return null;
      }

      const data = await response.json();
      // Handle both direct response and nested data response
      const responseData = data.data || data;
      const tokenResponse: TokenResponse = {
        access_token: responseData.access_token,
        token_type: responseData.token_type || 'Bearer',
        expires_in: responseData.expires_in || 3600,
        refresh_token: responseData.refresh_token,
        user: responseData.user,
      };

      saveAuthTokens(tokenResponse);
      return tokenResponse;
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        throw error;
      }
      clearAuthTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Redirect to login page if not already on it
 */
function redirectToLoginIfNeeded() {
  if (globalThis.window === undefined) return;
  const pathname = globalThis.window.location.pathname;
  // If already on the login page, do not redirect again to avoid a redirect loop
  if (pathname === '/login') return;
  globalThis.window.location.href = '/login';
}

function hasContentTypeHeader(headers?: HeadersInit): boolean {
  if (!headers) return false;

  if (headers instanceof Headers) {
    return headers.has('Content-Type');
  }

  if (Array.isArray(headers)) {
    return headers.some(([key]) => key.toLowerCase() === 'content-type');
  }

  return 'Content-Type' in headers || 'content-type' in headers;
}

function mergeHeaders(initHeaders?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!initHeaders) return headers;

  if (initHeaders instanceof Headers) {
    for (const [key, value] of initHeaders.entries()) {
      headers[key] = value;
    }
  } else if (Array.isArray(initHeaders)) {
    for (const [key, value] of initHeaders) {
      headers[key] = value;
    }
  } else {
    Object.assign(headers, initHeaders);
  }

  return headers;
}

function buildRequestHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {};
  const isFormData = init?.body instanceof FormData;

  // Add Authorization header
  const accessToken = getAccessToken();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Add Content-Type if needed
  if (!isFormData && !hasContentTypeHeader(init?.headers)) {
    headers['Content-Type'] = 'application/json';
  }

  // Merge existing headers
  const mergedHeaders = mergeHeaders(init?.headers);
  Object.assign(headers, mergedHeaders);

  return headers;
}

// Helper function to extract error data from response
async function extractErrorData(res: Response): Promise<{ errorData: unknown; errorMessage: string }> {
  let errorData: unknown;
  const contentType = res.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      errorData = await res.json();
    } else {
      const text = await res.text();
      errorData = text || `HTTP ${res.status}`;
    }
  } catch (error) {
    // If reading response fails, use status code as error data
    console.error('Error reading error response:', error);
    errorData = `HTTP ${res.status}`;
  }

  const errorMessage =
    (errorData as { detail?: string })?.detail ||
    (errorData as { message?: string })?.message ||
    (typeof errorData === 'string' ? errorData : `HTTP ${res.status}`);

  return { errorData, errorMessage };
}

// Helper function to handle 401 errors
async function handle401Error(res: Response, input: string, init?: RequestInit, isRetry = false): Promise<Response> {
  if (isRetry || input.includes('/auth/refresh')) {
    clearAuthTokens();
    redirectToLoginIfNeeded();
    const { errorData, errorMessage } = await extractErrorData(res);
    throw new ApiError(errorMessage, res.status, errorData);
  }

  try {
    const tokenResponse = await refreshAccessTokenInternal();
    if (tokenResponse) {
      return fetchWithAuth(input, init, true);
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw error;
    }
    clearAuthTokens();
    redirectToLoginIfNeeded();
    const { errorData, errorMessage } = await extractErrorData(res);
    throw new ApiError(errorMessage, res.status, errorData);
  }

  clearAuthTokens();
  redirectToLoginIfNeeded();
  const { errorData, errorMessage } = await extractErrorData(res);
  throw new ApiError(errorMessage, res.status, errorData);
}

async function handle403Error(res: Response, input: string): Promise<Response> {
  clearAuthTokens();
  redirectToLoginIfNeeded();
  const { errorData, errorMessage } = await extractErrorData(res);
  throw new ApiError(errorMessage || 'Access forbidden. Your account may have been deactivated.', res.status, errorData);
}

function handleNetworkError(error: unknown): never {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  if (errorMessage === 'Failed to fetch' || errorMessage.toLowerCase().includes('failed to fetch')) {
    throw new ApiError('Server connection failed', 0, null);
  }
  throw new ApiError(errorMessage, 0, null);
}

/**
 * Internal helper function to handle authentication and fetch
 * Returns the Response object for further processing
 *
 * Auth model:
 * - Tokens are stored in localStorage (for cross-origin support)
 * - FE sends token via Authorization header
 * - If backend returns 401, automatically refresh token and retry request
 * - If refresh fails, clear tokens and throw error (callers should redirect to /login)
 */
async function fetchWithAuth(input: string, init?: RequestInit, isRetry = false): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const version = process.env.NEXT_PUBLIC_API_VERSION;
  const url = `${base}/${version}${input}`;

  const headers = buildRequestHeaders(init);

  // Send request with Authorization header
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });
  } catch (error) {
    handleNetworkError(error);
    // This line will never be reached, but TypeScript needs it
    throw error;
  }

  // Handle 401 Unauthorized
  if (res.status === 401) {
    return handle401Error(res, input, init, isRetry);
  }

  if (res.status === 403) {
    return handle403Error(res, input);
  }

  // Handle other error statuses
  if (!res.ok) {
    const { errorData, errorMessage } = await extractErrorData(res);
    throw new ApiError(errorMessage, res.status, errorData);
  }

  return res;
}

/**
 * Fetch API with authentication and error handling, returns JSON
 * Use this for standard JSON API responses
 */
export async function apiFetch<T = unknown>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(input, init);

  // Check content-type before parsing JSON
  const contentType = res.headers.get('content-type');

  try {
    if (contentType?.includes('application/json')) {
      return await res.json();
    } else {
      // If not JSON, read as text first
      const text = await res.text();
      // Try to parse as JSON if it looks like JSON
      if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
          return JSON.parse(text) as T;
        } catch (error) {
          // If JSON parsing fails, return text as string (cast to T)
          console.error('Error parsing JSON response:', error);
          return text as unknown as T;
        }
      }
      // Otherwise return as string (cast to T)
      return text as unknown as T;
    }
  } catch (error) {
    // If reading response fails, throw a more descriptive error
    throw new ApiError(`Failed to read response: ${error instanceof Error ? error.message : 'Unknown error'}`, res.status, null);
  }
}

/**
 * Fetch API with authentication and error handling, returns Response for blob handling
 * Use this for file downloads or other non-JSON responses
 */
export async function apiFetchBlob(input: string, init?: RequestInit): Promise<Response> {
  return fetchWithAuth(input, init);
}
