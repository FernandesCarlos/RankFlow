import React from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Card, Header, InfoBox, OutlineButton, PrimaryButton, Screen, SectionTitle } from '../../components/ui';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';
export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { training: currentTraining, trainingHistory, completedTrainingId, completeTraining } = useApp();
  const completed = trainingHistory.find(item => item.id === (id ?? completedTrainingId));
  const training = id ? completed : currentTraining;
  return <Screen>
    <Header title={completed ? "Resultado do treino" : "Treino gerado"} onBack={() => goBack('/(tabs)/treino')} />
    {!training ? <>
      <InfoBox>Não há treino nesta sessão. Escolha as opções para gerar uma lista.</InfoBox>
      <PrimaryButton title="Criar treino" onPress={() => router.replace('/(tabs)/treino')} />
    </> : <>
      {completed ? <>
        <InfoBox>Treino concluído em {new Date(completed.completedAt).toLocaleString('pt-BR')}. Resultados simulados; não representam submissões reais.</InfoBox>
        <SectionTitle>Resultado por participante</SectionTitle>
        {completed.results.map((result, index) => <Card key={result.participant}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{index + 1}º • {result.participant}</Text>
          <Text style={{ color: colors.muted, marginTop: 8 }}>{result.solved}/{completed.problems.length} resolvidos • {result.points} pontos</Text>
        </Card>)}
      </> : null}
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
      {!completed && !id ? <PrimaryButton title="Concluir treino demonstrativo" onPress={completeTraining} /> : null}
      <OutlineButton title="Ajustar opções do treino" onPress={() => goBack('/(tabs)/treino')} />
      <PrimaryButton title="Ver placar demonstrativo" onPress={() => { router.dismissTo('/(tabs)'); router.navigate('/(tabs)/placar'); }} />
    </>}
  </Screen>;
}
