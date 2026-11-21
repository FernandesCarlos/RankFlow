import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../state/AppContext';
import { listenForPushTokenRefresh, registerPushNotifications } from '../services/pushNotifications';

function Navigation() {
  const { authenticated, notifications, setNotifications, setNotice } = useApp();
  const pushAllowed = notifications.allowed;

  useEffect(() => {
    if (!authenticated || !pushAllowed) return;
    let active = true;
    const unsubscribeTokenRefresh = listenForPushTokenRefresh();

    registerPushNotifications().catch((error) => {
      if (!active) return;
      setNotifications((current) => ({ ...current, allowed: false }));
      setNotice({
        message: error instanceof Error ? error.message : 'Não foi possível ativar as notificações push.',
        tone: 'danger',
      });
    });

    return () => {
      active = false;
      unsubscribeTokenRefresh();
    };
  }, [authenticated, pushAllowed, setNotifications, setNotice]);

  useEffect(() => {
    const messagingInstance = getMessaging();
    const unsubscribeForeground = messagingInstance.onMessage(async (message) => {
      const title = message.notification?.title ?? 'RankFlow';
      const body = message.notification?.body ?? 'Você recebeu uma nova notificação.';
      Alert.alert(title, body);
    });
    const unsubscribeOpened = messagingInstance.onNotificationOpenedApp(() => {
      if (authenticated) router.push('/(tabs)/treino');
    });
    messagingInstance.getInitialNotification().then((message) => {
      if (message && authenticated) router.push('/(tabs)/treino');
    }).catch(() => undefined);

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, [authenticated]);

  return <>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!authenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={authenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="perfil/index" />
        <Stack.Screen name="perfil/editar" />
        <Stack.Screen name="configuracoes/notificacoes" />
        <Stack.Screen name="configuracoes/plataformas" />
        <Stack.Screen name="configuracoes/informacoes" />
        <Stack.Screen name="estatisticas" />
        <Stack.Screen name="amigos/[handle]" />
        <Stack.Screen name="treinos/resultado" />
        <Stack.Screen name="treinos/historico" />
      </Stack.Protected>
      <Stack.Screen name="codeforces" />
      <Stack.Screen name="+not-found" />
    </Stack>
  </>;
}
export default function RootLayout() {
  return <AppProvider><Navigation /></AppProvider>;
}
