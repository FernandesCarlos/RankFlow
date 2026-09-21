import { router } from 'expo-router';
import { Header, InfoBox, PrimaryButton, Screen } from './ui';
export function VerificationMissing() {
  return <Screen>
    <Header title="Verificação não iniciada" />
    <InfoBox tone="warning">Informe um handle para iniciar a verificação.</InfoBox>
    <PrimaryButton title="Informar handle" onPress={() => router.replace('/codeforces/verificar-conta')} />
  </Screen>;
}
