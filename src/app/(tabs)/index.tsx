import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import { Avatar, Card, InfoBox, ProgressBar, Screen } from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/colors';
import { getCodeforcesSummary, type CodeforcesSummary } from '../../services/codeforcesApi';

export default function HomeScreen() {
  const { profile } = useApp();
  const [data, setData] = useState<CodeforcesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!profile.codeforcesHandle.trim()) {
      setData(null);
      setError('Vincule seu handle do Codeforces nas configurações de plataformas.');
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    getCodeforcesSummary(profile.codeforcesHandle)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((err) => { if (active) { setData(null); setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados do Codeforces.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile.codeforcesHandle]);

  const user = data?.user;
  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text accessibilityRole="header" style={styles.title}>Olá, {profile.firstName} 👋</Text>
          <Text style={styles.subtitle}>Seu desempenho no Codeforces</Text>
        </View>
        <Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}>
          <Avatar initials={profile.initials} size={40} />
        </Pressable>
      </View>

      {loading ? <LoadingSkeleton label="Consultando perfil e desempenho no Codeforces" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}

      {!loading && data ? <>
        <Card>
          <View style={styles.profileRow}>
            <Avatar initials={profile.initials} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={styles.handle}>{user?.handle}</Text>
              <Text style={styles.rank}>{user?.rank ?? 'Unrated'}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ratingLabel}>Rating</Text>
              <Text style={styles.rating}>{user?.rating ?? '—'}</Text>
              <Text style={styles.maxRating}>Máx. {user?.maxRating ?? '—'}</Text>
            </View>
          </View>
        </Card>

        <Text accessibilityRole="header" style={styles.sectionTitle}>Visão rápida</Text>
        <View style={styles.quickRow}>
          <QuickCard label="Problemas" value={String(data.solvedCount)} />
          <QuickCard label="Contests" value={String(data.contestCount)} />
          <QuickCard label="Submissões" value={String(data.submissionCount)} />
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Ver estatísticas detalhadas" onPress={() => router.push('/estatisticas')}>
          <Card>
            <View style={styles.performanceHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitleCard}>Performance recente</Text>
                <Text style={styles.performanceGain}>
                  {data.ratingGainLastFive > 0 ? '+' : ''}{data.ratingGainLastFive} rating nos últimos 5 contests
                </Text>
              </View>
              <Text style={styles.more}>›</Text>
            </View>
            {data.recentRating.length ? <View style={styles.chart}>
              {data.recentRating.map((rating, index) => {
                const min = Math.min(...data.recentRating);
                const max = Math.max(...data.recentRating);
                const height = max === min ? 40 : 28 + ((rating - min) / (max - min)) * 58;
                return <View key={index} style={[styles.chartBar, { height }]} />;
              })}
            </View> : <Text style={styles.empty}>Você ainda não possui contests no histórico.</Text>}
            <ProgressBar value={Math.min(100, Math.max(0, (user?.rating ?? 0) / 4000 * 100))} label="Rating em relação a 4000" />
          </Card>
        </Pressable>
        <Text style={styles.footnote}>Problemas resolvidos calculados em todo o histórico público de submissões aceitas do Codeforces.</Text>
      </> : null}
    </Screen>
  );
}

function QuickCard({ label, value }: { label: string; value: string }) {
  return <View style={styles.quickCard}><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 22 },
  headingBlock: { flex: 1, minWidth: 0 },
  title: { color: colors.text, fontSize: 27, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 3 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  handle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  rank: { color: colors.primary, fontSize: 13, marginTop: 4, fontWeight: '700' },
  ratingLabel: { color: colors.muted, fontSize: 12 },
  rating: { color: colors.text, fontSize: 23, fontWeight: '800' },
  maxRating: { color: colors.muted, fontSize: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  quickCard: { flexGrow: 1, flexBasis: 90, minWidth: 86, minHeight: 82, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: colors.muted, fontSize: 12 },
  quickValue: { color: colors.text, fontSize: 19, fontWeight: '800', marginTop: 7 },
  sectionTitleCard: { color: colors.text, fontSize: 16, fontWeight: '800' },
  performanceHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  performanceGain: { color: colors.success, fontSize: 12, marginTop: 5, fontWeight: '700' },
  more: { color: colors.muted, fontSize: 28 },
  chart: { height: 90, marginVertical: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  chartBar: { width: 22, borderRadius: 7, backgroundColor: '#9EBBFF' },
  empty: { color: colors.muted, fontSize: 13, marginVertical: 14 },
  footnote: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 2 },
});
