import { MockData } from '../components/LoadingSkeleton';
import { useApp } from '../state/AppContext';
import { goBack } from '../navigation/actions';
import { AccessiblePressable as Pressable } from '../components/AccessiblePressable';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Header,
  ProgressBar,
  Screen,
} from '../components/ui';
import { colors } from '../theme/colors';
import { mockStatistics } from '../mocks';
import { router } from 'expo-router';


export default function EstatisticasScreen() {
  const { profile: mockProfile } = useApp();
  const [tab, setTab] = useState<'tags' | 'rating'>('tags');

  return (
    <Screen>
      <Header title="Estatísticas" onBack={() => goBack()} />
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text accessibilityRole="header" style={styles.title}>Estatísticas</Text>
          <Text style={styles.subtitle}>
            Entenda onde você está evoluindo
          </Text>
        </View>
         <Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}>
                  <Avatar initials={mockProfile.initials} size={40} />
                </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          accessibilityRole="tab" accessibilityState={{ selected: tab === 'tags' }} onPress={() => setTab('tags')}
          style={[styles.tab, tab === 'tags' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'tags' && styles.tabTextActive,
            ]}
          >
            Tags
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab" accessibilityState={{ selected: tab === 'rating' }} onPress={() => setTab('rating')}
          style={[styles.tab, tab === 'rating' && styles.tabActive]}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'rating' && styles.tabTextActive,
            ]}
          >
            Rating
          </Text>
        </Pressable>
      </View>

      <MockData label="Carregando estatísticas">
        {tab === 'tags' ? (
        <>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Maestria por tags</Text>

          <Card>
            {mockStatistics.mastery.map(({ tag, value }, index) => (
              <View
                key={tag}
                style={[
                  styles.masteryRow,
                  index !== mockStatistics.mastery.length - 1 && { marginBottom: 18 },
                ]}
              >
                <View style={styles.masteryHeader}>
                  <Text style={styles.tag}>{tag}</Text>
                  <Text style={styles.percent}>{value}%</Text>
                </View>
                <ProgressBar value={value} label={`Maestria em ${tag}`} />
              </View>
            ))}
          </Card>

          <Card
            style={{
              backgroundColor: colors.primarySoft,
              borderColor: '#BFDBFE',
            }}
          >
            <Text style={styles.insightTitle}>Insight da semana</Text>
            <Text style={styles.insightText}>
              {mockStatistics.weeklyInsight.text}
            </Text>
            <Text style={styles.insightGain}>
              {mockStatistics.weeklyInsight.gain}
            </Text>
          </Card>
        </>
      ) : (
        <>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Evolução de rating</Text>

          <Card>
            <Text style={styles.ratingNow}>{mockStatistics.rating.current}</Text>
            <Text style={styles.ratingCaption}>
              +{mockStatistics.rating.gain} nos últimos {mockStatistics.rating.contests} contests
            </Text>

            <View style={styles.chart}>
              {mockStatistics.rating.chart.map((height, index) => (
                <View
                  key={index}
                  style={[styles.bar, { height }]}
                />
              ))}
            </View>
          </Card>
        </>
      )}
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
  tabs: {
    flexDirection: 'row',
    minHeight: 56,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#EEF2F7',
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
  },
  tabText: {
    color: colors.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.primary,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  masteryRow: {},
  masteryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tag: {
    color: colors.text,
    fontWeight: '700',
  },
  percent: {
    color: colors.primary,
    fontWeight: '800',
  },
  insightTitle: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  insightText: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 8,
  },
  insightGain: {
    color: colors.success,
    fontWeight: '700',
    marginTop: 4,
    fontSize: 13,
  },
  ratingNow: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
  },
  ratingCaption: {
    color: colors.success,
    marginTop: 4,
    fontWeight: '700',
  },
  chart: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginTop: 22,
  },
  bar: {
    width: 22,
    borderRadius: 7,
    backgroundColor: '#9EBBFF',
  },
});
