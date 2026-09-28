import { MockData } from '../../components/LoadingSkeleton';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { Avatar, Card, Header, InfoBox, Screen, Stat, SectionTitle } from '../../components/ui';
import { mockFriends } from '../../mocks';
import { goBack } from '../../navigation/actions';
import { colors } from '../../theme/colors';
export default function AmigoScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const friend = mockFriends.find(item => item.handle === handle);
  return <Screen>
    <Header title="Perfil do amigo" onBack={() => goBack('/(tabs)/amigos')} />
<MockData label="Carregando perfil do amigo" resourceKey={handle}>    {friend ? <>
      <Card>
        <Avatar initials={friend.initials} size={64} />
        <Text accessibilityRole="header" style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginVertical: 12 }}>{friend.handle}</Text>
        <Text style={{ color: colors.primary, fontSize: 16, marginBottom: 12 }}>{friend.rank}</Text>
      </Card>
      <SectionTitle>Desempenho competitivo</SectionTitle>
      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primary }}>
        <Stat label="Rating atual" value={friend.rating} />
      </Card>
      <Card><Text style={{ color: colors.text, fontSize: 16 }}>{friend.activity}</Text></Card>
      <InfoBox>Perfil demonstrativo. Volte à lista para consultar outros amigos.</InfoBox>
    </> : <InfoBox tone="warning">Amigo não encontrado. Volte à lista e selecione um dos perfis disponíveis.</InfoBox>}
  </MockData></Screen>;
}
