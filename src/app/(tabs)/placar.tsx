import { MockData } from '../../components/LoadingSkeleton';
import { useApp } from '../../state/AppContext';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  InfoBox,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockLiveScoreboard } from '../../mocks';
import { router } from 'expo-router';


export default function PlacarScreen() {
  const { profile: mockProfile } = useApp();
  return (
    <Screen>
      <InfoBox>Placar de exemplo: os valores são simulados e não atualizam em tempo real.</InfoBox>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text accessibilityRole="header" style={styles.title}>Placar ao vivo</Text>
          <Text style={styles.subtitle}>
            Treino #{mockLiveScoreboard.trainingNumber} • {mockLiveScoreboard.remainingTime} restantes
          </Text>
        </View>
         <Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}>
                  <Avatar initials={mockProfile.initials} size={40} />
                </Pressable>
      </View>

      <View style={styles.liveBadge}>
        <Text style={styles.liveText}>● DEMONSTRAÇÃO</Text>
      </View>

      <MockData label="Carregando placar">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerText, { width: 34 }]}>#</Text>
          <Text style={[styles.headerText, { flex: 1 }]}>Competidor</Text>
          <Text style={[styles.headerText, { width: 68, textAlign: 'right' }]}>
            Pontos
          </Text>
        </View>

        {mockLiveScoreboard.rows.map(({ position, competitor, solved, points }, index) => (
          <View
            key={competitor}
            style={[
              styles.tableRow,
              index !== mockLiveScoreboard.rows.length - 1 && styles.rowBorder,
            ]}
          >
            <Text style={[styles.position, { width: 34 }]}>
              {position}
            </Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.competitor}>{competitor}</Text>
              <Text style={styles.solved}>{solved}</Text>
            </View>

            <Text style={styles.points}>{points}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Última atualização</Text>
        <Text style={styles.updateText}>
          {mockLiveScoreboard.lastUpdate.text}
        </Text>
        <Text style={styles.updateGain}>
          {mockLiveScoreboard.lastUpdate.gain}
        </Text>
      </Card>

      <Card>
        <View style={styles.problemRow}>
          {mockLiveScoreboard.problems.map((problem) => (
            <View key={problem} style={styles.problem}>
              <Text style={styles.problemText}>{problem}</Text>
            </View>
          ))}
        </View>
      </Card>
    </MockData></Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  headingBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 16,
  },
  liveText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  tableHeader: {
    minHeight: 46,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
  },
  headerText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  tableRow: {
    minHeight: 69,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  position: {
    color: colors.text,
    fontWeight: '800',
  },
  competitor: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  solved: {
    color: colors.success,
    marginTop: 5,
    fontSize: 14,
  },
  points: {
    width: 68,
    textAlign: 'right',
    color: colors.text,
    fontWeight: '800',
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  updateText: {
    color: colors.text,
    marginTop: 10,
    fontWeight: '700',
  },
  updateGain: {
    color: colors.success,
    fontSize: 14,
    marginTop: 4,
  },
  problemRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  problem: {
    width: 54,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemText: {
    color: colors.primary,
    fontWeight: '800',
  },
});
