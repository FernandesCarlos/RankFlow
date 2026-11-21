import messaging, { AuthorizationStatus } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getStoredToken } from './auth';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const FCM_TOKEN_KEY = '@rankflow:fcm-token:v1';

async function saveTokenOnBackend(token: string): Promise<void> {
  const authToken = await getStoredToken();
  if (!authToken) throw new Error('Entre na sua conta para ativar as notificações.');

  const response = await fetch(\`\${API_BASE_URL}/api/push/register\`, {
    method: 'POST',
    headers: {
      Authorization: \`Bearer \${authToken}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, platform: Platform.OS }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível registrar este dispositivo.');
  }

  await SecureStore.setItemAsync(FCM_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function requestNotificationPermission(): Promise<void> {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Permitir notificações',
          message: 'O RankFlow precisa enviar lembretes dos seus treinos agendados.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Agora não',
        },
      );
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Permissão de notificações negada. Você pode habilitá-la nos Ajustes do dispositivo.');
      }
    }
    return;
  }

  if (Platform.OS !== 'ios') {
    throw new Error('Notificações push estão disponíveis somente no Android e iOS.');
  }

  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }

  const authorization = await messaging().requestPermission();
  const enabled =
    authorization === AuthorizationStatus.AUTHORIZED ||
    authorization === AuthorizationStatus.PROVISIONAL;
  if (!enabled) {
    throw new Error('Permissão de notificações negada. Você pode habilitá-la nos Ajustes do dispositivo.');
  }
}

export async function registerPushNotifications(): Promise<void> {
  await requestNotificationPermission();

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
  let fcmToken = await SecureStore.getItemAsync(FCM_TOKEN_KEY);

  // Recupera o token caso a instalação tenha sido registrada antes da persistência segura.
  if (!fcmToken) {
    try {
      fcmToken = await messaging().getToken();
    } catch {
      fcmToken = null;
    }
  }

  if (authToken && fcmToken) {
    const response = await fetch(\`\${API_BASE_URL}/api/push/register\`, {
      method: 'DELETE',
      headers: {
        Authorization: \`Bearer \${authToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: fcmToken }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(typeof payload?.detail === 'string' ? payload.detail : 'Não foi possível remover o registro deste dispositivo.');
    }
  }

  await messaging().deleteToken();
  await SecureStore.deleteItemAsync(FCM_TOKEN_KEY);
}
