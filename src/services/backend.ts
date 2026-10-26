const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export const backendEnabled = Boolean(API_BASE_URL);

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new Error('Backend não configurado.');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Falha na API (${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// Identificador demonstrativo; substituir por ID de usuário autenticado quando houver autenticação real.
export const userKey = (username: string) => encodeURIComponent(username.trim().toLowerCase());

export function getRemoteProfile(username: string) {
  return request<Record<string, unknown>>(`/api/users/${userKey(username)}/profile`);
}
export function saveRemoteProfile(username: string, profile: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/api/users/${userKey(username)}/profile`, {
    method: 'PUT', body: JSON.stringify(profile),
  });
}
export function getRemoteTrainings<T>(username: string) {
  return request<T[]>(`/api/users/${userKey(username)}/trainings`);
}
export function saveRemoteTraining<T extends { id: string }>(username: string, training: T) {
  return request<T>(`/api/users/${userKey(username)}/trainings`, {
    method: 'POST', body: JSON.stringify(training),
  });
}
export function deleteRemoteTraining(username: string, trainingId: string) {
  return request<void>(`/api/users/${userKey(username)}/trainings/${encodeURIComponent(trainingId)}`, {
    method: 'DELETE',
  });
}
