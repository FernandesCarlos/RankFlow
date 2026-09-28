import { ToggleRow } from '../../components/ToggleRow';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Switch, Text } from 'react-native';
import { Card, Header, InfoBox, Screen, SettingRow } from '../../components/ui';
import { goBack } from '../../navigation/actions';
import { useApp } from '../../state/AppContext';
import { colors } from '../../theme/colors';
const sections = {
  ajuda: { title: 'Ajuda e suporte', text: 'Use as abas inferiores para acessar Início, Amigos, Treino e Placar. Toque no avatar para abrir seu perfil. O botão Voltar retorna à tela anterior. Para ver estatísticas, abra Performance recente no Início. Em Treino, escolha opções e gere uma lista demonstrativa.' },
  sobre: { title: 'Sobre o RankFlow', text: 'RankFlow é um protótipo para programação competitiva, desenvolvido com React Native, Expo e Expo Router. Etapa 3: navegação em pilha, experiência do usuário e acessibilidade. Login, Codeforces, treinos e placar usam dados simulados.' },
  idioma: { title: 'Idioma e aparência', text: 'Esta versão está disponível em Português (Brasil) e tema claro. O tamanho dos textos acompanha a configuração do sistema. As cores foram ajustadas para melhorar a leitura. Outros idiomas e tema escuro ainda não estão disponíveis.' },
  privacidade: { title: 'Privacidade', text: 'A preferência abaixo é demonstrativa e fica apenas nesta sessão. Não há publicação de perfil nem comunicação com um servidor.' },
};
export default function InformacoesScreen() {
  const { secao } = useLocalSearchParams<{ secao?: string }>();
  const { publicProfile, setPublicProfile, setNotice } = useApp();
  const section = sections[secao as keyof typeof sections];
  return <Screen>
    <Header title={section?.title ?? 'Informação não encontrada'} onBack={() => goBack('/configuracoes')} />
    <Card><Text style={{ color: colors.text, fontSize: 16, lineHeight: 25 }}>{section?.text ?? 'Volte às configurações e selecione uma opção disponível.'}</Text></Card>
    {secao === 'privacidade' ? <>
      <ToggleRow title="Perfil visível" subtitle={publicProfile ? 'Visível na demonstração' : 'Privado na demonstração'} value={publicProfile}
        onChange={value => { setPublicProfile(value); setNotice({ message: value ? 'Perfil demonstrativo definido como visível.' : 'Perfil demonstrativo definido como privado.', tone: 'success' }); }}
      />
      <InfoBox>Reiniciar o aplicativo restaura as preferências de demonstração.</InfoBox>
    </> : null}
  </Screen>;
}
