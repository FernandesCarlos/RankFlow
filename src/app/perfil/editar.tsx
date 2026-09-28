import { goBack } from '../../navigation/actions';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Field,
  Header,
  InfoBox,
  PrimaryButton,
  Screen,
  TextButton,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';
import { validateProfile } from '../../services/forms';

export default function EditarPerfilScreen() {
  const { profile: mockProfile, setProfile, setNotice } = useApp();
  const [error, setError] = useState('');
  const [nome, setNome] = useState(mockProfile.name);
  const [username, setUsername] = useState(mockProfile.username);
  const [email, setEmail] = useState(mockProfile.email);
  const [bio, setBio] = useState(mockProfile.bio);
  const [handle, setHandle] = useState(mockProfile.codeforcesHandle);

  return (
    <Screen>
      <Header
        title="Editar perfil"
        subtitle="Atualize suas informações"
        onBack={() => goBack('/perfil')}
      />

      <Card style={styles.photoCard}>
        <Avatar initials={mockProfile.initials} size={66} />

        <View style={{ flex: 1 }}>
          <Text style={styles.photoTitle}>Foto do perfil</Text>
          <Text style={styles.photoDescription}>
            Avatar gerado a partir das iniciais do nome
          </Text>
        </View>


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

      <InfoBox>Alterações são mantidas nesta sessão após salvar. Voltar sem salvar descarta a edição.</InfoBox>
      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <PrimaryButton
        title="Salvar alterações"
        onPress={() => {
          const message = validateProfile({ name: nome, username, email });
          setError(message);
          if (message) return;
          const initials = nome.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
          setProfile(current => ({ ...current, name: nome.trim(), firstName: nome.trim().split(' ')[0], username: username.trim(), email: email.trim(), bio, editBio: bio, codeforcesHandle: handle.trim(), initials }));
          setNotice({ message: 'Perfil atualizado nesta sessão.', tone: 'success' });
          goBack('/perfil');
        }}
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
    fontSize: 14,
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
    fontSize: 14,
    lineHeight: 18,
    marginTop: 5,
    marginBottom: 12,
  },
});
