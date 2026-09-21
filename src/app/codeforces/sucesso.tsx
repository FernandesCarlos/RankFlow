import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
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
  const { authenticated, verificationOrigin, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{
    handle?: string;
  }>();

  const handle = typeof params.handle === 'string' ? params.handle.trim() : '';
  if (!handle) return <VerificationMissing />;

  return (
    <Screen>
      <Header title="Conta verificada" onBack={() => router.dismissTo(origin)} />

      <View style={styles.success}>
        <View style={styles.circle}>
          <Text style={styles.check}>✓</Text>
        </View>

        <Text style={styles.badge}>✓  VERIFICADO</Text>
        <Text accessibilityRole="header" style={styles.title}>
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

      <InfoBox>Verificação simulada. Nenhuma conta real do Codeforces foi acessada.</InfoBox>
      <PrimaryButton title="Concluir e voltar" onPress={() => {
        setVerifiedHandle(handle);
        if (authenticated) setProfile(current => ({ ...current, codeforcesHandle: handle }));
        setNotice({ message: `Conta ${handle} verificada na demonstração.`, tone: 'success' });
        router.dismissTo(origin);
      }} />
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
    fontSize: 14,
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
    fontSize: 14,
    marginTop: 4,
  },
  connected: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 14,
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
    fontSize: 14,
  },
  importValue: {
    color: colors.text,
    fontWeight: '800',
  },
});
