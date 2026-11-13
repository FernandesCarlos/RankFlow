import React, { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  Field,
  InfoBox,
  PrimaryButton,
  Screen,
  SectionTitle,
} from '../../components/ui';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { AccessiblePressable } from '../../components/AccessiblePressable';
import { colors } from '../../theme/colors';
import { useApp } from '../../state/AppContext';
import {
  generateCodeforcesTraining,
  getCodeforcesProblemTags,
  createTrainingSession,
} from '../../services/codeforcesApi';

export default function TreinoScreen() {
  const { profile, friendHandles, setTraining, hydrated } = useApp();
  const [quantity, setQuantity] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [min, setMin] = useState('1000');
  const [max, setMax] = useState('1500');
  const [duration, setDuration] = useState('60');
  const [loadingTags, setLoadingTags] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [tagError, setTagError] = useState('');

  const participantOptions = useMemo(
    () => [...new Set([profile.codeforcesHandle, ...friendHandles].filter(Boolean))],
    [profile.codeforcesHandle, friendHandles],
  );

  useEffect(() => {
    setParticipants((current) => {
      const valid = current.filter((handle) => participantOptions.includes(handle));
      return valid.length ? valid : [profile.codeforcesHandle].filter(Boolean);
    });
  }, [participantOptions, profile.codeforcesHandle]);

  useEffect(() => {
    let active = true;
    setLoadingTags(true);
    getCodeforcesProblemTags()
      .then((result) => {
        if (active) {
          setAvailableTags(result);
          setTagError('');
        }
      })
      .catch((err) => {
        if (active) {
          setTagError(err instanceof Error ? err.message : 'Não foi possível carregar as tags do Codeforces.');
        }
      })
      .finally(() => {
        if (active) setLoadingTags(false);
      });
    return () => { active = false; };
  }, []);

  function toggleValue(value: string, current: string[], setter: (next: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function generate() {
    const minRating = Number(min);
    const maxRating = Number(max);
    if (!Number.isInteger(quantity) || quantity < 3 || quantity > 6) {
      setError('Selecione entre 3 e 6 problemas.');
      return;
    }
    if (!Number.isInteger(minRating) || !Number.isInteger(maxRating) || minRating < 800 || maxRating > 4000 || minRating > maxRating) {
      setError('Informe uma faixa válida entre 800 e 4000, com dificuldade mínima menor ou igual à máxima.');
      return;
    }
    if (!profile.codeforcesHandle.trim()) {
      setError('Vincule seu handle do Codeforces nas configurações de plataformas antes de gerar um treino.');
      return;
    }
    if (!participants.includes(profile.codeforcesHandle)) {
      setError('Mantenha seu próprio handle entre os participantes do treino.');
      return;
    }

    const durationMinutes = Number(duration);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 5 || durationMinutes > 360) {
      setError('A duração deve ser um número inteiro entre 5 e 360 minutos.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const result = await generateCodeforcesTraining({
        handle: profile.codeforcesHandle,
        quantity,
        min: minRating,
        max: maxRating,
        tags,
      });
      const session = await createTrainingSession({
        creatorHandle: profile.codeforcesHandle,
        participants,
        problems: result.problems,
        durationMinutes,
      });
      setTraining({
        ...result,
        participants,
        durationMinutes,
        sessionId: session.id,
      });
      router.push('/treinos/resultado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível gerar o treino com problemas do Codeforces.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={styles.title}>Criar treino</Text>
          <Text style={styles.subtitle}>Monte uma lista com problemas reais do Codeforces</Text>
        </View>
        <AccessiblePressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}>
          <Avatar initials={profile.initials} />
        </AccessiblePressable>
      </View>

      <SectionTitle>Participantes</SectionTitle>
      <Card>
        <Text style={styles.description}>Selecione seu perfil e os handles de amigos cadastrados neste dispositivo.</Text>
        <View style={styles.row}>
          {participantOptions.map((handle) => (
            <Choice
              key={handle}
              label={handle}
              selected={participants.includes(handle)}
              onPress={() => toggleValue(handle, participants, setParticipants)}
            />
          ))}
        </View>
        {!friendHandles.length ? <Text style={styles.hint}>Você ainda não adicionou amigos. É possível criar um treino individual.</Text> : null}
      </Card>

      <SectionTitle>Dificuldade</SectionTitle>
      <Card>
        <Field label="Dificuldade mínima (800 a 4000)" value={min} onChangeText={setMin} keyboardType="number-pad" />
        <Field label="Dificuldade máxima (800 a 4000)" value={max} onChangeText={setMax} keyboardType="number-pad" />
      </Card>

      <SectionTitle>Quantidade de problemas</SectionTitle>
      <Card>
        <View style={styles.row}>
          {[3, 4, 5, 6].map((value) => (
            <Choice
              key={value}
              label={`${value} problemas`}
              selected={quantity === value}
              single
              onPress={() => setQuantity(value)}
            />
          ))}
        </View>
      </Card>

      <SectionTitle>Duração do treino</SectionTitle>
      <Card>
        <Field label="Tempo em minutos (5 a 360)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
        <Text style={styles.description}>O cronômetro começa assim que o treino é criado. O placar acompanha as tentativas registradas durante esse período.</Text>
      </Card>

      <SectionTitle>Tags do Codeforces</SectionTitle>
      {loadingTags ? <LoadingSkeleton label="Carregando tags disponíveis no Codeforces" /> : null}
      {tagError ? <InfoBox tone="danger">{tagError}</InfoBox> : null}
      {!loadingTags && !tagError ? <Card>
        <Text style={styles.description}>Sem tags selecionadas: qualquer categoria. Ao selecionar tags, o treino incluirá problemas que correspondam a pelo menos uma delas.</Text>
        <View style={styles.row}>
          {availableTags.map((tag) => (
            <Choice
              key={tag}
              label={tag}
              selected={tags.includes(tag)}
              onPress={() => toggleValue(tag, tags, setTags)}
            />
          ))}
        </View>
      </Card> : null}

      {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
      <InfoBox>Os problemas são consultados no problemset público do Codeforces. O RankFlow remove os problemas que já aparecem como resolvidos no histórico público do seu handle.</InfoBox>
      <PrimaryButton
        title={generating ? 'Criando competição…' : 'Gerar treino e iniciar cronômetro'}
        onPress={generate}
        disabled={!hydrated || generating || loadingTags || Boolean(tagError)}
        loading={generating}
      />
    </Screen>
  );
}

function Choice({
  label,
  selected,
  single = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  single?: boolean;
  onPress: () => void;
}) {
  return (
    <AccessiblePressable
      accessibilityRole={single ? 'radio' : 'checkbox'}
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.selected]}
    >
      <Text style={{ color: selected ? colors.primary : colors.text, fontSize: 14, fontWeight: '700' }}>
        {selected ? '✓ ' : ''}{label}
      </Text>
    </AccessiblePressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 6 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  choice: { paddingVertical: 11, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
});
