import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Header,
  InfoBox,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function SucessoScreen() {
  const { authenticated, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{ handle?: string; problem?: string }>();
  const handle = typeof params.handle === 'string' ? params.handle.trim() : '';
  if (!handle) return <VerificationMissing />;

  return (
    <Screen>
      <Header title="Submissão detectada" onBack={() => router.dismissTo(origin)} />
      <View style={styles.success}>
        <View style={styles.circle}><Text style={styles.check}>✓</Text></View>
        <Text style={styles.badge}>SUBMISSÃO ACEITA</Text>
        <Text accessibilityRole="header" style={styles.title}>Atividade encontrada no Codeforces</Text>
      </View>
      <Card style={styles.profileCard}>
        <Text style={styles.label}>Handle consultado</Text>
        <Text style={styles.handle}>{handle}</Text>
        <Text style={styles.label}>Problema aceito</Text>
        <Text style={styles.problem}>{params.problem ?? 'Problema do desafio'}</Text>
      </Card>
      <InfoBox>O RankFlow encontrou um verdict OK para o problema após o início do desafio. Isso confirma a atividade pública nessa conta, mas não equivale a um método oficial de autenticação do Codeforces.</InfoBox>
      <PrimaryButton title="Vincular este handle" onPress={() => {
        setVerifiedHandle(handle);
        if (authenticated) setProfile(current => ({ ...current, codeforcesHandle: handle }));
        setNotice({ message: `Handle ${handle} salvo no RankFlow.`, tone: 'success' });
        router.dismissTo(origin);
      }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: { alignItems: 'center', marginBottom: 18 },
  circle: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: '#BBE8C9', alignItems: 'center', justifyContent: 'center' },
  check: { color: colors.success, fontSize: 38, fontWeight: '800' },
  badge: { color: colors.success, backgroundColor: colors.successSoft, fontSize: 13, fontWeight: '800', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', marginTop: 10 },
  title: { color: colors.text, fontSize: 21, lineHeight: 27, textAlign: 'center', fontWeight: '800', marginTop: 10 },
  profileCard: { gap: 8 },
  label: { color: colors.muted, fontSize: 12, marginTop: 6 },
  handle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  problem: { color: colors.primary, fontSize: 15, fontWeight: '700' },
});
