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
  const [sent, setSent] = useState(false);

  return (
    <Screen>
      <Header
        title="Recuperar senha"
        onBack={() => router.back()}
      />

      <Text style={styles.title}>Vamos ajudar você a voltar</Text>

      <View style={styles.iconCircle}>
        <Text style={styles.icon}>✉</Text>
      </View>

      <Text style={styles.sectionTitle}>Informe seu e-mail</Text>
      <Text style={styles.description}>
        Enviaremos um link para você redefinir sua senha com segurança.
      </Text>

      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="carlos@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {sent ? (
        <InfoBox tone="success">
          Link enviado para o e-mail informado.
        </InfoBox>
      ) : null}

      <PrimaryButton
        title="Enviar link"
        onPress={() => setSent(true)}
      />

      <InfoBox>
        Não recebeu? Confira a caixa de spam ou tente novamente após alguns minutos.
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
