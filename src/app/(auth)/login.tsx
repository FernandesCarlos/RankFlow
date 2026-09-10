import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Field,
  OutlineButton,
  PrimaryButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const [login, setLogin] = useState('carlos@email.com');
  const [senha, setSenha] = useState('');

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>R</Text>
        </View>
        <Text style={styles.brand}>RankFlow</Text>
      </View>

      <Text style={styles.title}>Entrar na sua conta</Text>
      <Text style={styles.subtitle}>
        Acesse seu perfil e continue seus treinos.
      </Text>

      <View style={{ marginTop: 26 }}>
        <Field
          label="E-mail ou usuário"
          value={login}
          onChangeText={setLogin}
          placeholder="carlos@email.com"
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

      <View style={{ alignItems: 'flex-end', marginTop: -6 }}>
        <TextButton
          title="Esqueci minha senha"
          onPress={() => router.push('/(auth)/recuperar-senha')}
        />
      </View>

      <PrimaryButton
        title="Entrar"
        onPress={() => router.replace('/(tabs)')}
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

      <Text style={styles.footer}>
        Ainda não tem conta?{' '}
        <Text
          style={styles.link}
          onPress={() => router.push('/(auth)/cadastro')}
        >
          Criar conta
        </Text>
      </Text>
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
