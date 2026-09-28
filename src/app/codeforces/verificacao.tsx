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
import { mockCodeforces } from '../../mocks';

const TOTAL = mockCodeforces.verificationTimeoutSeconds;

export default function VerificacaoScreen() {
  const { authenticated, verificationOrigin, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{
    handle: string;
    language: string;
    problem: string;
  }>();

  const [seconds, setSeconds] = useState(TOTAL);
  const [checking, setChecking] = useState(false);

  const active = useRef(false);
  const busy = useRef(false);
  const deadline = useRef(Date.now() + TOTAL * 1000);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    if (typeof params.handle !== 'string' || !params.handle.trim()) return;
    active.current = true;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))), 1000);
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
    busy.current = true;
    setChecking(true);
    setError('');
    try {
      const found = await checkVerificationSubmission();
      if (!active.current || Date.now() >= deadline.current) return;
      if (found) {
        active.current = false;
        router.replace({ pathname: '/codeforces/sucesso', params });
      } else setError('Submissão ainda não encontrada. Tente atualizar novamente.');
    } catch {
      if (active.current) setError('Falha ao verificar. Tente novamente.');
    } finally {
      busy.current = false;
      if (active.current) setChecking(false);
    }
  }

  if (typeof params.handle !== 'string' || !params.handle.trim()) return <VerificationMissing />;
  return (
    <Screen>
      <Header
        title="Verificação em andamento"
        onBack={() => goBack(origin)}
      />

      <Text style={styles.subtitle}>
        Faça uma submissão no problema indicado antes do tempo acabar.
      </Text>

      <Card style={styles.timerCard}>
        <Text style={styles.timerLabel}>◷  Tempo restante</Text>
        <Text style={styles.timer}>{formatted}</Text>
        <Text style={styles.remaining}>restantes</Text>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${(seconds / TOTAL) * 100}%` },
            ]}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Desafio de verificação</Text>

        <ChallengeRow
          icon="▤"
          label="Problema"
          value={params.problem ?? mockCodeforces.verificationProblem.displayName}
        />

        <ChallengeRow
          icon="⌨"
          label="Linguagem"
          value={params.language ?? mockCodeforces.languages[0]}
        />

        <InfoBox>
          Faça uma submissão para o problema acima usando a linguagem indicada.
        </InfoBox>
      </Card>

      <Card>
        <Text style={styles.waiting}>Aguardando submissão...</Text>
        <Text style={styles.waitingText}>
          Assim que detectarmos sua submissão, a verificação será concluída.
        </Text>

        <OutlineButton
          title={checking ? 'Verificando...' : 'Já enviei / Atualizar status'}
          onPress={refresh}
          loading={checking}
        />
      </Card>

      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <TextButton
        danger
        title="Cancelar verificação"
        onPress={() => { active.current = false; router.dismissTo('/codeforces/verificar-conta'); }}
      />
    </Screen>
  );
}

function ChallengeRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.challengeRow}>
      <Text style={styles.challengeIcon}>{icon}</Text>
      <View>
        <Text style={styles.challengeLabel}>{label}</Text>
        <Text style={styles.challengeValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -8,
    marginBottom: 18,
  },
  timerCard: {
    alignItems: 'center',
  },
  timerLabel: {
    color: colors.muted,
    fontWeight: '600',
  },
  timer: {
    color: colors.primary,
    fontSize: 52,
    fontWeight: '800',
    marginTop: 6,
  },
  remaining: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 14,
  },
  track: {
    width: '100%',
    height: 9,
    backgroundColor: '#E7EEF9',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  challengeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  challengeIcon: {
    width: 26,
    color: colors.primary,
    fontSize: 18,
  },
  challengeLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  challengeValue: {
    color: colors.text,
    fontWeight: '800',
    marginTop: 3,
  },
  waiting: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  waitingText: {
    color: colors.muted,
    lineHeight: 19,
    fontSize: 13,
    marginTop: 7,
  },
});
