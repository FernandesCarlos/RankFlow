import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Header, InfoBox, Screen, Stat, SectionTitle } from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { getCodeforcesSummary, type CodeforcesSummary } from '../../services/codeforcesApi';
import { colors } from '../../theme/colors';

export default function AmigoScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const normalizedHandle = Array.isArray(handle) ? handle[0] : handle;
  const [data, setData] = useState<CodeforcesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!normalizedHandle) {
      setError('Handle não informado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    getCodeforcesSummary(normalizedHandle)
      .then((result) => { if (active) { setData(result); setError(''); } })
      .catch((err) => { if (active) setError(err instanceof Error ? err.message : 'Não foi possível carregar o perfil.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [normalizedHandle]);

  return (
    <Screen>
      <Header title="Perfil do amigo" onBack={() => router.back()} />
      {loading ? <LoadingSkeleton label="Consultando perfil do Codeforces" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      {!loading && data ? <>
        <Card style={styles.profile}>
          <Avatar initials={(data.user.handle ?? normalizedHandle).slice(0, 2).toUpperCase()} size={68} />
          <Text accessibilityRole="header" style={styles.handle}>{data.user.handle}</Text>
          <Text style={styles.rank}>{data.user.rank ?? 'Unrated'}</Text>
          <Text style={styles.caption}>Conta Codeforces</Text>
        </Card>
        <SectionTitle>Desempenho competitivo</SectionTitle>
        <Card>
          <View style={styles.stats}>
            <Stat label="Rating atual" value={data.user.rating ?? '—'} />
            <Stat label="Maior rating" value={data.user.maxRating ?? '—'} />
          </View>
          <View style={styles.stats}>
            <Stat label="Problemas resolvidos" value={data.solvedCount} />
            <Stat label="Contests" value={data.contestCount} />
          </View>
        </Card>
        <SectionTitle>Tags com mais resoluções</SectionTitle>
        <Card>
          {data.tagStats.length ? data.tagStats.slice(0, 8).map((item) => (
            <View key={item.tag} style={styles.tagRow}>
              <Text style={styles.tag}>{item.tag}</Text>
              <Text style={styles.count}>{item.solved}</Text>
            </View>
          )) : <Text style={styles.caption}>Sem dados de tags na amostra de submissões.</Text>}
        </Card>
        <Text style={styles.caption}>Contagem calculada percorrendo o histórico público de submissões aceitas do Codeforces.</Text>
      </> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center' },
  handle: { color: colors.text, fontSize: 23, fontWeight: '800', marginTop: 10 },
  rank: { color: colors.primary, fontSize: 14, fontWeight: '700', marginTop: 5 },
  caption: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 12, paddingVertical: 10 },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  tag: { color: colors.text, fontWeight: '600' },
  count: { color: colors.primary, fontWeight: '800' },
});
