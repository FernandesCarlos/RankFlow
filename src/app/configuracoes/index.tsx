import React from 'react';
import { router } from 'expo-router';
import { Card, Divider, Header, Screen, SettingRow, InfoBox } from '../../components/ui';
import { goBack } from '../../navigation/actions';
import { useApp } from '../../state/AppContext';

export default function ConfiguracoesScreen() {
  const { signOut } = useApp();
  const information = (secao: string) => router.push({ pathname: '/configuracoes/informacoes', params: { secao } });
  return <Screen>
    <Header title="Configurações" subtitle="Personalize o RankFlow" onBack={() => goBack('/perfil')} />
    <Card>
      <SettingRow title="Editar perfil" subtitle="Dados pessoais e bio" onPress={() => router.push('/perfil/editar')} />
      <Divider />
      <SettingRow title="Plataformas" subtitle="Gerenciar conta Codeforces" onPress={() => router.push('/configuracoes/plataformas')} />
      <Divider />
      <SettingRow title="Privacidade" subtitle="Visibilidade do perfil demonstrativo" onPress={() => information('privacidade')} />
    </Card>
    <Card>
      <SettingRow title="Notificações" subtitle="Escolher avisos e horários" onPress={() => router.push('/configuracoes/notificacoes')} />
      <Divider />
      <SettingRow title="Idioma e aparência" subtitle="Português (Brasil), tema claro" onPress={() => information('idioma')} />
    </Card>
    <Card>
      <SettingRow title="Ajuda e suporte" subtitle="Como navegar e testar" onPress={() => information('ajuda')} />
      <Divider />
      <SettingRow title="Sobre o RankFlow" subtitle="Etapa 3 — navegação, UX e acessibilidade" onPress={() => information('sobre')} />
      <Divider />
      <SettingRow title="Sair da conta" subtitle="Encerrar e limpar a sessão de demonstração" onPress={signOut} />
    </Card>
    <InfoBox>Perfil, preferências e treinos ficam na memória durante esta sessão. Não há envio de dados para um servidor.</InfoBox>
  </Screen>;
}
