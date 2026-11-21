import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../state/AppContext';

function Navigation() {
  const { authenticated } = useApp();

  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async (message) => {
      const title = message.notification?.title ?? 'RankFlow';
      const body = message.notification?.body ?? 'Você recebeu uma nova notificação.';
      Alert.alert(title, body);
    });
    const unsubscribeOpened = messaging().onNotificationOpenedApp(() => {
      if (authenticated) router.push('/(tabs)/treino');
    });
    messaging().getInitialNotification().then((message) => {
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
