import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Field,
  Header,
  PrimaryButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockProfile } from '../../mocks';

export default function EditarPerfilScreen() {
  const [nome, setNome] = useState(mockProfile.name);
  const [username, setUsername] = useState(mockProfile.username);
  const [email, setEmail] = useState(mockProfile.email);
  const [bio, setBio] = useState(mockProfile.editBio);
  const [handle, setHandle] = useState(mockProfile.codeforcesHandle);

  return (
    <Screen>
      <Header
        title="Editar perfil"
        subtitle="Atualize suas informações"
        onBack={() => router.back()}
      />

      <Card style={styles.photoCard}>
        <Avatar initials={mockProfile.initials} size={66} />

        <View style={{ flex: 1 }}>
          <Text style={styles.photoTitle}>Foto do perfil</Text>
          <Text style={styles.photoDescription}>
            Alterar imagem ou usar iniciais
          </Text>
        </View>

        <TextButton title="Alterar foto" />
      </Card>

      <Field label="Nome" value={nome} onChangeText={setNome} />
      <Field
        label="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <Field
        label="Handle do Codeforces"
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
      />

      <Text style={styles.competitiveTitle}>Conta competitiva</Text>
      <Text style={styles.helper}>
        O handle é usado para sincronizar rating, submissões e histórico.
      </Text>

      <PrimaryButton
        title="Salvar alterações"
        onPress={() => router.back()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoTitle: {
    color: colors.text,
    fontWeight: '800',
  },
  photoDescription: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  competitiveTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: -4,
  },
  helper: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 12,
  },
});
