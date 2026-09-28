import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from '../state/AppContext';

function Navigation() {
  const { authenticated } = useApp();
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
      </Stack.Protected>
      <Stack.Screen name="codeforces" />
      <Stack.Screen name="+not-found" />
    </Stack>
  </>;
}
export default function RootLayout() {
  return <AppProvider><Navigation /></AppProvider>;
}
