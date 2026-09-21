import { Stack } from 'expo-router';
export const unstable_settings = { initialRouteName: 'boas-vindas' };
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="boas-vindas" />
    <Stack.Screen name="login" />
    <Stack.Screen name="cadastro" />
    <Stack.Screen name="recuperar-senha" />
  </Stack>;
}
