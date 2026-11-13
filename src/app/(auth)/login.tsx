import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Field,
  Header,
  InfoBox,
  OutlineButton,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { loginAccount } from '../../services/auth';

export default function LoginScreen() {
  const { setAuthenticated, setProfile, setNotice } = useApp();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  async function enter() {
    if (!login.trim() || !senha) { setError('Informe seu e-mail e sua senha.'); return; }
    setBusy(true);
    setError('');
    try {
      const result = await loginAccount({ email: login, password: senha });
      setProfile((current) => ({
        ...current,
        name: result.user.display_name || '',
        firstName: (result.user.display_name || '').split(' ')[0],
        email: result.user.email || login.trim(),
        codeforcesHandle: result.user.codeforces_handle || '',
        rating: result.user.rating || 0,
      }));
      setAuthenticated(true);
      setNotice({ message: 'Login realizado com sucesso.', tone: 'success' });
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen contentStyle={styles.container}>
      <Header title="Login" onBack={() => goBack('/(auth)/boas-vindas')} />
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>R</Text>
        </View>
        <Text style={styles.brand}>RankFlow</Text>
      </View>

      <Text accessibilityRole="header" style={styles.title}>Entrar na sua conta</Text>
      <Text style={styles.subtitle}>
        Acesse seu perfil e continue seus treinos.
      </Text>

      <View style={{ marginTop: 26 }}>
        <Field
          label="E-mail cadastrado"
          value={login}
          onChangeText={setLogin}
          placeholder="voce@email.com"
          autoCapitalize="none"
        />

        <Field
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="••••••••"
          secureTextEntry
        />
      </View>

      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <PrimaryButton
        title={busy ? 'Entrando…' : 'Entrar'}
        onPress={enter}
        disabled={busy}
        loading={busy}
      />

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.or}>ou</Text>
        <View style={styles.line} />
      </View>

      <OutlineButton
        title="Continuar com uma nova conta"
        onPress={() => router.push('/(auth)/cadastro')}
      />

    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingTop: 48,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 30,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  brand: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: colors.border,
  },
  or: {
    color: colors.subtle,
    fontSize: 13,
  },
  footer: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 20,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
