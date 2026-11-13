import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AccessiblePressable as Pressable } from '../components/AccessiblePressable';
import { Avatar, Card, Header, InfoBox, ProgressBar, Screen } from '../components/ui';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useApp } from '../state/AppContext';
import { colors } from '../theme/colors';
import { getCodeforcesSummary, type CodeforcesSummary } from '../services/codeforcesApi';

export default function EstatisticasScreen() {
  const { profile } = useApp();
  const [tab, setTab] = useState<'tags' | 'rating'>('tags');
  const [data, setData] = useState<CodeforcesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getCodeforcesSummary(profile.codeforcesHandle)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar as estatísticas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile.codeforcesHandle]);

  const rating = data?.user.rating;
  const maxRating = data?.user.maxRating;
  const chart = data?.recentRating ?? [];
  const maxTag = Math.max(1, ...(data?.tagStats ?? []).map((item) => item.solved));

  return (
    <Screen>
      <Header title="Estatísticas" onBack={() => router.back()} right={<Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}><Avatar initials={profile.initials} size={38} /></Pressable>} />
      <Text style={styles.title}>Estatísticas</Text>
      <Text style={styles.subtitle}>Dados consultados diretamente no Codeforces.</Text>

      {loading ? <LoadingSkeleton label="Carregando rating, contests e submissões" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}

      {!loading && data ? <>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.label}>Rating atual</Text>
            <Text style={styles.value}>{rating ?? 'Unrated'}</Text>
            <Text style={styles.caption}>{data.user.rank ?? 'Sem classificação'}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.label}>Maior rating</Text>
            <Text style={styles.value}>{maxRating ?? '—'}</Text>
            <Text style={styles.caption}>Pico histórico</Text>
          </Card>
        </View>
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.label}>Problemas resolvidos</Text>
            <Text style={styles.value}>{data.solvedCount}</Text>
            <Text style={styles.caption}>Na amostra recente de até 1000 submissões</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.label}>Contests</Text>
            <Text style={styles.value}>{data.contestCount}</Text>
            <Text style={styles.caption}>Histórico público</Text>
          </Card>
        </View>

        <View style={styles.tabs}>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'tags' }} onPress={() => setTab('tags')} style={[styles.tab, tab === 'tags' && styles.tabActive]}><Text style={[styles.tabText, tab === 'tags' && styles.tabTextActive]}>Tags</Text></Pressable>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: tab === 'rating' }} onPress={() => setTab('rating')} style={[styles.tab, tab === 'rating' && styles.tabActive]}><Text style={[styles.tabText, tab === 'rating' && styles.tabTextActive]}>Rating</Text></Pressable>
        </View>

        {tab === 'tags' ? <>
          <Text style={styles.sectionTitle}>Problemas resolvidos por tag</Text>
          {data.tagStats.length ? <Card>
            {data.tagStats.slice(0, 12).map((item) => (
              <View key={item.tag} style={styles.tagRow}>
                <View style={styles.tagHeader}><Text style={styles.tagName}>{item.tag}</Text><Text style={styles.tagCount}>{item.solved}</Text></View>
                <ProgressBar value={item.solved / maxTag * 100} label={`${item.solved} problemas em ${item.tag}`} />
              </View>
            ))}
          </Card> : <InfoBox>Não há submissões aceitas suficientes para calcular estatísticas por tag.</InfoBox>}
        </> : <>
          <Text style={styles.sectionTitle}>Evolução de rating</Text>
          <Card>
            <Text style={styles.value}>{rating ?? 'Unrated'}</Text>
            <Text style={styles.caption}>Variação nos últimos 5 contests: {data.ratingGainLastFive > 0 ? '+' : ''}{data.ratingGainLastFive}</Text>
            {chart.length ? <View style={styles.chart}>
              {chart.map((point, index) => {
                const min = Math.min(...chart);
                const max = Math.max(...chart);
                const height = max === min ? 45 : 24 + ((point - min) / (max - min)) * 76;
                return <View key={index} style={styles.barWrap}><View style={[styles.bar, { height }]} /><Text style={styles.barLabel}>{index + 1}</Text></View>;
              })}
            </View> : <Text style={styles.caption}>Nenhum contest registrado no histórico.</Text>}
          </Card>
          <Text style={styles.caption}>O gráfico mostra os últimos {chart.length} resultados de contest retornados pela API.</Text>
        </>}
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 26, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 3, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, padding: 12, minWidth: 0 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  value: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 5 },
  caption: { color: colors.muted, fontSize: 11, marginTop: 4, lineHeight: 15 },
  tabs: { flexDirection: 'row', minHeight: 48, padding: 4, borderRadius: 12, backgroundColor: '#EEF2F7', marginVertical: 18 },
  tab: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { color: colors.muted, fontWeight: '700' },
  tabTextActive: { color: colors.primary },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 10 },
  tagRow: { marginBottom: 15 },
  tagHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  tagName: { color: colors.text, fontWeight: '700' },
  tagCount: { color: colors.primary, fontWeight: '800' },
  chart: { height: 135, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: 20 },
  barWrap: { alignItems: 'center', flex: 1, gap: 6 },
  bar: { width: 18, borderRadius: 6, backgroundColor: colors.primary },
  barLabel: { color: colors.muted, fontSize: 10 },
});
