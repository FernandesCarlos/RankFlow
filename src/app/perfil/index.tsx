import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Header,
  OutlineButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockRecentActivities } from '../../mocks';

export default function PerfilScreen() {
  const { profile: mockProfile } = useApp();
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
        <Avatar initials={mockProfile.initials} size={84} />
        <Text style={styles.name}>{mockProfile.name}</Text>
        <Text style={styles.handle}>@{mockProfile.username}</Text>
        <Text style={styles.rank}>{mockProfile.rank} • {mockProfile.rating}</Text>
        <Text style={styles.bio}>{mockProfile.bio}</Text>
      </View>

      <View style={styles.quickRow}>
        <Quick label="Problemas" value={String(mockProfile.problemsSolved)} />
        <Quick label="Streak" value={`${mockProfile.streakDays} dias`} />
        <Quick label="Contests" value={String(mockProfile.contests)} />
      </View>

      <OutlineButton
        title="Editar perfil"
        onPress={() => router.push('/perfil/editar')}
      />

      <Text accessibilityRole="header" style={styles.sectionTitle}>Plataformas vinculadas</Text>

      <Pressable accessibilityLabel="Gerenciar plataformas vinculadas" onPress={() => router.push('/configuracoes/plataformas')}>
        <Card style={styles.platformCard}>
          <View style={styles.cfLogo}>
            <Text style={styles.cf}>CF</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.platformName}>Codeforces</Text>
            <Text style={styles.platformDescription}>
              {mockProfile.codeforcesHandle} • {mockProfile.rating}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      </Pressable>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Atividade recente</Text>

      <Card>
        {mockRecentActivities.map((activity, index) => (
          <Activity
            key={activity}
            text={activity}
            last={index === mockRecentActivities.length - 1}
          />
        ))}
      </Card>
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

function Activity({
  text,
  last = false,
}: {
  text: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.activity, !last && styles.activityBorder]}>
      <Text style={styles.activityText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settings: {
    fontSize: 23,
  },
  profile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '800',
    marginTop: 12,
  },
  handle: {
    color: colors.muted,
    marginTop: 3,
  },
  rank: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 5,
  },
  bio: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
    fontSize: 14,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 10,
  },
  quickCard: {
    flexGrow: 1,
    flexBasis: 90,
    minWidth: 86,
    minHeight: 74,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  quickValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 22,
    marginBottom: 10,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cfLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cf: {
    color: colors.primary,
    fontWeight: '800',
  },
  platformName: {
    color: colors.text,
    fontWeight: '800',
  },
  platformDescription: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  chevron: {
    color: colors.subtle,
    fontSize: 28,
  },
  activity: {
    paddingVertical: 11,
  },
  activityBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityText: {
    color: colors.text,
    fontSize: 13,
  },
});
