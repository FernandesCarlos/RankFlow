import React from 'react';
import { Linking, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Card,
  Header,
  InfoBox,
  OutlineButton,
  PrimaryButton,
  Screen,
  SectionTitle,
} from '../../components/ui';
import { AccessiblePressable } from '../../components/AccessiblePressable';
import { useApp } from '../../state/AppContext';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';

export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const {
    training: currentTraining,
    trainingHistory,
    completedTrainingId,
    completeTraining,
  } = useApp();

  const completed = trainingHistory.find(
    (item) => item.id === (id ?? completedTrainingId),
  );
  const training = id ? completed : currentTraining;

  return (
    <Screen>
      <Header
        title={completed ? 'Treino salvo' : 'Treino gerado'}
        onBack={() => goBack('/(tabs)/treino')}
      />
      {!training ? <>
        <InfoBox>Não há treino nesta sessão. Escolha os filtros para gerar uma lista de problemas reais.</InfoBox>
        <PrimaryButton title="Criar treino" onPress={() => router.replace('/(tabs)/treino')} />
      </> : <>
        {completed ? (
          <InfoBox>Treino salvo no histórico em {new Date(completed.completedAt).toLocaleString('pt-BR')}. O RankFlow não simula submissões, pontuação ou resultados dos participantes.</InfoBox>
        ) : null}
        <Card>
          <Text style={{ color: colors.text, fontSize: 15 }}>
            Participantes selecionados: {training.participants.join(', ')}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, marginTop: 8 }}>
            Dificuldade: {training.min} a {training.max}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, marginTop: 8 }}>
            Tags: {training.tags.length ? training.tags.join(', ') : 'Todas as tags'}
          </Text>
        </Card>
        <SectionTitle>Problemas do Codeforces</SectionTitle>
        {training.problems.map((problem) => (
          <Card key={problem.id}>
            <AccessiblePressable
              accessibilityRole="link"
              accessibilityLabel={`Abrir ${problem.title} no Codeforces`}
              onPress={() => Linking.openURL(problem.url)}
            >
              <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '800' }}>
                {problem.contestId}{problem.index} · {problem.title} ↗
              </Text>
            </AccessiblePressable>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>
              Dificuldade {problem.rating} · {problem.tags.join(', ')}
            </Text>
          </Card>
        ))}
        {!completed && !id ? (
          <PrimaryButton title="Salvar treino no histórico" onPress={completeTraining} />
        ) : null}
        <OutlineButton title="Ajustar filtros" onPress={() => goBack('/(tabs)/treino')} />
        <PrimaryButton title="Voltar ao início" onPress={() => router.dismissTo('/(tabs)')} />
      </>}
    </Screen>
  );
}
