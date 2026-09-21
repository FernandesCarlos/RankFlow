import React from 'react';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { Card, Header, InfoBox, OutlineButton, PrimaryButton, Screen, SectionTitle } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';
export default function ResultadoScreen() {
  const { training } = useApp();
  return <Screen>
    <Header title="Treino gerado" onBack={() => goBack('/(tabs)/treino')} />
    {!training ? <>
      <InfoBox>Não há treino nesta sessão. Escolha as opções para gerar uma lista.</InfoBox>
      <PrimaryButton title="Criar treino" onPress={() => router.replace('/(tabs)/treino')} />
    </> : <>
      <InfoBox tone="success">{`${training.problems.length} problemas demonstrativos gerados com sucesso.`}</InfoBox>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16 }}>Participantes: {training.participants.join(', ')}</Text>
        <Text style={{ color: colors.text, fontSize: 16, marginTop: 8 }}>Dificuldade: {training.min} a {training.max}</Text>
        <Text style={{ color: colors.text, fontSize: 16, marginTop: 8 }}>Tags: {training.tags.join(', ')}</Text>
      </Card>
      <SectionTitle>Lista de problemas</SectionTitle>
      {training.problems.map(problem => <Card key={problem.id}>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{problem.title}</Text>
        <Text style={{ color: colors.muted, fontSize: 15, marginTop: 8 }}>{problem.tag} • Dificuldade {problem.rating}</Text>
      </Card>)}
      <OutlineButton title="Ajustar opções do treino" onPress={() => goBack('/(tabs)/treino')} />
      <PrimaryButton title="Ver placar demonstrativo" onPress={() => { router.dismissTo('/(tabs)'); router.navigate('/(tabs)/placar'); }} />
    </>}
  </Screen>;
}
