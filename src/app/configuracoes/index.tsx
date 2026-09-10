import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';
import {
  Card,
  Divider,
  Header,
  Screen,
  SettingRow,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function ConfiguracoesScreen() {
  const [dark, setDark] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <Screen>
      <Header
        title="Configurações"
        subtitle="Personalize o RankFlow"
        onBack={() => router.back()}
      />

      <Section title="Conta">
        <SettingRow
          icon="○"
          title="Perfil"
          subtitle="Dados pessoais e bio"
          onPress={() => router.push('/perfil/editar')}
        />
        <Divider />
        <SettingRow
          icon="#"
          title="Plataformas"
          subtitle="Codeforces, AtCoder e outras"
          onPress={() => router.push('/configuracoes/plataformas')}
        />
        <Divider />
        <SettingRow
          icon="⌁"
          title="Privacidade"
          subtitle="Visibilidade do perfil"
          onPress={() => {}}
        />
      </Section>

      <Section title="Preferências">
        <SettingRow
          icon="!"
          title="Notificações"
          subtitle="Treinos e competições"
          right={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="◐"
          title="Modo escuro"
          subtitle="Usar tema escuro"
          right={
            <Switch
              value={dark}
              onValueChange={setDark}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="A"
          title="Idioma"
          subtitle="Português (Brasil)"
          onPress={() => {}}
        />
      </Section>

      <Section title="Aplicativo">
        <SettingRow
          icon="?"
          title="Ajuda e suporte"
          subtitle="Perguntas frequentes"
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="i"
          title="Sobre o RankFlow"
          subtitle="Versão 0.1.0"
          onPress={() => {}}
        />
        <Divider />
        <SettingRow
          icon="↪"
          title="Sair da conta"
          onPress={() => router.replace('/(auth)/login')}
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

const styles = StyleSheet.create({
  sectionTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 7,
  },
});
