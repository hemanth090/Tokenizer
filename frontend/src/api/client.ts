const ENV_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_BASE = `${ENV_URL}/api`;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      errorText || `API Error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}
