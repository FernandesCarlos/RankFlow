import React, { useEffect, useState } from 'react';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Header,
  InfoBox,
  OutlineButton,
  Screen,
} from '../../components/ui';
import { LoadingSkeleton as DataLoadingSkeleton } from '../../components/LoadingSkeleton';
import { colors } from '../../theme/colors';
import { getCodeforcesUser, type CodeforcesUser } from '../../services/codeforcesApi';

export default function PlataformasScreen() {
  const { profile, setVerificationOrigin } = useApp();
  const [user, setUser] = useState<CodeforcesUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile.codeforcesHandle.trim()) {
      setUser(null);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    getCodeforcesUser(profile.codeforcesHandle)
      .then((result) => { if (active) { setUser(result); setError(''); } })
      .catch((err) => { if (active) { setUser(null); setError(err instanceof Error ? err.message : 'Não foi possível consultar o Codeforces.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [profile.codeforcesHandle]);

  return (
    <Screen>
      <Header title="Plataformas" subtitle="Contas vinculadas" onBack={() => goBack('/(tabs)')} />
      <Card style={styles.hero}>
        <Text style={styles.heroTitle}>Integração com Codeforces</Text>
        <Text style={styles.heroText}>O RankFlow consulta dados públicos do seu perfil e das suas submissões pela API do Codeforces.</Text>
      </Card>
      <Card style={styles.platform}>
        <View style={styles.platformIcon}><Text style={styles.platformInitials}>CF</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.platformName}>Codeforces</Text>
          {user ? <>
            <Text style={styles.description}>@{user.handle}</Text>
            <Text style={styles.description}>{user.rank ?? 'Unrated'} · Rating {user.rating ?? '—'}</Text>
          </> : <Text style={styles.description}>Nenhuma conta vinculada</Text>}
        </View>
      </Card>
      {loading ? <DataLoadingSkeleton label="Consultando conta Codeforces" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <OutlineButton title="Vincular ou trocar handle" onPress={() => {
        setVerificationOrigin('plataformas');
        router.push('/codeforces/verificar-conta');
      }} />
      <InfoBox>Outras plataformas não estão integradas. Nenhum dado de AtCoder, LeetCode ou outra plataforma é simulado nesta tela.</InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primarySoft, borderColor: '#BFDBFE' },
  heroTitle: { color: colors.primary, fontSize: 18, fontWeight: '800' },
  heroText: { color: colors.muted, lineHeight: 20, marginTop: 7 },
  platform: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  platformIcon: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  platformInitials: { color: colors.primary, fontWeight: '800' },
  platformName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  description: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
