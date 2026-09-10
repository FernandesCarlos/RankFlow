import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Field,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockFriends, mockProfile } from '../../mocks';
import { router } from 'expo-router';


export default function AmigosScreen() {
  const [query, setQuery] = useState('');

  const visible = mockFriends.filter((friend) =>
    friend.handle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text style={styles.title}>Amigos</Text>
          <Text style={styles.subtitle}>
            Acompanhe quem está treinando
          </Text>
        </View>
        <Pressable onPress={() => router.push('/perfil')}>
                 <Avatar initials={mockProfile.initials} size={40} />
               </Pressable>
      </View>

      <Field
        label=""
        value={query}
        onChangeText={setQuery}
        placeholder="⌕  Buscar handle..."
        autoCapitalize="none"
      />

      <Text style={styles.sectionTitle}>Seus amigos</Text>

      {visible.map((friend) => (
        <Card key={friend.handle} style={styles.friendCard}>
          <Avatar initials={friend.initials} size={46} />

          <View style={{ flex: 1 }}>
            <Text style={styles.handle}>{friend.handle}</Text>
            <Text style={styles.rank}>{friend.rank} • {friend.rating}</Text>
            <Text style={styles.activity}>{friend.activity}</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Card>
      ))}
    </Screen>
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
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  activity: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6,
  },
  chevron: {
    color: colors.subtle,
    fontSize: 28,
  },
});
