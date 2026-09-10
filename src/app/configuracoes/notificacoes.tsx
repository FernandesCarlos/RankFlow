import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';
import {
  Card,
  Divider,
  Header,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function NotificacoesScreen() {
  const [allowed, setAllowed] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [contest, setContest] = useState(true);
  const [score, setScore] = useState(true);
  const [result, setResult] = useState(true);
  const [friends, setFriends] = useState(false);
  const [invites, setInvites] = useState(true);
  const [quiet, setQuiet] = useState(true);

  return (
    <Screen>
      <Header
        title="Notificações"
        subtitle="Escolha o que deseja receber"
        onBack={() => router.back()}
      />

      <Section title="Geral">
        <Toggle
          title="Permitir notificações"
          subtitle="Ativar avisos no aplicativo"
          value={allowed}
          onChange={setAllowed}
        />
        <Divider />
        <Toggle
          title="Resumo semanal"
          subtitle="Seu desempenho da semana"
          value={weekly}
          onChange={setWeekly}
        />
      </Section>

      <Section title="Competições">
        <Toggle
          title="Lembretes de contest"
          subtitle="Avisar antes do início"
          value={contest}
          onChange={setContest}
        />
        <Divider />
        <Toggle
          title="Atualização de placar"
          subtitle="Mudanças durante seus desafios"
          value={score}
          onChange={setScore}
        />
        <Divider />
        <Toggle
          title="Resultado final"
          subtitle="Avisar quando a competição acabar"
          value={result}
          onChange={setResult}
        />
      </Section>

      <Section title="Social">
        <Toggle
          title="Atividade de amigos"
          subtitle="Novos resultados e conquistas"
          value={friends}
          onChange={setFriends}
        />
        <Divider />
        <Toggle
          title="Convites para treino"
          subtitle="Quando alguém convidar você"
          value={invites}
          onChange={setInvites}
        />
      </Section>

      <Section title="Horário silencioso">
        <Toggle
          title="Não enviar notificações"
          subtitle="Entre 23:00 e 07:00"
          value={quiet}
          onChange={setQuiet}
        />
      </Section>
    </Screen>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Card>{children}</Card>
    </View>
  );
}

function Toggle({
  title,
  subtitle,
  value,
  onChange,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleSubtitle}>{subtitle}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  toggleRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 7,
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
});
