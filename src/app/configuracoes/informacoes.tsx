import { ToggleRow } from '../../components/ToggleRow';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Switch, Text } from 'react-native';
import { Card, Header, InfoBox, Screen, SettingRow } from '../../components/ui';
import { goBack } from '../../navigation/actions';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/colors';
import { updatePublicProfileVisibility } from '../../services/profileApi';
const sections = {
  ajuda: { title: 'Ajuda e suporte', text: 'Use as abas inferiores para acessar Início, Amigos, Treino e Placar. Toque no avatar para abrir seu perfil. O botão Voltar retorna à tela anterior. Para ver estatísticas, abra Performance recente no Início. Em Treino, escolha opções e gere uma lista demonstrativa.' },
  sobre: { title: 'Sobre o RankFlow', text: 'RankFlow é um protótipo para programação competitiva, desenvolvido com React Native, Expo e Expo Router.' },
  idioma: { title: 'Idioma e aparência', text: 'Esta versão está disponível em Português (Brasil) e tema claro. O tamanho dos textos acompanha a configuração do sistema. As cores foram ajustadas para melhorar a leitura. Outros idiomas e tema escuro ainda não estão disponíveis.' },
  privacidade: { title: 'Privacidade', text: 'Escolha se seu avatar e suas informações básicas podem aparecer no perfil público RankFlow.' },
};
export default function InformacoesScreen() {
  const { secao } = useLocalSearchParams<{ secao?: string }>();
  const { publicProfile, setPublicProfile, setNotice } = useApp();
  const section = sections[secao as keyof typeof sections];
  return <Screen>
    <Header title={section?.title ?? 'Informação não encontrada'} onBack={() => goBack('/configuracoes')} />
    <Card><Text style={{ color: colors.text, fontSize: 16, lineHeight: 25 }}>{section?.text ?? 'Volte às configurações e selecione uma opção disponível.'}</Text></Card>
    {secao === 'privacidade' ? <>
      <ToggleRow title="Perfil visível" subtitle={publicProfile ? 'Avatar e informações básicas visíveis a outros competidores' : 'Somente você pode ver os dados da conta'} value={publicProfile}
        onChange={async value => {
          try {
            await updatePublicProfileVisibility(value);
            setPublicProfile(value);
            setNotice({ message: value ? 'Seu perfil RankFlow está público.' : 'Seu perfil RankFlow está privado.', tone: 'success' });
          } catch (error) {
            setNotice({ message: error instanceof Error ? error.message : 'Não foi possível atualizar a privacidade.', tone: 'danger' });
          }
        }}
      />
      <InfoBox>Quando o perfil está privado, outros competidores não conseguem consultar seu avatar sincronizado pelo RankFlow.</InfoBox>
    </> : null}
  </Screen>;
}
