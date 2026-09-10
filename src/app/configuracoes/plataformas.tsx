import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Header,
  InfoBox,
  OutlineButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockPlatforms } from '../../mocks';

export default function PlataformasScreen() {
  return (
    <Screen>
      <Header
        title="Plataformas"
        subtitle="Gerencie suas contas"
        onBack={() => router.back()}
      />

      <Card
        style={{
          backgroundColor: colors.primarySoft,
          borderColor: '#BFDBFE',
        }}
      >
        <Text style={styles.heroTitle}>Uma conta, várias plataformas</Text>
        <Text style={styles.heroText}>
          Vincule seus perfis para reunir estatísticas em um único lugar.
        </Text>
      </Card>

      {mockPlatforms.map((platform) => (
        <Platform
          key={platform.name}
          {...platform}
          onPress={
            platform.name === 'Codeforces'
              ? () => router.push('/codeforces/verificar-conta')
              : undefined
          }
        />
      ))}

      <InfoBox>
        Mais integrações: novas plataformas poderão ser adicionadas conforme houver meios oficiais de acesso aos dados.
      </InfoBox>
    </Screen>
  );
}

function Platform({
  initials,
  name,
  description,
  status,
  connected = false,
  onPress,
}: {
  initials: string;
  name: string;
  description: string;
  status: string;
  connected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Card style={styles.platform}>
      <View style={styles.platformIcon}>
        <Text style={styles.platformInitials}>{initials}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.platformName}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <Text
        onPress={onPress}
        style={[
          styles.status,
          connected && { color: colors.success },
        ]}
      >
        {status}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  heroText: {
    color: colors.muted,
    lineHeight: 20,
    marginTop: 7,
  },
  platform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  platformIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformInitials: {
    color: colors.primary,
    fontWeight: '800',
  },
  platformName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  status: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
});
