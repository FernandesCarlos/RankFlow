import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import React, { useState } from 'react';
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
import { getCodeforcesVerificationProblem } from '../../services/codeforcesApi';

export default function ContaEncontradaScreen() {
  const { authenticated, verificationOrigin } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const params = useLocalSearchParams<{
    handle: string;
    rating: string;
    rank: string;
    memberSince: string;
    language: string;
  }>();

  if (typeof params.handle !== 'string' || !params.handle.trim()) return <VerificationMissing />;

  async function startVerification() {
    setLoading(true);
    setError('');
    try {
      const problem = await getCodeforcesVerificationProblem(params.handle);
      const startedAt = Math.floor(Date.now() / 1000);
      router.push({
        pathname: '/codeforces/verificacao',
        params: {
          handle: params.handle,
          language: params.language,
          problem: problem.title,
          contestId: String(problem.contestId),
          index: problem.index,
          startedAt: String(startedAt),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o desafio de verificação.');
    } finally {
      setLoading(false);
    }
  }

  const memberSince = Number(params.memberSince);
  return (
    <Screen>
      <Header title="Conta encontrada" subtitle="Dados recebidos da API do Codeforces" onBack={() => goBack(origin)} />
      <View style={styles.successArea}>
        <View style={styles.successCircle}><Text style={styles.check}>✓</Text></View>
        <Text accessibilityRole="header" style={styles.title}>Conta encontrada</Text>
        <Text style={styles.subtitle}>Confira se o handle abaixo é o que você deseja vincular.</Text>
      </View>
      <Card>
        <Text style={styles.cardLabel}>Conta do Codeforces</Text>
        <Text style={styles.handle}>{params.handle}</Text>
        {memberSince > 0 ? <Text style={styles.member}>Membro desde {new Date(memberSince * 1000).getFullYear()}</Text> : null}
        <View style={styles.stats}>
          <Stat label="Rating" value={Number(params.rating) || 'Unrated'} />
          <Stat label="Classificação" value={params.rank || 'Unrated'} compact />
        </View>
      </Card>
      <InfoBox>O desafio será um problema real ainda não resolvido por esse handle. A confirmação verifica uma submissão aceita pública após o início do desafio; isso não é autenticação oficial do Codeforces.</InfoBox>
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <PrimaryButton title={loading ? 'Gerando desafio…' : 'Gerar desafio de verificação'} loading={loading} onPress={startVerification} />
      <TextButton title="Cancelar" onPress={() => goBack(origin)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  successArea: { alignItems: 'center', marginBottom: 18 },
  successCircle: { width: 78, height: 78, borderRadius: 39, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: '#BBE8C9', alignItems: 'center', justifyContent: 'center' },
  check: { color: colors.success, fontSize: 40, fontWeight: '800' },
  title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 12 },
  subtitle: { color: colors.muted, textAlign: 'center', lineHeight: 20, fontSize: 13, marginTop: 7 },
  cardLabel: { color: colors.muted, fontSize: 14 },
  handle: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 },
  member: { color: colors.muted, fontSize: 14, marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
});
