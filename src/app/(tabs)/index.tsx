import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  ProgressBar,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockHomePerformance, mockProfile } from '../../mocks';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text style={styles.title}>Olá, {mockProfile.firstName} 👋</Text>
          <Text style={styles.subtitle}>
            Seu treino de programação competitiva
          </Text>
        </View>

        <Pressable onPress={() => router.push('/perfil')}>
          <Avatar initials={mockProfile.initials} size={40} />
        </Pressable>
      </View>

      <Card>
        <View style={styles.profileRow}>
          <Avatar initials={mockProfile.initials} size={52} />

          <View style={{ flex: 1 }}>
            <Text style={styles.handle}>{mockProfile.username}</Text>
            <Text style={styles.rank}>{mockProfile.rank}</Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.ratingLabel}>Rating</Text>
            <Text style={styles.rating}>{mockProfile.rating}</Text>
            <Text style={styles.maxRating}>Máx. {mockProfile.maxRating}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Visão rápida</Text>

      <View style={styles.quickRow}>
        <QuickCard label="Problemas" value={String(mockProfile.problemsSolved)} />
        <QuickCard label="Streak" value={`${mockProfile.streakDays} dias`} />
        <QuickCard label="Contests" value={String(mockProfile.contests)} />
      </View>

      <Pressable onPress={() => router.push('/(tabs)/estatisticas')}>
        <Card>
          <View style={styles.performanceHeader}>
            <View>
              <Text style={styles.sectionTitleCard}>
                Performance recente
              </Text>
              <Text style={styles.performanceGain}>
                +{mockHomePerformance.gain} nos últimos {mockHomePerformance.contests} contests
              </Text>
            </View>

            <Text style={styles.more}>›</Text>
          </View>

          <View style={styles.chart}>
            {mockHomePerformance.chart.map((height, index) => (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  { height },
                ]}
              />
            ))}
          </View>

          <ProgressBar value={mockHomePerformance.progress} />
        </Card>
      </Pressable>
    </Screen>
  );
}

function QuickCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.quickCard}>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 26,
  },
  headingBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  handle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  rank: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 4,
    fontWeight: '700',
  },
  ratingLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  rating: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
  },
  maxRating: {
    color: colors.muted,
    fontSize: 11,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  quickCard: {
    flexGrow: 1,
    flexBasis: 90,
    minWidth: 86,
    height: 92,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: colors.muted,
    fontSize: 12,
  },
  quickValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 7,
  },
  sectionTitleCard: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceGain: {
    color: colors.success,
    fontSize: 13,
    marginTop: 5,
    fontWeight: '700',
  },
  more: {
    color: colors.muted,
    fontSize: 28,
  },
  chart: {
    height: 88,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  chartBar: {
    width: 22,
    borderRadius: 8,
    backgroundColor: '#9EBBFF',
  },
});
