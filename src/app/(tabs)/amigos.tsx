import { MockData } from '../../components/LoadingSkeleton';
import { useApp } from '../../state/AppContext';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Field,
  InfoBox,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockFriends } from '../../mocks';
import { router } from 'expo-router';


export default function AmigosScreen() {
  const { profile: mockProfile } = useApp();
  const [query, setQuery] = useState('');

  const visible = mockFriends.filter((friend) =>
    friend.handle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text accessibilityRole="header" style={styles.title}>Amigos</Text>
          <Text style={styles.subtitle}>
            Acompanhe quem está treinando
          </Text>
        </View>
        <Pressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}>
                 <Avatar initials={mockProfile.initials} size={40} />
               </Pressable>
      </View>

      <Field
        label="Buscar amigo pelo handle"
        value={query}
        onChangeText={setQuery}
        placeholder="⌕  Buscar handle..."
        autoCapitalize="none"
      />

      <Text accessibilityRole="header" style={styles.sectionTitle}>Seus amigos</Text>

<MockData label="Carregando amigos">      {!visible.length ? <InfoBox>Nenhum amigo encontrado. Tente outro handle ou limpe a busca.</InfoBox> : null}
      {visible.map((friend) => (
        <Pressable key={friend.handle} accessibilityLabel={`Ver perfil de ${friend.handle}, rating ${friend.rating}`} onPress={() => router.push({ pathname: '/amigos/[handle]', params: { handle: friend.handle } })}>
        <Card style={styles.friendCard}>
          <Avatar initials={friend.initials} size={46} />

          <View style={{ flex: 1 }}>
            <Text style={styles.handle}>{friend.handle}</Text>
            <Text style={styles.rank}>{friend.rank} • {friend.rating}</Text>
            <Text style={styles.activity}>{friend.activity}</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Card>
        </Pressable>
      ))}
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  handle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  rank: {
    color: colors.primary,
    fontSize: 14,
    marginTop: 3,
    fontWeight: '600',
  },
  activity: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  chevron: {
    color: colors.subtle,
    fontSize: 28,
  },
});
