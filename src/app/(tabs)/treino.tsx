import React, { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Field, InfoBox, PrimaryButton, Screen, SectionTitle } from '../../components/ui';
import { AccessiblePressable } from '../../components/AccessiblePressable';
import { colors } from '../../theme/colors';
import { mockFriends, mockTraining } from '../../mocks';
import { createTraining } from '../../services/forms';
import { useApp } from '../../state/AppContext';

export default function TreinoScreen() {
  const { profile, setTraining } = useApp();
  const [quantity, setQuantity] = useState(mockTraining.initialQuantity);
  const [tags, setTags] = useState<string[]>([...mockTraining.initialSelectedTags]);
  const [participants, setParticipants] = useState(['Você', 'ana_cp']);
  const [min, setMin] = useState(String(mockTraining.difficulty.min));
  const [max, setMax] = useState(String(mockTraining.difficulty.max));
  const [error, setError] = useState('');
  function generate() {
    try {
      const training = createTraining({ quantity, tags, participants, min: Number(min), max: Number(max) });
      setTraining(training);
      setError('');
      router.push('/treinos/resultado');
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível gerar o treino. Tente novamente.'); }
  }
  return <Screen>
    <View style={styles.top}>
      <View style={{ flex: 1 }}><Text accessibilityRole="header" style={styles.title}>Criar treino</Text><Text style={styles.subtitle}>Escolha os problemas e participantes</Text></View>
      <AccessiblePressable accessibilityLabel="Abrir meu perfil" onPress={() => router.push('/perfil')}><Avatar initials={profile.initials} /></AccessiblePressable>
    </View>
    <SectionTitle>Participantes</SectionTitle>
    <Card><View style={styles.row}>
      {['Você', ...mockFriends.map(friend => friend.handle)].map(name => <Choice key={name} label={name} selected={participants.includes(name)} onPress={() => setParticipants(current => current.includes(name) ? current.filter(item => item !== name) : [...current, name])} />)}
    </View></Card>
    <SectionTitle>Dificuldade</SectionTitle>
    <Card>
      <Field label="Dificuldade mínima (800 a 3500)" value={min} onChangeText={setMin} keyboardType="number-pad" />
      <Field label="Dificuldade máxima (800 a 3500)" value={max} onChangeText={setMax} keyboardType="number-pad" />
    </Card>
    <SectionTitle>Quantidade de problemas</SectionTitle>
    <Card><View style={styles.row}>
      {mockTraining.quantityOptions.map(value => <Choice key={value} label={`${value} problemas`} selected={quantity === value} single onPress={() => setQuantity(value)} />)}
    </View></Card>
    <SectionTitle>Tags</SectionTitle>
    <Card><View style={styles.row}>
      {mockTraining.tags.map(tag => <Choice key={tag} label={tag} selected={tags.includes(tag)} onPress={() => setTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag])} />)}
    </View></Card>
    {error ? <InfoBox tone="danger">{error}</InfoBox> : null}
    <InfoBox>A lista gerada é demonstrativa. Não há consulta a problemas reais nem envio de convites.</InfoBox>
    <PrimaryButton title="Gerar problemas" onPress={generate} />
  </Screen>;
}
function Choice({ label, selected, single = false, onPress }: { label: string; selected: boolean; single?: boolean; onPress: () => void }) {
  return <AccessiblePressable accessibilityRole={single ? 'radio' : 'checkbox'} accessibilityLabel={label} accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.choice, selected && styles.selected]}>
    <Text style={{ color: selected ? colors.primary : colors.text, fontSize: 15, fontWeight: '700' }}>{selected ? '✓ ' : ''}{label}</Text>
  </AccessiblePressable>;
}
const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  choice: { paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
});
