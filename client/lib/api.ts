export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export type SafeUser = { id: string; name: string; email: string; role: 'user' | 'admin'; createdAt?: string };
export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data as T;
}
