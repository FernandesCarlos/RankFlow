import { router } from 'expo-router';
import { Header, InfoBox, PrimaryButton, Screen } from '../components/ui';
export default function NotFound() {
  return <Screen><Header title="Página não encontrada" /><InfoBox>Este endereço não existe no RankFlow.</InfoBox><PrimaryButton title="Voltar ao início" onPress={() => router.replace('/')} /></Screen>;
}
