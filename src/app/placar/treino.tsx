import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Header, InfoBox, Screen } from '../../components/ui';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';

export default function TrainingScoreboardScreen() {
  const { trainingHistory } = useApp();
  const rows = useMemo(() => {
    const totals = new Map<string, { solved: number; points: number; sessions: number }>();
    for (const training of trainingHistory) {
      for (const result of training.results) {
        const current = totals.get(result.participant) ?? { solved: 0, points: 0, sessions: 0 };
        current.solved += result.solved;
        current.points += result.points;
        current.sessions += 1;
        totals.set(result.participant, current);
      }
    }
    return [...totals.entries()]
      .map(([participant, stats]) => ({ participant, ...stats }))
      .sort((a, b) => b.points - a.points || b.solved - a.solved);
  }, [trainingHistory]);

  return (
    <Screen>
      <Header title="Placar dos treinos" onBack={() => router.back()} />
      <Text style={styles.title}>Desempenho nas sessões</Text>
      <Text style={styles.subtitle}>Resultados acumulados dos treinos concluídos no RankFlow neste dispositivo.</Text>
      {!rows.length ? <InfoBox>Você ainda não concluiu treinos com resultados registrados.</InfoBox> : rows.map((row, index) => (
        <Card key={row.participant} style={styles.row}>
          <Text style={styles.position}>{index + 1}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{row.participant}</Text>
            <Text style={styles.caption}>{row.solved} problemas · {row.sessions} sessões</Text>
          </View>
          <Text style={styles.points}>{row.points} pts</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 23, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  position: { color: colors.primary, fontSize: 18, fontWeight: '800', width: 22 },
  name: { color: colors.text, fontSize: 15, fontWeight: '800' },
  caption: { color: colors.muted, fontSize: 12, marginTop: 4 },
  points: { color: colors.text, fontSize: 16, fontWeight: '800' },
});
