import { getStoredToken } from './auth';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\\/+$/, '');

export type PublicAccountProfile = {
  display_name: string | null;
  codeforces_handle: string | null;
  avatar_url: string | null;
  rating: number | null;
};

export async function uploadProfileAvatar(uri: string): Promise<{ avatar_url: string }> {
  const token = await getStoredToken();
  if (!token) throw new Error('Entre na sua conta para atualizar a foto do perfil.');

  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
  const form = new FormData();
  form.append('image', {
    uri,
    name: `rankflow-avatar.${extension === 'png' || extension === 'webp' ? extension : 'jpg'}`,
    type: mimeType,
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível enviar a foto.');
  }
  return payload as { avatar_url: string };
}

export async function getPublicAccountProfile(handle: string): Promise<PublicAccountProfile | null> {
  const response = await fetch(`${API_BASE_URL}/api/users/public/${encodeURIComponent(handle.trim())}`);
  if (response.status === 404) return null;
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível consultar o perfil público.');
  }
  return payload as PublicAccountProfile;
}

export async function updatePublicProfileVisibility(isPublic: boolean): Promise<void> {
  const token = await getStoredToken();
  if (!token) throw new Error('Entre na sua conta para alterar a privacidade do perfil.');
  const response = await fetch(`${API_BASE_URL}/api/users/me/profile-visibility`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_public: isPublic }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível atualizar a privacidade.');
  }
}
