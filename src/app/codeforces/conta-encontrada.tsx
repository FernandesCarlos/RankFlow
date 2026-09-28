import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Header,
  InfoBox,
  PrimaryButton,
  Screen,
  Stat,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockCodeforces } from '../../mocks';

export default function ContaEncontradaScreen() {
  const { authenticated, verificationOrigin, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{
    handle: string;
    rating: string;
    ranking: string;
    memberSince: string;
    language: string;
  }>();

  if (typeof params.handle !== 'string' || !params.handle.trim()) return <VerificationMissing />;
  return (
    <Screen>
      <Header
        title="Verificação de conta"
        subtitle="Confirme que este handle pertence a você"
        onBack={() => goBack(origin)}
      />

      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>03 Conta encontrada</Text>
      </View>

      <View style={styles.successArea}>
        <View style={styles.successCircle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text accessibilityRole="header" style={styles.title}>Conta encontrada!</Text>
        <Text style={styles.subtitle}>
          Encontramos sua conta do Codeforces. Tudo certo, vamos começar a verificação.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardLabel}>Conta do Codeforces</Text>
        <Text style={styles.handle}>{params.handle}</Text>
        <Text style={styles.member}>
          Membro desde {params.memberSince ?? String(mockCodeforces.profile.memberSince)}
        </Text>

        <View style={styles.stats}>
          <Stat
            label="Rating"
            value={params.rating ?? String(mockCodeforces.profile.rating)}
          />
          <Stat
            label="Ranking"
            value={params.ranking ?? mockCodeforces.profile.ranking}
            compact
          />
        </View>
      </Card>

      <InfoBox>
        Agora iniciaremos um desafio rápido para confirmar que esta conta é realmente sua.
      </InfoBox>

      <PrimaryButton
        title="Iniciar verificação"
        onPress={() =>
          router.push({
            pathname: '/codeforces/verificacao',
            params: {
              handle: params.handle,
              language: params.language,
              problem: mockCodeforces.verificationProblem.displayName,
            },
          })
        }
      />

      <TextButton title="Cancelar" onPress={() => goBack(origin)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepBadge: {
    alignSelf: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    marginBottom: 18,
  },
  stepBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  successArea: {
    alignItems: 'center',
    marginBottom: 18,
  },
  successCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#BBE8C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.success,
    fontSize: 40,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 12,
  },
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
    marginTop: 7,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  handle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  member: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
