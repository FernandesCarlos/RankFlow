import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { AccessiblePressable as Pressable } from '../../components/AccessiblePressable';
import React, { useState, useRef, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Card,
  Field,
  Header,
  InfoBox,
  PrimaryButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { findCodeforcesUser } from '../../services/codeforces';
import { mockCodeforces } from '../../mocks';

export default function VerificarContaScreen() {
  const { authenticated, verificationOrigin, setVerifiedHandle, setProfile, setNotice } = useApp();
  const origin = authenticated || verificationOrigin === 'plataformas' ? '/configuracoes/plataformas' : '/(auth)/cadastro';
  const [handle, setHandle] = useState('');
  const [languageIndex, setLanguageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const language = mockCodeforces.languages[languageIndex];

  const active = useRef(false);
  const busy = useRef(false);
  useFocusEffect(useCallback(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []));
  async function confirm() {
    if (busy.current || !handle.trim()) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      const profile = await findCodeforcesUser(handle);
      if (!active.current) return;
      if (!profile) { setError('Não encontramos esse usuário. Confira o handle e tente novamente.'); return; }
      router.push({ pathname: '/codeforces/conta-encontrada', params: {
        handle: profile.handle, rating: String(profile.rating), ranking: profile.ranking,
        memberSince: String(profile.memberSince), language,
      } });
    } catch {
      if (active.current) setError('Não foi possível consultar a conta. Tente novamente.');
    } finally {
      busy.current = false;
      if (active.current) setLoading(false);
    }
  }

  return (
    <Screen>
      <Header
        title="Verificar conta do Codeforces"
        onBack={() => goBack(origin)}
      />

      <Text style={styles.subtitle}>
        Informe seus dados do Codeforces para iniciarmos a verificação.
      </Text>

      <InfoBox>
        Modo demonstração: a busca e a verificação são simuladas. Use “naoexiste” para testar uma conta não encontrada.
      </InfoBox>

      <Field
        label="Handle do Codeforces"
        value={handle}
        onChangeText={setHandle}
        placeholder="♙  Ex.: tourist"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Linguagem da submissão</Text>

      <Pressable
        accessibilityLabel={`Linguagem da submissão: ${language}`}
        accessibilityHint="Ative para selecionar a próxima linguagem"
        onPress={() =>
          setLanguageIndex((current) => (current + 1) % mockCodeforces.languages.length)
        }
        style={styles.select}
      >
        <Text style={styles.selectText}>{'</>'}  {language}</Text>
        <Text style={styles.caret}>⌄</Text>
      </Pressable>

      <Text accessibilityRole="header" style={styles.sectionTitle}>?  O que acontece depois?</Text>

      <Card>
        <Step
          icon="🔍"
          text="Encontraremos sua conta no Codeforces."
        />
        <Step
          icon="⚙"
          text="Geraremos um desafio de verificação."
        />
        <Step
          icon="⏱"
          text="O timer de verificação será iniciado."
          last
        />
      </Card>

      {loading ? <LoadingSkeleton label="Buscando conta Codeforces" /> : null}
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}

      <PrimaryButton
        title={loading ? 'Procurando...' : 'Confirmar dados'}
        disabled={!handle.trim()}
        loading={loading}
        onPress={confirm}
      />

      <TextButton title="Cancelar" onPress={() => goBack(origin)} />
    </Screen>
  );
}

function Step({
  icon,
  text,
  last = false,
}: {
  icon: string;
  text: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.step, !last && styles.stepBorder]}>
      <Text style={styles.stepIcon}>{icon}</Text>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: -8,
    marginBottom: 18,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 7,
  },
  select: {
    minHeight: 52,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 22,
  },
  selectText: {
    color: colors.text,
    fontWeight: '600',
  },
  caret: {
    color: colors.muted,
    fontSize: 20,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
    marginBottom: 10,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepIcon: {
    width: 28,
    fontSize: 17,
  },
  stepText: {
    flex: 1,
    color: colors.text,
    lineHeight: 19,
    fontSize: 13,
  },
});
