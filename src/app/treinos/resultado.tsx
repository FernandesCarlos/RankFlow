import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
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
  simulateTrainingSubmission,
  type TrainingSession,
} from '../../services/codeforcesApi';

export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training: currentTraining, trainingHistory, completedTrainingId, completeTraining } = useApp();
  const completed = trainingHistory.find((item) => item.id === (id ?? completedTrainingId));
  const training = id ? completed : currentTraining;
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [participant, setParticipant] = useState('');
  const [remaining, setRemaining] = useState('—');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refreshSession = useCallback(async () => {
    if (!training?.sessionId) return;
    try {
      const data = await getTrainingSession(training.sessionId);
      setSession(data);
      setParticipant((current) => current || data.creatorHandle);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a competição.');
    }
  }, [training?.sessionId]);

  useEffect(() => { refreshSession(); }, [refreshSession]);
  useEffect(() => {
    if (!training?.sessionId) return;
    const poll = setInterval(refreshSession, 5000);
    return () => clearInterval(poll);
  }, [training?.sessionId, refreshSession]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!session) return;
      const target = session.status === 'scheduled' ? session.startedAt : session.endsAt;
      const seconds = Math.max(0, Math.floor((new Date(target).getTime() - Date.now()) / 1000));
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;
      setRemaining(`${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`);
      if (seconds === 0 && session.status !== 'finished') refreshSession();
    }, 1000);
    return () => clearInterval(timer);
  }, [session, refreshSession]);

  async function simulate(problemId: string, verdict: 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR') {
    if (!session || !participant) return;
    setBusy(true);
    setError('');
    try {
      const updated = await simulateTrainingSubmission({
        sessionId: session.id, participant, problemId, verdict,
      });
      setSession(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar a simulação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title={completed ? 'Treino salvo' : session?.status === 'scheduled' ? 'Treino agendado' : session?.status === 'finished' ? 'Treino encerrado' : 'Competição em andamento'} onBack={() => goBack('/(tabs)/treino')} />
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
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Início previsto: {new Date(session.startedAt).toLocaleString('pt-BR')}</Text>
          </> : training.sessionId ? <Text style={{ color: colors.muted, marginTop: 8 }}>Carregando cronômetro…</Text> : null}
        </Card>

        {session && session.status === 'active' && !completed ? <>
          <SectionTitle>Simular submissões</SectionTitle>
          <Card>
            <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 10 }}>Participante da tentativa</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {session.participants.map((handle) => (
                <AccessiblePressable key={handle} onPress={() => setParticipant(handle)} style={{ padding: 10, borderRadius: 9, borderWidth: 1, borderColor: participant === handle ? colors.primary : colors.border, backgroundColor: participant === handle ? colors.primarySoft : 'transparent' }}>
                  <Text style={{ color: participant === handle ? colors.primary : colors.text, fontWeight: '700' }}>{handle}</Text>
                </AccessiblePressable>
              ))}
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, marginTop: 10 }}>Modo demonstração: os vereditos e pontos abaixo são simulados no RankFlow e não são enviados ao Codeforces.</Text>
          </Card>
        </> : null}

        <SectionTitle>Problemas do Codeforces</SectionTitle>
        {training.problems.map((problem) => {
          const solved = session?.submissions.some((item) => item.participant === participant && item.problemId === problem.id && item.verdict === 'OK');
          const attempts = session?.submissions.filter((item) => item.problemId === problem.id) ?? [];
          return <Card key={problem.id}>
            <AccessiblePressable accessibilityRole="link" accessibilityLabel={`Abrir ${problem.title} no Codeforces`} onPress={() => Linking.openURL(problem.url)}>
              <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>{problem.contestId}{problem.index} · {problem.title} ↗</Text>
            </AccessiblePressable>
            <Text style={{ color: colors.muted, fontSize: 13, marginTop: 7 }}>Dificuldade {problem.rating} · {problem.tags.join(', ')}</Text>
            {session && session.status === 'active' && !completed ? <>
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 12 }}>Simular resultado para {participant || 'participante'}:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
                {(['OK', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'RUNTIME_ERROR'] as const).map((verdict) => (
                  <AccessiblePressable key={verdict} disabled={busy || Boolean(solved)} onPress={() => simulate(problem.id, verdict)} style={{ paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, backgroundColor: verdict === 'OK' ? '#DCFCE7' : '#F1F5F9', opacity: busy || solved ? 0.5 : 1 }}>
                    <Text style={{ color: colors.text, fontSize: 11, fontWeight: '700' }}>{verdict === 'OK' ? 'Accepted' : verdict === 'WRONG_ANSWER' ? 'Wrong Answer' : verdict === 'TIME_LIMIT_EXCEEDED' ? 'Time Limit' : 'Runtime Error'}</Text>
                  </AccessiblePressable>
                ))}
              </View>
              {solved ? <Text style={{ color: colors.success, marginTop: 7, fontSize: 12 }}>Problema pontuado para {participant}.</Text> : null}
              <Text style={{ color: colors.muted, fontSize: 10, marginTop: 6 }}>{attempts.length} tentativa(s) registradas neste problema.</Text>
            </> : null}
          </Card>;
        })}

        {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
        {session ? <PrimaryButton title="Ver placar desta competição" onPress={() => router.push({ pathname: '/placar/treino', params: { sessionId: session.id } })} /> : null}
        {!completed && !id && session?.status === 'finished' ? <OutlineButton title="Salvar treino concluído no histórico" onPress={completeTraining} /> : null}
        <OutlineButton title="Atualizar competição" onPress={refreshSession} />
        <PrimaryButton title="Voltar ao início" onPress={() => router.dismissTo('/(tabs)')} />
      </>}
    </Screen>
  );
}
