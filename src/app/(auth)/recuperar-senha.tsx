import { isEmail } from '../../services/forms';
import { goBack } from '../../navigation/actions';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Field,
  Header,
  InfoBox,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';

export default function RecuperarSenhaScreen() {
  const [email, setEmail] = useState('carlos@email.com');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <Screen>
      <Header
        title="Recuperar senha"
        onBack={() => goBack('/(auth)/login')}
      />

      <Text accessibilityRole="header" style={styles.title}>Vamos ajudar você a voltar</Text>

      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✉</Text>
      </View>

      <Text accessibilityRole="header" style={styles.sectionTitle}>Informe seu e-mail</Text>
      <Text style={styles.description}>
        Demonstração de recuperação de senha. Nenhum e-mail será enviado.
      </Text>

      <Field
        label="E-mail"
        value={email}
        onChangeText={value => { setEmail(value); setSent(false); setError(''); }}
        placeholder="carlos@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {sent ? (
        <InfoBox tone="success">
          Solicitação simulada com sucesso. Nenhum e-mail foi enviado.
        </InfoBox>
      ) : null}

      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <PrimaryButton
        title="Enviar link"
        onPress={() => { if (!isEmail(email)) { setError('Informe um e-mail válido, como nome@exemplo.com.'); return; } setError(''); setSent(true); }}
      />

      <InfoBox>
        Você pode voltar ao login usando o botão no topo da tela.
      </InfoBox>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 22,
  },
});
