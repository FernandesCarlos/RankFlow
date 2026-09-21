import { useApp } from '../../state/AppContext';
import { validateRegistration } from '../../services/forms';
import { goBack } from '../../navigation/actions';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Field,
  Header,
  InfoBox,
  TextButton,
  OutlineButton,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function CadastroScreen() {
  const { setAuthenticated, setProfile, setNotice, verifiedHandle, setVerificationOrigin } = useApp();
  const [error, setError] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const verified = Boolean(verifiedHandle);
  function register() {
    const message = validateRegistration({ name: nome, email, password: senha, confirmation: confirmacao });
    setError(message);
    if (message) return;
    setProfile(current => ({ ...current, name: nome.trim(), firstName: nome.trim().split(' ')[0], email: email.trim(), codeforcesHandle: verifiedHandle || current.codeforcesHandle }));
    setNotice({ message: 'Conta de demonstração criada nesta sessão. Os dados não são enviados a um servidor.', tone: 'success' });
    setAuthenticated(true);
  }

  return (
    <Screen>
      <Header title="Cadastro" onBack={() => goBack('/(auth)/boas-vindas')} />
      <InfoBox>Cadastro demonstrativo. Use dados e senha fictícios.</InfoBox>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>01 Cadastro</Text>
      </View>

      <Text accessibilityRole="header" style={styles.title}>Criar conta</Text>
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
            ? `Conta ${verifiedHandle} verificada com sucesso.`
            : 'Você poderá verificar sua conta do Codeforces no próximo passo.'}
        </Text>

        <OutlineButton
          title={verified ? 'Verificar outra conta' : 'Ir para verificação'}
          onPress={() => { setVerificationOrigin('cadastro'); router.push('/codeforces/verificar-conta'); }}
        />
      </Card>

      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <PrimaryButton
        title="Criar conta"
        onPress={register}
      />

      <Text style={styles.notice}>
        Você precisará verificar sua conta do Codeforces para participar de arenas.
      </Text>

      <TextButton title="Já tenho conta: entrar" onPress={() => router.dismissTo('/(auth)/login')} />
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
    fontSize: 14,
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
    fontSize: 14,
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
