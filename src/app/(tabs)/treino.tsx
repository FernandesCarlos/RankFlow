import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Card,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { colors } from '../../theme/colors';
import { mockProfile, mockTraining } from '../../mocks';
import { router } from 'expo-router';

export default function TreinoScreen() {
  const [quantity, setQuantity] = useState(mockTraining.initialQuantity);
  const [selectedTags, setSelectedTags] = useState<string[]>([...mockTraining.initialSelectedTags]);
  const [min] = useState(mockTraining.difficulty.min);
  const [max] = useState(mockTraining.difficulty.max);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );
  }

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.headingBlock}>
          <Text style={styles.title}>Criar treino</Text>
          <Text style={styles.subtitle}>
            Monte uma competição em poucos passos
          </Text>
        </View>
         <Pressable onPress={() => router.push('/perfil')}>
                  <Avatar initials={mockProfile.initials} size={40} />
                </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Participantes</Text>
      <Card>
        <View style={styles.chipRow}>
          {mockTraining.participants.map((participant) => (
            <Chip
              key={participant.label}
              label={participant.label}
              selected={participant.selected}
            />
          ))}
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Dificuldade</Text>
      <Card>
        <View style={styles.difficultyRow}>
          <View>
            <Text style={styles.smallLabel}>Mínimo</Text>
            <Text style={styles.bigValue}>{min}</Text>
          </View>
          <Text style={styles.dash}>—</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.smallLabel}>Máximo</Text>
            <Text style={styles.bigValue}>{max}</Text>
          </View>
        </View>

        <View style={styles.rangeTrack}>
          <View style={styles.rangeFill} />
        </View>

        <View style={styles.rangeLabels}>
          <Text style={styles.rangeText}>{mockTraining.difficulty.scaleMin}</Text>
          <Text style={styles.rangeText}>{mockTraining.difficulty.scaleMiddle}</Text>
          <Text style={styles.rangeText}>{mockTraining.difficulty.scaleMax}</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Quantidade de problemas</Text>
      <Card>
        <View style={styles.quantityRow}>
          {mockTraining.quantityOptions.map((value) => (
            <Pressable
              key={value}
              onPress={() => setQuantity(value)}
              style={[
                styles.quantityButton,
                quantity === value && styles.quantitySelected,
              ]}
            >
              <Text
                style={[
                  styles.quantityText,
                  quantity === value && styles.quantityTextSelected,
                ]}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={styles.sectionLabel}>Tags</Text>
      <Card>
        <View style={styles.chipRow}>
          {mockTraining.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              selected={selectedTags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
          <Chip label="+tags" />
        </View>
      </Card>

      <PrimaryButton title="Gerar problemas" />
    </Screen>
  );
}

function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 26,
  },
  headingBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: '#BFD3FF',
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: colors.primary,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  smallLabel: {
    color: colors.muted,
    fontSize: 11,
  },
  bigValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 3,
  },
  dash: {
    color: colors.subtle,
    fontSize: 22,
  },
  rangeTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E9EEF5',
    marginTop: 16,
    overflow: 'hidden',
  },
  rangeFill: {
    height: '100%',
    width: '38%',
    marginLeft: '25%',
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  rangeText: {
    color: colors.subtle,
    fontSize: 10,
  },
  quantityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quantityButton: {
    flexGrow: 1,
    flexBasis: 58,
    minWidth: 52,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantitySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quantityText: {
    color: colors.text,
    fontWeight: '800',
  },
  quantityTextSelected: {
    color: '#FFFFFF',
  },
});
