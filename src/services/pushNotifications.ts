import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { getStoredToken } from './auth';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function saveTokenOnBackend(token: string): Promise<void> {
  const authToken = await getStoredToken();
  if (!authToken) throw new Error('Entre na sua conta para ativar as notificações.');

  const response = await fetch(`${API_BASE_URL}/api/push/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, platform: Platform.OS }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível registrar este dispositivo.');
  }
}

export async function registerPushNotifications(): Promise<void> {
  const authorization = await messaging().requestPermission();
  const enabled =
    authorization === AuthorizationStatus.AUTHORIZED ||
    authorization === AuthorizationStatus.PROVISIONAL;
  if (!enabled) {
    throw new Error('Permissão de notificações negada. Você pode habilitá-la nos Ajustes do dispositivo.');
  }

  if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }

  const token = await messaging().getToken();
  if (!token) throw new Error('O Firebase não forneceu um token para este dispositivo.');
  await saveTokenOnBackend(token);
}

export function listenForPushTokenRefresh(): () => void {
  return messaging().onTokenRefresh((token) => {
    saveTokenOnBackend(token).catch((error) => {
      console.warn('Não foi possível atualizar o token FCM no backend:', error);
    });
  });
}

export async function unregisterPushNotifications(): Promise<void> {
  const authToken = await getStoredToken();
  if (authToken) {
    const response = await fetch(`${API_BASE_URL}/api/push/register`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) throw new Error('Não foi possível remover o registro do dispositivo no servidor.');
  }
  await messaging().deleteToken();
}
