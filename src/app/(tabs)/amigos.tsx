import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import { Avatar, Card, Field, Header, InfoBox, PrimaryButton, Screen } from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';
import { getCodeforcesUser } from '../../services/codeforcesApi';
import { loadFriendSummaries, summarizeFriendError, type FriendSummary } from '../../services/friends';

export default function AmigosScreen() {
  const { friendHandles, addFriendHandle, removeFriendHandle, hydrated } = useApp();
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [friends, setFriends] = useState<FriendSummary[]>([]);

  const refresh = useCallback(async () => {
    if (!hydrated) return;
    if (friendHandles.length === 0) {
      setFriends([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const loaded = await loadFriendSummaries(friendHandles);
      setFriends(loaded);
      setError(summarizeFriendError(friendHandles, loaded) ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar amigos.');
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

  async function addFriend() {
    const handle = query.trim();
    if (!handle) return;
    setAdding(true);
    setError('');
    setNotice('');
    try {
      const user = await getCodeforcesUser(handle);
      const canonical = user.handle || handle;
      if (friendHandles.some((item) => item.toLowerCase() === canonical.toLowerCase())) {
        setNotice('Esse amigo já está cadastrado.');
      } else {
        addFriendHandle(canonical);
        setQuery('');
        setNotice(`@${canonical} foi adicionado ao seu ranking.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível encontrar esse handle.');
    } finally {
      setAdding(false);
    }
  }

  function remove(handle: string) {
    removeFriendHandle(handle);
    setFriends((current) => current.filter((friend) => friend.handle !== handle));
  }

  return (
    <Screen>
      <Header title="Amigos" subtitle="Ranking dos seus amigos no Codeforces" />
      <Card>
        <Text style={styles.formTitle}>Adicionar amigo</Text>
        <Text style={styles.muted}>Cadastre o handle público do Codeforces para acompanhar rating e problemas resolvidos.</Text>
        <Field
          label="Handle do Codeforces"
          value={query}
          onChangeText={setQuery}
          editable={hydrated}
          placeholder="Ex.: tourist"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton title={adding ? 'Consultando Codeforces...' : 'Adicionar amigo'} onPress={addFriend} disabled={!hydrated || !query.trim() || adding} loading={adding} />
      </Card>

      {notice ? <InfoBox tone="success">{notice}</InfoBox> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}

      <View style={styles.headingRow}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Ranking de amigos</Text>
          <Text style={styles.muted}>Ordenado por rating e, em caso de empate, problemas resolvidos.</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Atualizar ranking" onPress={refresh} style={styles.refresh}>
          <Text style={styles.refreshText}>Atualizar</Text>
        </Pressable>
      </View>

      {!hydrated || loading ? <LoadingSkeleton label="Consultando dados dos amigos no Codeforces" /> : null}

      {hydrated && !loading && friendHandles.length === 0 ? (
        <InfoBox>Você ainda não cadastrou amigos. Adicione um handle acima para começar seu ranking.</InfoBox>
      ) : null}

      {hydrated && !loading && friendHandles.length > 0 && ranking.length === 0 ? (
        <InfoBox tone="warning">Não há dados disponíveis para os handles cadastrados. Confira os nomes e tente atualizar.</InfoBox>
      ) : null}

      {hydrated && !loading ? ranking.map((friend, index) => (
        <View key={friend.handle} style={styles.friendRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Posição ${index + 1}, ${friend.handle}, rating ${friend.user.rating ?? 'sem rating'}, ${friend.solvedCount} problemas resolvidos`}
            onPress={() => router.push({ pathname: '/amigos/[handle]', params: { handle: friend.handle } })}
            style={{ flex: 1 }}
          >
            <Card style={styles.friendCard}>
              <View style={styles.position}><Text style={styles.positionText}>{index + 1}</Text></View>
              <Avatar initials={friend.handle.slice(0, 2).toUpperCase()} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.handle}>{friend.handle}</Text>
                <Text style={styles.rank}>{friend.user.rank ?? 'Unrated'} · {friend.user.rating ?? '—'} rating</Text>
                <Text style={styles.stats}>{friend.solvedCount} problemas resolvidos · {friend.contestCount} contests</Text>
              </View>
            </Card>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${friend.handle} dos amigos`} onPress={() => remove(friend.handle)} style={styles.remove}>
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      )) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 6 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '800', marginBottom: 4 },
  refresh: { borderWidth: 1, borderColor: colors.primary, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8 },
  refreshText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  friendCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, marginBottom: 0 },
  position: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  positionText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  handle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  rank: { color: colors.primary, fontSize: 12, marginTop: 3, fontWeight: '700' },
  stats: { color: colors.muted, fontSize: 11, marginTop: 4 },
  remove: { paddingHorizontal: 6, paddingVertical: 4 },
  removeText: { color: colors.danger, fontSize: 24, fontWeight: '700' },
});
