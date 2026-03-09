export function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function lsGet<T>(key: string): T | null {
  return safeJsonParse<T>(localStorage.getItem(key));
}

export function lsSet<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
