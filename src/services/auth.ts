import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const TOKEN_KEY = '@rankflow:access-token:v1';

export type AuthUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  codeforces_handle: string | null;
  avatar_url: string | null;
  rating: number | null;
};

type AuthResponse = {
  access_token: string;
  token_type: 'bearer';
  user: AuthUser;
};

async function authRequest(path: string, body: Record<string, string>): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(`Não foi possível conectar ao RankFlow API em ${API_BASE_URL}.`);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível autenticar.');
  }
  const result = payload as AuthResponse;
  await AsyncStorage.setItem(TOKEN_KEY, result.access_token);
  return result;
}

export function registerAccount(input: { name: string; email: string; password: string }) {
  return authRequest('/api/auth/register', input);
}

export function loginAccount(input: { email: string; password: string }) {
  return authRequest('/api/auth/login', input);
}

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearAuthToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Sessão expirada.');
  }
  return payload as AuthUser;
}
