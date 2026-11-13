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
import { registerAccount } from '../../services/auth';

export default function CadastroScreen() {
  const { setAuthenticated, setProfile, setNotice, verifiedHandle, setVerificationOrigin } = useApp();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');

  const verified = Boolean(verifiedHandle);
  async function register() {
    const message = validateRegistration({ name: nome, email, password: senha, confirmation: confirmacao });
    setError(message);
    if (message) return;
    setBusy(true);
    try {
      const result = await registerAccount({ name: nome.trim(), email: email.trim(), password: senha });
      setProfile(current => ({
        ...current,
        name: result.user.display_name || nome.trim(),
        firstName: (result.user.display_name || nome.trim()).split(' ')[0],
        email: result.user.email || email.trim(),
        codeforcesHandle: result.user.codeforces_handle || verifiedHandle || current.codeforcesHandle,
      }));
      setNotice({ message: 'Conta criada com sucesso.', tone: 'success' });
      setAuthenticated(true);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar sua conta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Header title="Cadastro" onBack={() => goBack('/(auth)/boas-vindas')} />
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
          placeholder="Mínimo de 8 caracteres"
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
        title={busy ? 'Criando conta…' : 'Criar conta'}
        onPress={register}
        disabled={busy}
        loading={busy}
      />

      <Text style={styles.notice}>
Sua senha será armazenada de forma protegida. Vincular o Codeforces é opcional e pode ser feito depois.
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
