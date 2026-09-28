import { router, type Href } from 'expo-router';

/** Remove o topo da pilha; links diretos usam um destino conhecido. */
export function goBack(fallback: Href = '/(tabs)') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
