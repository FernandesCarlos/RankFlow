import React, { useEffect, useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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
  const params = useLocalSearchParams<{
    handle: string;
    language: string;
    problem: string;
  }>();

  const [seconds, setSeconds] = useState(TOTAL);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds !== 0) return;

    router.replace({
      pathname: '/codeforces/falha',
      params,
    });
  }, [seconds]);

  const formatted = useMemo(() => {
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
  }, [seconds]);

  async function refresh() {
    setChecking(true);
    const found = await checkVerificationSubmission();
    setChecking(false);

    if (found) {
      router.replace({
        pathname: '/codeforces/sucesso',
        params,
      });
    }
  }

  return (
    <Screen>
      <Header
        title="Verificação em andamento"
        onBack={() => router.back()}
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
        />
      </Card>

      <TextButton
        danger
        title="Cancelar verificação"
        onPress={() => router.replace('/codeforces/verificar-conta')}
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
    fontSize: 12,
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
    fontSize: 11,
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
