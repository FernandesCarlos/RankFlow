import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, Header, InfoBox, Screen } from '../../components/ui';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';
import { getTrainingScoreboard, type TrainingScoreboard } from '../../services/codeforcesApi';

function formatPenalty(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

export default function TrainingScoreboardScreen() {
  const { sessionId: routeSessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { training } = useApp();
  const [scoreboard, setScoreboard] = useState<TrainingScoreboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sessionId = routeSessionId || training?.sessionId;

  const refresh = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      setScoreboard(await getTrainingScoreboard(sessionId));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o placar.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!sessionId) return;
    const poll = setInterval(refresh, 20000);
    return () => clearInterval(poll);
  }, [sessionId, refresh]);

  return (
    <Screen>
      <Header title="Placar" onBack={() => router.back()} />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.primarySoft }}>
          <Text style={{ color: colors.primary, fontWeight: '800', textAlign: 'center' }}>Placar do treino</Text>
        </View>
        <View style={{ flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
          <Text onPress={() => router.replace('/(tabs)/placar')} style={{ color: colors.text, fontWeight: '700', textAlign: 'center' }}>Ranking de amigos</Text>
        </View>
      </View>
      <Text style={{ color: colors.text, fontSize: 23, fontWeight: '800' }}>{scoreboard?.title ?? 'Competição RankFlow'}</Text>
      <Text style={{ color: colors.muted, fontSize: 13, marginTop: 5, marginBottom: 14 }}>
        Ranking baseado nas submissões públicas reais do Codeforces: mais problemas aceitos primeiro; em caso de empate, menor penalidade (tempo até o Accepted + 10 minutos por erro anterior).
      </Text>
      {!sessionId ? <InfoBox>Crie um treino com cronômetro para acompanhar uma competição aqui.</InfoBox> : null}
      {loading ? <InfoBox>Atualizando placar com o Codeforces…</InfoBox> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      {scoreboard ? <>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '800' }}>Status: {scoreboard.status === 'scheduled' ? 'Agendado' : scoreboard.status === 'active' ? 'Em andamento' : 'Encerrado'}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Início: {new Date(scoreboard.startedAt).toLocaleString('pt-BR')}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Duração: {scoreboard.durationMinutes} minutos</Text>
        </Card>
        {scoreboard.ranking.map((row, index) => (
          <Card key={row.participant} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ color: colors.primary, fontSize: 19, fontWeight: '900', width: 24 }}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '800' }}>{row.participant}</Text>
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>{row.solved} problemas aceitos · {row.attempts} submissões</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900' }}>{formatPenalty(row.penaltySeconds)}</Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>penalidade</Text>
            </View>
          </Card>
        ))}
        <Text style={{ color: colors.muted, fontSize: 10, marginTop: 10 }}>Atualizado em {new Date(scoreboard.serverNow).toLocaleTimeString('pt-BR')}</Text>
      </> : null}
      <Text onPress={refresh} style={{ color: colors.primary, fontWeight: '800', paddingVertical: 14 }}>↻ Atualizar placar</Text>
    </Screen>
  );
}
