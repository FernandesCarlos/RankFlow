import { Redirect } from 'expo-router';
import { useApp } from '../state/AppContext';
export default function Index() {
  const { authenticated } = useApp();
  return <Redirect href={authenticated ? '/(tabs)' : '/(auth)/boas-vindas'} />;
}
