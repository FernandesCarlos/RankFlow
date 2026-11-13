import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import { Avatar, Card, Header, InfoBox, Screen } from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';
import { loadFriendSummaries } from '../../services/friends';
import type { FriendSummary } from '../../services/friends';

export default function PlacarScreen() {
  const { profile, friendHandles, hydrated } = useApp();
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!hydrated) return;
    if (!friendHandles.length) {
      setFriends([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const results = await loadFriendSummaries(friendHandles);
      setFriends(results);
      setError(results.length === friendHandles.length ? '' : 'Alguns perfis não puderam ser consultados. Confira a aba Amigos.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o ranking.');
    } finally {
      setLoading(false);
    }
  }, [friendHandles, hydrated]);

  useEffect(() => { refresh(); }, [refresh]);

  const ranking = useMemo(() => [...friends].sort((a, b) =>
    (b.user.rating ?? 0) - (a.user.rating ?? 0) ||
    b.solvedCount - a.solvedCount ||
    a.handle.localeCompare(b.handle)
  ), [friends]);

  return (
    <Screen>
      <Header title="Placar" subtitle="Ranking dos amigos cadastrados" right={<Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}><Avatar initials={profile.initials} size={38} /></Pressable>} />
      <Text style={styles.title}>Ranking de amigos</Text>
      <Text style={styles.subtitle}>Primeiro por rating; em caso de empate, por problemas resolvidos.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Atualizar ranking de amigos" onPress={refresh} style={styles.refresh}><Text style={styles.refreshText}>↻ Atualizar dados</Text></Pressable>

      {loading ? <LoadingSkeleton label="Atualizando ranking com o Codeforces" /> : null}
      {error ? <InfoBox tone="warning">{error}</InfoBox> : null}
      {!loading && ranking.length === 0 ? <InfoBox>Você ainda não tem amigos cadastrados. Acesse a aba Amigos para adicionar handles do Codeforces.</InfoBox> : null}

      {!loading ? ranking.map((friend, index) => (
        <Pressable key={friend.handle} accessibilityRole="button" accessibilityLabel={`Posição ${index + 1}, ${friend.handle}, rating ${friend.user.rating ?? 'sem rating'}, ${friend.solvedCount} problemas resolvidos`} onPress={() => router.push({ pathname: '/amigos/[handle]', params: { handle: friend.handle } })}>
          <Card style={styles.row}>
            <View style={styles.position}><Text style={styles.positionText}>{index + 1}</Text></View>
            <Avatar initials={friend.handle.slice(0, 2).toUpperCase()} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.handle}>{friend.handle}</Text>
              <Text style={styles.rank}>{friend.user.rank ?? 'Unrated'}</Text>
            </View>
            <View style={styles.values}>
              <Text style={styles.rating}>{friend.user.rating ?? '—'}</Text>
              <Text style={styles.solved}>{friend.solvedCount} resolvidos</Text>
            </View>
          </Card>
        </Pressable>
      )) : null}

      <Card>
        <Text style={styles.cardTitle}>Placar dos treinos RankFlow</Text>
        <Text style={styles.cardText}>O ranking acima considera os dados públicos do Codeforces. O placar de sessões de treino criadas no RankFlow permanece separado.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/placar/treino')} style={styles.trainingLink}><Text style={styles.trainingLinkText}>Abrir placar de treinos →</Text></Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 12 },
  refresh: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.primary, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14 },
  refreshText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 9 },
  position: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  positionText: { color: colors.primary, fontWeight: '800' },
  handle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  rank: { color: colors.muted, fontSize: 11, marginTop: 3 },
  values: { alignItems: 'flex-end' },
  rating: { color: colors.text, fontWeight: '800', fontSize: 17 },
  solved: { color: colors.success, fontSize: 10, marginTop: 3 },
  cardTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  cardText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  trainingLink: { marginTop: 12, paddingVertical: 6 },
  trainingLinkText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
});
