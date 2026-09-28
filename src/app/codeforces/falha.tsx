import { VerificationMissing } from '../../components/VerificationMissing';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
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


export default function FalhaScreen() {
  const { authenticated, verificationOrigin, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const params = useLocalSearchParams<{
    handle?: string;
    language?: string;
    problem?: string;
  }>();

  if (typeof params.handle !== 'string' || !params.handle.trim()) return <VerificationMissing />;
  return (
    <Screen>
      <Header
        title="Falha na verificação"
        onBack={() => goBack(origin)}
      />

      <View style={styles.hero}>
        <View style={styles.circle}>
          <Text style={styles.x}>✕</Text>
        </View>

        <Text accessibilityRole="header" style={styles.title}>
          Não foi possível verificar a conta
        </Text>
        <Text style={styles.subtitle}>
          Não detectamos uma submissão válida dentro do tempo limite estabelecido.
        </Text>
      </View>

      <Card>
        <Text style={styles.cardTitle}>▤  Resumo da tentativa</Text>

        <Summary label="Handle" value={params.handle ?? mockCodeforces.profile.handle} icon="♙" />
        <Summary label="Problema" value={params.problem ?? mockCodeforces.verificationProblem.displayName} icon="▤" />
        <Summary label="Linguagem" value={params.language ?? mockCodeforces.languages[0]} icon="</>" />
        <Summary label="Status" value="Tempo esgotado" icon="✕" danger />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>i  Possíveis motivos</Text>

        {mockCodeforces.failureReasons.map((reason) => (
          <View key={reason} style={styles.reasonRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.reason}>{reason}</Text>
          </View>
        ))}
      </Card>

      <PrimaryButton
        title="Tentar novamente"
        onPress={() => router.dismissTo('/codeforces/verificar-conta')}
      />

      <OutlineButton
        title="Editar dados"
        onPress={() => router.dismissTo('/codeforces/verificar-conta')}
      />

      <TextButton
        title="Voltar à tela de origem"
        onPress={() => router.dismissTo(origin)}
      />
    </Screen>
  );
}

function Summary({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: string;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryIcon, danger && { color: colors.danger }]}>
        {icon}
      </Text>

      <View style={{ flex: 1 }}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, danger && { color: colors.danger }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  x: {
    color: colors.danger,
    fontSize: 34,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryIcon: {
    width: 28,
    color: colors.primary,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 3,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 11,
  },
  bullet: {
    color: colors.danger,
    fontWeight: '800',
  },
  reason: {
    color: colors.muted,
    flex: 1,
    lineHeight: 19,
    fontSize: 14,
  },
});
