const DEFAULT_API_ORIGIN = "https://digisky.onrender.com";

const configuredOrigin = import.meta.env.VITE_API_URL;

const API_ORIGIN = (configuredOrigin || DEFAULT_API_ORIGIN).replace(/\/+$/, "");
const API = API_ORIGIN.endsWith("/api") ? API_ORIGIN : `${API_ORIGIN}/api`;
const REQUEST_TIMEOUT_MS = 15000;

export class ApiClientError extends Error {
  constructor(message, { status = 0, data = null, code = "API_ERROR" } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

function friendlyStatusMessage(status, fallback = "Request failed") {
  if (status === 400) return fallback;
  if (status === 401) return fallback === "Request failed" ? "Invalid credentials" : fallback;
  if (status === 403) return "You do not have permission for this action.";
  if (status === 404) return "Requested API endpoint was not found.";
  if (status === 408) return "Server took too long to respond.";
  if (status === 429) return "Too many requests. Please wait and try again.";
  if (status >= 500) return "Server unavailable. Please try again shortly.";
  return fallback;
}

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiClientError("Server returned an invalid response.", {
      status: res.status,
      code: "INVALID_JSON",
    });
  }
}

export async function apiRequest(path, { method = "GET", body, token, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const res = await fetch(url, {
      method,
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await parseResponse(res);

    if (!res.ok || data?.success === false) {
      const message = data?.message || friendlyStatusMessage(res.status);
      throw new ApiClientError(friendlyStatusMessage(res.status, message), {
        status: res.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiClientError("Server unavailable. Please try again shortly.", {
        status: 408,
        code: "TIMEOUT",
      });
    }
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError("Server unavailable. Please check your connection and try again.", {
      code: "NETWORK_ERROR",
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export const getJson = (path, token) => apiRequest(path, { token });
export const postJson = (path, data, token) => apiRequest(path, { method: "POST", body: data, token });
export const sendJson = (path, method, data, token) => apiRequest(path, { method, body: data, token });
export const deleteJson = (path, token) => apiRequest(path, { method: "DELETE", token });

export default API;
