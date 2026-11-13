import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Card, Header, InfoBox, OutlineButton, PrimaryButton, Screen, SectionTitle,
} from '../../components/ui';
import { AccessiblePressable } from '../../components/AccessiblePressable';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';
import {
  getTrainingSession,
  getTrainingScoreboard,
  type TrainingScoreboard,
  type TrainingSession,
} from '../../services/codeforcesApi';

function formatElapsed(seconds: number | null | undefined) {
  if (seconds == null) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours > 0
    ? \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}:\${String(rest).padStart(2, '0')}\`
    : \`\${String(minutes).padStart(2, '0')}:\${String(rest).padStart(2, '0')}\`;
}

function formatPenalty(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? \`\${hours}h \${minutes}min\` : \`\${minutes}min\`;
}

export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training: currentTraining, trainingHistory, completedTrainingId, completeTraining } = useApp();
  const completed = trainingHistory.find((item) => item.id === (id ?? completedTrainingId));
  const training = id ? completed : currentTraining;
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [scoreboard, setScoreboard] = useState<TrainingScoreboard | null>(null);
  const [remaining, setRemaining] = useState('—');
  const [error, setError] = useState('');
  const [scoreboardLoading, setScoreboardLoading] = useState(false);

  const refreshSession = useCallback(async () => {
    if (!training?.sessionId) return;
    try {
      const data = await getTrainingSession(training.sessionId);
      setSession(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a competição.');
    }
  }, [training?.sessionId]);

  const refreshScoreboard = useCallback(async () => {
    if (!training?.sessionId) return;
    setScoreboardLoading(true);
    try {
      setScoreboard(await getTrainingScoreboard(training.sessionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível consultar as submissões do Codeforces.');
    } finally {
      setScoreboardLoading(false);
    }
  }, [training?.sessionId]);

  useEffect(() => { refreshSession(); }, [refreshSession]);
  useEffect(() => { refreshScoreboard(); }, [refreshScoreboard]);
  useEffect(() => {
    if (!training?.sessionId) return;
    const poll = setInterval(() => {
      refreshSession();
      refreshScoreboard();
    }, 20000);
    return () => clearInterval(poll);
  }, [training?.sessionId, refreshSession, refreshScoreboard]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!session) return;
      const target = session.status === 'scheduled' ? session.startedAt : session.endsAt;
      const seconds = Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000));
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;
      setRemaining(\`\${String(minutes).padStart(2, '0')}:\${String(rest).padStart(2, '0')}\`);
      if (seconds === 0 && session.status !== 'finished') refreshSession();
    }, 1000);
    return () => clearInterval(timer);
  }, [session, refreshSession]);

  const problemColumns = useMemo(
    () => (training?.problems ?? []).map((problem, index) => ({
      ...problem,
      label: String.fromCharCode(65 + index),
    })),
    [training?.problems],
  );

  function resultFor(participant: string, problemId: string) {
    return scoreboard?.problemResults.find(
      (item) => item.participant === participant && item.problemId === problemId,
    );
  }

  return (
    <Screen>
      <Header
        title={completed ? 'Treino salvo' : session?.status === 'scheduled' ? 'Treino agendado' : session?.status === 'finished' ? 'Treino encerrado' : 'Acompanhar treino'}
        onBack={() => goBack('/(tabs)/treino')}
      />
      {!training ? <>
        <InfoBox>Não há treino nesta sessão. Escolha os filtros para gerar uma lista de problemas reais.</InfoBox>
        <PrimaryButton title="Criar treino" onPress={() => router.replace('/(tabs)/treino')} />
      </> : <>
        {completed ? <InfoBox>Treino salvo no histórico em {new Date(completed.completedAt).toLocaleString('pt-BR')}.</InfoBox> : null}
        <Card>
          <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700' }}>Participantes: {training.participants.join(', ')}</Text>
          <Text style={{ color: colors.text, fontSize: 14, marginTop: 8 }}>Dificuldade: {training.min} a {training.max}</Text>
          <Text style={{ color: colors.text, fontSize: 14, marginTop: 8 }}>Tags: {training.tags.length ? training.tags.join(', ') : 'Todas'}</Text>
          {session ? <>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 12 }}>{session.status === 'scheduled' ? 'INÍCIO EM' : 'TEMPO RESTANTE'}</Text>
            <Text style={{ color: session.status === 'finished' ? colors.danger : colors.primary, fontSize: 32, fontWeight: '900', marginTop: 3 }}>{session.status === 'finished' ? 'ENCERRADO' : remaining}</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Status: {session.status === 'scheduled' ? 'Agendado' : session.status === 'active' ? 'Em andamento' : 'Concluído'} · Duração: {session.durationMinutes} minutos.</Text>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Início: {new Date(session.startedAt).toLocaleString('pt-BR')}</Text>
          </> : training.sessionId ? <Text style={{ color: colors.muted, marginTop: 8 }}>Carregando cronômetro…</Text> : null}
        </Card>

        <SectionTitle>Acompanhamento das submissões</SectionTitle>
        <InfoBox>Dados consultados no histórico público do Codeforces. O tempo em cada célula é contado desde o início do treino. Um erro antes do Accepted acrescenta 10 minutos de penalidade.</InfoBox>
        {scoreboardLoading && !scoreboard ? <InfoBox>Consultando as submissões reais dos participantes…</InfoBox> : null}
        {scoreboard ? (
          <Card>
            <ScrollView horizontal showsHorizontalScrollIndicator>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 }}>
                  <View style={{ width: 124, justifyContent: 'center', paddingRight: 8 }}>
                    <Text style={{ color: colors.muted, fontWeight: '800', fontSize: 12 }}>NOME</Text>
                  </View>
                  {problemColumns.map((problem) => (
                    <AccessiblePressable
                      key={problem.id}
                      accessibilityRole="link"
                      accessibilityLabel={\`Abrir problema \${problem.label}: \${problem.title} no Codeforces\`}
                      onPress={() => Linking.openURL(problem.url)}
                      style={{ width: 112, minHeight: 48, justifyContent: 'center', paddingHorizontal: 5, alignItems: 'center' }}
                    >
                      <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 15 }}>{problem.label}</Text>
                      <Text numberOfLines={2} style={{ color: colors.muted, fontSize: 9, textAlign: 'center' }}>{problem.title}</Text>
                    </AccessiblePressable>
                  ))}
                </View>

                {training.participants.map((participant) => (
                  <View key={participant} style={{ flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 8 }}>
                    <View style={{ width: 124, justifyContent: 'center', paddingRight: 8 }}>
                      <Text numberOfLines={2} style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>{participant}</Text>
                      <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>
                        {scoreboard.ranking.find((row) => row.participant === participant)?.solved ?? 0} aceitos
                      </Text>
                    </View>
                    {problemColumns.map((problem) => {
                      const result = resultFor(participant, problem.id);
                      const status = result?.status ?? 'not_submitted';
                      const accepted = status === 'accepted';
                      const failed = status === 'error';
                      const pending = status === 'pending';
                      const background = accepted ? '#DCFCE7' : failed ? '#FEE2E2' : pending ? '#FEF3C7' : '#F1F5F9';
                      const foreground = accepted ? '#166534' : failed ? '#991B1B' : pending ? '#92400E' : colors.muted;
                      const label = accepted ? 'AC' : failed ? \`ERR ×\${result?.wrongAttempts ?? 0}\` : pending ? '...' : '—';
                      return (
                        <View key={problem.id} style={{ width: 112, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
                          <View style={{ backgroundColor: background, borderRadius: 999, minWidth: 48, paddingVertical: 5, paddingHorizontal: 8, alignItems: 'center' }}>
                            <Text style={{ color: foreground, fontWeight: '900', fontSize: 11 }}>{label}</Text>
                          </View>
                          {result?.elapsedSeconds != null ? <Text style={{ color: colors.text, fontSize: 10, marginTop: 4, fontVariant: ['tabular-nums'] }}>{formatElapsed(result.elapsedSeconds)}</Text> : null}
                          {accepted && (result?.wrongAttempts ?? 0) > 0 ? <Text style={{ color: colors.danger, fontSize: 9, marginTop: 2 }}>{result?.wrongAttempts} erro(s)</Text> : null}
                          {failed && (result?.wrongAttempts ?? 0) > 0 ? <Text style={{ color: colors.danger, fontSize: 9, marginTop: 2 }}>{result?.wrongAttempts} erro(s)</Text> : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
              <Text style={{ color: '#166534', fontSize: 11, fontWeight: '700' }}>● AC: aceito</Text>
              <Text style={{ color: '#991B1B', fontSize: 11, fontWeight: '700' }}>● ERR: erro</Text>
              <Text style={{ color: '#92400E', fontSize: 11, fontWeight: '700' }}>● ...: julgando</Text>
              <Text style={{ color: colors.muted, fontSize: 11 }}>—: não enviado</Text>
            </View>
          </Card>
        ) : null}

        <SectionTitle>Ranking da competição</SectionTitle>
        {scoreboard?.ranking.map((row, index) => (
          <Card key={row.participant} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.primary, fontSize: 19, fontWeight: '900', width: 24 }}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{row.participant}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 3 }}>{row.solved} aceitos · {row.attempts} submissões</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.text, fontWeight: '900' }}>{formatPenalty(row.penaltySeconds)}</Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>penalidade</Text>
            </View>
          </Card>
        ))}

        {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
        {session ? <PrimaryButton title="Ver placar detalhado" onPress={() => router.push({ pathname: '/placar/treino', params: { sessionId: session.id } })} /> : null}
        {!completed && !id && session?.status === 'finished' ? <OutlineButton title="Salvar treino concluído no histórico" onPress={completeTraining} /> : null}
        <OutlineButton title="Atualizar submissões" onPress={refreshScoreboard} loading={scoreboardLoading} />
        <OutlineButton title="Atualizar cronômetro" onPress={refreshSession} />
        <PrimaryButton title="Voltar ao início" onPress={() => router.dismissTo('/(tabs)')} />
      </>}
    </Screen>
  );
}
