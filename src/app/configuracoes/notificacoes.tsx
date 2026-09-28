import { ToggleRow as Toggle } from '../../components/ToggleRow';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
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
  const { notifications, setNotifications, setNotice } = useApp();
  const { allowed, weekly, contest, score, result, friends, invites, quiet } = notifications;
  const update = (key: keyof typeof notifications, value: boolean) => {
    setNotifications(current => ({ ...current, [key]: value }));
    setNotice({ message: 'Preferência atualizada nesta sessão. Nenhuma notificação real será enviada.', tone: 'success' });
  };
  return (
    <Screen>
      <Header
        title="Notificações"
        subtitle="Escolha o que deseja receber"
        onBack={() => goBack('/(tabs)')}
      />

      <Section title="Geral">
        <Toggle
          title="Permitir notificações"
          subtitle="Ativar avisos no aplicativo"
          value={allowed}
          onChange={value => update('allowed', value)}
        />
        <Divider />
        <Toggle
          title="Resumo semanal"
          subtitle="Seu desempenho da semana"
          value={weekly}
          onChange={value => update('weekly', value)}
          disabled={!allowed}
        />
      </Section>

      <Section title="Competições">
        <Toggle
          title="Lembretes de contest"
          subtitle="Avisar antes do início"
          value={contest}
          onChange={value => update('contest', value)}
          disabled={!allowed}
        />
        <Divider />
        <Toggle
          title="Atualização de placar"
          subtitle="Mudanças durante seus desafios"
          value={score}
          onChange={value => update('score', value)}
          disabled={!allowed}
        />
        <Divider />
        <Toggle
          title="Resultado final"
          subtitle="Avisar quando a competição acabar"
          value={result}
          onChange={value => update('result', value)}
          disabled={!allowed}
        />
      </Section>

      <Section title="Social">
        <Toggle
          title="Atividade de amigos"
          subtitle="Novos resultados e conquistas"
          value={friends}
          onChange={value => update('friends', value)}
          disabled={!allowed}
        />
        <Divider />
        <Toggle
          title="Convites para treino"
          subtitle="Quando alguém convidar você"
          value={invites}
          onChange={value => update('invites', value)}
          disabled={!allowed}
        />
      </Section>

      <Section title="Horário silencioso">
        <Toggle
          title="Não enviar notificações"
          subtitle="Entre 23:00 e 07:00"
          value={quiet}
          onChange={value => update('quiet', value)}
          disabled={!allowed}
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
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      <Card>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.muted,
    fontSize: 14,
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
    fontSize: 14,
    marginTop: 4,
  },
});
