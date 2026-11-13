import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Header,
  InfoBox,
  OutlineButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { checkVerificationSubmission } from '../../services/codeforces';

const TOTAL = 15 * 60;

export default function VerificacaoScreen() {
  const { authenticated, verificationOrigin } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{
    handle: string;
    language: string;
    problem: string;
    contestId: string;
    index: string;
    startedAt: string;
  }>();

  const [seconds, setSeconds] = useState(TOTAL);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const active = useRef(false);
  const busy = useRef(false);
  const deadline = useRef(Date.now() + TOTAL * 1000);

  useFocusEffect(useCallback(() => {
    if (typeof params.handle !== 'string' || !params.handle.trim()) return;
    active.current = true;
    const timer = setInterval(
      () => setSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))),
      1000,
    );
    return () => { active.current = false; clearInterval(timer); };
  }, []));

  useEffect(() => {
    if (seconds === 0 && active.current) {
      active.current = false;
      router.replace({ pathname: '/codeforces/falha', params });
    }
  }, [seconds]);

  const formatted = useMemo(() => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  }, [seconds]);

  async function refresh() {
    if (busy.current || seconds === 0) return;
    const contestId = Number(params.contestId);
    const startedAt = Number(params.startedAt);
    if (!Number.isInteger(contestId) || !params.index || !Number.isFinite(startedAt)) {
      setError('Os dados do desafio estão incompletos. Gere um novo desafio.');
      return;
    }
    busy.current = true;
    setChecking(true);
    setError('');
    try {
      const found = await checkVerificationSubmission({
        handle: params.handle,
        contestId,
        index: params.index,
        startedAt,
      });
      if (!active.current || Date.now() >= deadline.current) return;
      if (found) {
        active.current = false;
        router.replace({ pathname: '/codeforces/sucesso', params });
      } else {
        setError('Ainda não encontramos uma submissão para este problema após o início do desafio. Envie qualquer tentativa e tente novamente.');
      }
    } catch (err) {
      if (active.current) setError(err instanceof Error ? err.message : 'Falha ao consultar as submissões do Codeforces.');
    } finally {
      busy.current = false;
      if (active.current) setChecking(false);
    }
  }

  if (
    typeof params.handle !== 'string' ||
    !params.handle.trim() ||
    !params.contestId ||
    !params.index ||
    !params.startedAt
  ) return <VerificationMissing />;

  return (
    <Screen>
      <Header title="Verificação em andamento" onBack={() => goBack(origin)} />
      <Text style={styles.subtitle}>Envie uma submissão para o problema indicado antes do tempo acabar. Não precisa ser Accepted.</Text>
      <Card style={styles.timerCard}>
        <Text style={styles.timerLabel}>Tempo restante</Text>
        <Text style={styles.timer}>{formatted}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(seconds / TOTAL) * 100}%` }]} />
        </View>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Problema de verificação</Text>
        <ChallengeRow label="Handle" value={params.handle} />
        <ChallengeRow label="Problema" value={`${params.contestId}${params.index} · ${params.problem}`} />
        <ChallengeRow label="Linguagem escolhida" value={params.language ?? 'Não informada'} />
        <InfoBox>O RankFlow consulta o histórico público do Codeforces e procura qualquer submissão deste problema enviada depois do início do desafio, independentemente do veredito.</InfoBox>
      </Card>
      <Card>
        <Text style={styles.waiting}>Aguardando submissão</Text>
        <Text style={styles.waitingText}>Depois de enviar qualquer tentativa, atualize o status para consultar a API do Codeforces.</Text>
        <OutlineButton title={checking ? 'Consultando Codeforces…' : 'Verificar submissão'} onPress={refresh} loading={checking} />
      </Card>
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <TextButton danger title="Cancelar verificação" onPress={() => { active.current = false; router.dismissTo('/codeforces/verificar-conta'); }} />
    </Screen>
  );
}

function ChallengeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.challengeRow}>
      <Text style={styles.challengeLabel}>{label}</Text>
      <Text style={styles.challengeValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: -8, marginBottom: 18 },
  timerCard: { alignItems: 'center' },
  timerLabel: { color: colors.muted, fontWeight: '600' },
  timer: { color: colors.primary, fontSize: 52, fontWeight: '800', marginTop: 6 },
  track: { width: '100%', height: 9, backgroundColor: '#E7EEF9', borderRadius: 999, overflow: 'hidden', marginTop: 12 },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 4 },
  challengeRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  challengeLabel: { color: colors.muted, fontSize: 12 },
  challengeValue: { color: colors.text, fontWeight: '800', marginTop: 3 },
  waiting: { color: colors.text, fontSize: 17, fontWeight: '800' },
  waitingText: { color: colors.muted, lineHeight: 19, fontSize: 13, marginTop: 7 },
});
