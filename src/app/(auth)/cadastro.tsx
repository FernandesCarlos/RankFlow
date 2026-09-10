import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Field,
  OutlineButton,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function CadastroScreen() {
  const params = useLocalSearchParams<{
    verified?: string;
    handle?: string;
  }>();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const valido =
    nome.trim().length > 2 &&
    email.includes('@') &&
    senha.length >= 6 &&
    senha === confirmacao;

  const verified = params.verified === '1';

  return (
    <Screen>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>01 Cadastro</Text>
      </View>

      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>
        Junte-se ao RankFlow e evolua como programador.
      </Text>

      <View style={{ marginTop: 24 }}>
        <Field
          label="Nome completo"
          value={nome}
          onChangeText={setNome}
          placeholder="João da Silva"
        />
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="joao@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="••••••••••"
          secureTextEntry
        />
        <Field
          label="Confirmar senha"
          value={confirmacao}
          onChangeText={setConfirmacao}
          placeholder="••••••••••"
          secureTextEntry
        />
      </View>

      <Card
        style={{
          backgroundColor: verified ? colors.successSoft : colors.primarySoft,
          borderColor: verified ? '#BBE8C9' : '#BFDBFE',
        }}
      >
        <Text style={styles.codeforcesTitle}>
          {verified ? '✓ Codeforces verificado' : 'Verificação do Codeforces'}
        </Text>

        <Text style={styles.codeforcesText}>
          {verified
            ? `Conta ${params.handle ?? ''} verificada com sucesso.`
            : 'Você poderá verificar sua conta do Codeforces no próximo passo.'}
        </Text>

        <OutlineButton
          title={verified ? 'Verificar outra conta' : 'Ir para verificação'}
          onPress={() => router.push('/codeforces/verificar-conta')}
        />
      </Card>

      <PrimaryButton
        title="Criar conta"
        disabled={!valido}
        onPress={() => router.replace('/(tabs)')}
      />

      <Text style={styles.notice}>
        Você precisará verificar sua conta do Codeforces para participar de arenas.
      </Text>

      <Text style={styles.footer}>
        Já tem uma conta?{' '}
        <Text
          style={styles.link}
          onPress={() => router.replace('/(auth)/login')}
        >
          Entrar
        </Text>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stepBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 8,
    marginBottom: 16,
  },
  stepBadgeText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  codeforcesTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  codeforcesText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 4,
  },
  notice: {
    color: colors.muted,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
  },
  footer: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
  link: {
    color: colors.primary,
    fontWeight: '800',
  },
});
