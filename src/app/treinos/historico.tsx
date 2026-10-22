
import React, { useState } from 'react';
import { router } from 'expo-router';
import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import { AccessiblePressable } from '../../components/AccessiblePressable';
import { MockData } from '../../components/LoadingSkeleton';
import {
  Card,
  Header,
  Screen,
  SectionTitle,
} from '../../components/ui';
import { goBack } from '../../navigation/actions';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/colors';

export default function HistoricoScreen() {
  const { trainingHistory, deleteTraining } = useApp();

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(
    null,
  );

  function confirmDelete(id: string) {
    setPendingDeleteId(id);
  }

  function cancelDelete() {
    setPendingDeleteId(null);
  }

  function handleDelete() {
    if (!pendingDeleteId) return;

    deleteTraining(pendingDeleteId);
    setPendingDeleteId(null);
  }

  return (
    <Screen>
      <Header
        title="Histórico de treinos"
        subtitle="Consulte seus treinos concluídos"
        onBack={() => goBack('/(tabs)/configuracoes')}
      />

      <SectionTitle>Treinos concluídos</SectionTitle>

      <MockData label="Carregando histórico">
        {!trainingHistory.length ? (
          <Card>
            <Text style={{ color: colors.muted }}>
              Nenhum treino concluído. Acesse a aba Treino, gere uma
              lista e conclua um treino para visualizar os resultados aqui.
            </Text>
          </Card>
        ) : (
          trainingHistory.map((item) => (
            <View key={item.id} style={{ marginBottom: 12 }}>
              <Card>
                <AccessiblePressable
                  accessibilityLabel={`Ver resultado do treino de ${new Date(
                    item.completedAt,
                  ).toLocaleString('pt-BR')}, ${item.problems.length} problemas`}
                  onPress={() =>
                    router.push({
                      pathname: '/treinos/resultado',
                      params: { id: item.id },
                    })
                  }
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 17,
                      fontWeight: '700',
                    }}
                  >
                    {item.problems.length} problemas • Concluído
                  </Text>

                  <Text
                    style={{
                      color: colors.muted,
                      marginTop: 8,
                    }}
                  >
                    {new Date(item.completedAt).toLocaleString('pt-BR')}
                  </Text>
                </AccessiblePressable>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      router.push({
                        pathname: '/treinos/resultado',
                        params: { id: item.id },
                      })
                    }
                    style={{ paddingVertical: 8, paddingRight: 12 }}
                  >
                    <Text style={{ color: colors.primary }}>
                      Ver resultado ›
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Excluir treino do histórico"
                    onPress={() => confirmDelete(item.id)}
                    hitSlop={8}
                    style={{
                      backgroundColor: '#FEE2E2',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      zIndex: 10,
                      elevation: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: '#B91C1C',
                        fontWeight: '700',
                      }}
                    >
                      Excluir
                    </Text>
                  </Pressable>
                </View>

                {pendingDeleteId === item.id && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#FECACA',
                      backgroundColor: '#FFF7F7',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontWeight: '600',
                        marginBottom: 12,
                      }}
                    >
                      Deseja realmente excluir este treino? Esta ação não
                      pode ser desfeita.
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        gap: 10,
                      }}
                    >
                      <Pressable
                        accessibilityRole="button"
                        onPress={cancelDelete}
                        style={{
                          paddingVertical: 9,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: colors.muted,
                        }}
                      >
                        <Text style={{ color: colors.text }}>
                          Cancelar
                        </Text>
                      </Pressable>

                      <Pressable
                        accessibilityRole="button"
                        onPress={handleDelete}
                        style={{
                          paddingVertical: 9,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: '#DC2626',
                        }}
                      >
                        <Text
                          style={{
                            color: '#FFFFFF',
                            fontWeight: '700',
                          }}
                        >
                          Confirmar exclusão
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </Card>
            </View>
          ))
        )}
      </MockData>
    </Screen>
  );
}
