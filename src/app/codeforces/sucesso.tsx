import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Header,
  InfoBox,
  OutlineButton,
  PrimaryButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockCodeforces } from '../../mocks';


export default function SucessoScreen() {
  const params = useLocalSearchParams<{
    handle?: string;
  }>();

  const handle = params.handle ?? mockCodeforces.verifiedProfile.defaultHandle;

  return (
    <Screen>
      <Header title="Conta verificada" onBack={() => router.back()} />

      <View style={styles.success}>
        <View style={styles.circle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.badge}>✓  VERIFICADO</Text>
        <Text style={styles.title}>
          Sua conta do Codeforces foi verificada com sucesso
        </Text>
      </View>

      <Card style={styles.profileCard}>
        <Avatar initials={mockCodeforces.verifiedProfile.initials} size={54} />

        <View style={{ flex: 1 }}>
          <Text style={styles.handle}>{handle}</Text>
          <Text style={styles.rank}>{mockCodeforces.verifiedProfile.rank}  •  Rating {mockCodeforces.verifiedProfile.rating}</Text>
        </View>

        <Text style={styles.connected}>● Conectado</Text>
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Dados importados</Text>
        <Text style={styles.cardSubtitle}>
          Informações sincronizadas do Codeforces
        </Text>

        <View style={{ marginTop: 10 }}>
          {mockCodeforces.importedData.map(({ icon, label, value }, index) => (
            <View
              key={label}
              style={[
                styles.importRow,
                index !== mockCodeforces.importedData.length - 1 && styles.importBorder,
              ]}
            >
              <Text style={styles.importIcon}>{icon}</Text>
              <Text style={styles.importLabel}>{label}</Text>
              <Text style={styles.importValue}>{value}</Text>
            </View>
          ))}
        </View>
      </Card>

      <PrimaryButton
        title="Concluir"
        onPress={() =>
          router.replace({
            pathname: '/(auth)/cadastro',
            params: {
              verified: '1',
              handle,
            },
          })
        }
      />

      <OutlineButton
        title="Ir para o perfil"
        onPress={() => router.replace('/perfil')}
      />

      <TextButton
        danger
        title="Desvincular conta"
        onPress={() => router.replace('/codeforces/verificar-conta')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  success: {
    alignItems: 'center',
    marginBottom: 18,
  },
  circle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#BBE8C9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: colors.success,
    fontSize: 38,
    fontWeight: '800',
  },
  badge: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 10,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '800',
    marginTop: 10,
    maxWidth: 310,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  handle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  rank: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  connected: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
  importRow: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  importBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  importIcon: {
    width: 25,
    color: colors.primary,
    fontWeight: '800',
  },
  importLabel: {
    flex: 1,
    color: colors.muted,
    fontSize: 12,
  },
  importValue: {
    color: colors.text,
    fontWeight: '800',
  },
});
