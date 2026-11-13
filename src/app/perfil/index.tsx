import React, { useEffect, useMemo, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import {
  Avatar,
  Card,
  Header,
  InfoBox,
  OutlineButton,
  Screen,
} from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';
import { getCodeforcesSummary, type CodeforcesSummary } from '../../services/codeforcesApi';

export default function PerfilScreen() {
  const { profile, hydrated } = useApp();
  const [data, setData] = useState<CodeforcesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hydrated) return;
    if (!profile.codeforcesHandle.trim()) {
      setData(null);
      setError('Vincule seu handle do Codeforces nas configurações de plataformas.');
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getCodeforcesSummary(profile.codeforcesHandle)
      .then((result) => {
        if (active) {
          setData(result);
          setError('');
        }
      })
      .catch((err) => {
        if (active) {
          setData(null);
          setError(err instanceof Error ? err.message : 'Não foi possível carregar o perfil do Codeforces.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [hydrated, profile.codeforcesHandle]);

  const activities = useMemo(() => {
    if (!data) return [];
    const ratingActivities = data.ratingHistory.slice(-3).reverse().map((item) => ({
      id: `contest-${item.contestId}`,
      text: `${item.contestName} • rating ${item.oldRating} → ${item.newRating}`,
      date: item.ratingUpdateTimeSeconds,
    }));
    if (data.lastSubmissionAt) {
      ratingActivities.unshift({
        id: 'submission-latest',
        text: 'Última submissão registrada no Codeforces',
        date: data.lastSubmissionAt,
      });
    }
    return ratingActivities.slice(0, 4);
  }, [data]);

  return (
    <Screen>
      <Header
        title="Meu perfil"
        subtitle="Dados e progresso"
        onBack={() => goBack('/(tabs)')}
        right={
          <Pressable accessibilityLabel="Abrir configurações" onPress={() => router.push('/configuracoes')}>
            <Text style={styles.settings}>⚙</Text>
          </Pressable>
        }
      />

      <View style={styles.profile}>
        <Avatar initials={profile.initials} size={84} />
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.handle}>@{profile.codeforcesHandle}</Text>
        <Text style={styles.rank}>
          {data?.user.rank ?? (loading ? 'Consultando Codeforces…' : 'Sem classificação')}
          {data?.user.rating != null ? ` • ${data.user.rating} rating` : ''}
        </Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      {!hydrated || loading ? <LoadingSkeleton label="Consultando estatísticas completas no Codeforces" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}

      {data ? <>
        <View style={styles.quickRow}>
          <Quick label="Problemas resolvidos" value={String(data.solvedCount)} />
          <Quick label="Rating atual" value={String(data.user.rating ?? '—')} />
          <Quick label="Contests" value={String(data.contestCount)} />
        </View>
        <View style={styles.quickRow}>
          <Quick label="Maior rating" value={String(data.user.maxRating ?? '—')} />
          <Quick label="Submissões" value={String(data.submissionCount)} />
        </View>
      </> : null}

      <OutlineButton
        title="Editar perfil"
        onPress={() => router.push('/perfil/editar')}
      />

      <Text accessibilityRole="header" style={styles.sectionTitle}>Plataformas vinculadas</Text>
      <Pressable accessibilityLabel="Gerenciar plataformas vinculadas" onPress={() => router.push('/configuracoes/plataformas')}>
        <Card style={styles.platformCard}>
          <View style={styles.cfLogo}><Text style={styles.cf}>CF</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.platformName}>Codeforces</Text>
            <Text style={styles.platformDescription}>
              {profile.codeforcesHandle}
              {data?.user.rating != null ? ` • ${data.user.rating} rating` : ''}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </Pressable>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Atividade recente no Codeforces</Text>
      {data && activities.length ? <Card>
        {activities.map((activity, index) => (
          <View key={activity.id} style={[styles.activity, index < activities.length - 1 && styles.activityBorder]}>
            <Text style={styles.activityText}>{activity.text}</Text>
            <Text style={styles.activityDate}>{new Date(activity.date * 1000).toLocaleString('pt-BR')}</Text>
          </View>
        ))}
      </Card> : null}
      {data && !activities.length ? <InfoBox>Não há contests ou submissões públicas para mostrar.</InfoBox> : null}
      <OutlineButton title="Abrir perfil no Codeforces" onPress={() => Linking.openURL(`https://codeforces.com/profile/${encodeURIComponent(profile.codeforcesHandle)}`)} />
    </Screen>
  );
}

function Quick({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.quickCard}>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settings: { fontSize: 23 },
  profile: { alignItems: 'center', marginBottom: 20 },
  name: { color: colors.text, fontSize: 23, fontWeight: '800', marginTop: 12 },
  handle: { color: colors.muted, marginTop: 3 },
  rank: { color: colors.primary, fontWeight: '700', marginTop: 5 },
  bio: { color: colors.muted, textAlign: 'center', lineHeight: 19, fontSize: 14, marginTop: 10, paddingHorizontal: 16 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 9 },
  quickCard: { flexGrow: 1, flexBasis: 100, minWidth: 90, minHeight: 74, paddingVertical: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  quickValue: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  platformCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cfLogo: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  cf: { color: colors.primary, fontWeight: '800' },
  platformName: { color: colors.text, fontWeight: '800' },
  platformDescription: { color: colors.muted, fontSize: 14, marginTop: 4 },
  chevron: { color: colors.subtle, fontSize: 28 },
  activity: { paddingVertical: 11 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  activityText: { color: colors.text, fontSize: 13 },
  activityDate: { color: colors.muted, fontSize: 11, marginTop: 5 },
});
