import { renderRouter, screen, fireEvent, waitFor, act } from 'expo-router/testing-library';
import { router } from 'expo-router';

async function login() {
  renderRouter('./src/app', { initialUrl: '/login' });
  fireEvent.changeText(screen.getByLabelText('Senha'), 'demonstracao');
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(screen.getByText(/Olá,/)).toBeTruthy());
  if (screen.queryByRole('button', { name: 'Fechar mensagem' })) fireEvent.press(screen.getByRole('button', { name: 'Fechar mensagem' }));
}

test('login validates empty credentials and removes auth history', async () => {
  renderRouter('./src/app', { initialUrl: '/login' });
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  expect(screen.getByText('Informe seu usuário e sua senha para continuar.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Senha'), 'demonstracao');
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
  await waitFor(() => expect(screen.getByText(/Olá,/)).toBeTruthy());
  expect(screen.queryByLabelText('Senha')).toBeNull();
});

test('profile save is reflected after stack back and logout prevents access', async () => {
  await login();
  fireEvent.press(screen.getByRole('button', { name: 'Abrir meu perfil' }));
  fireEvent.press(screen.getByRole('button', { name: 'Editar perfil' }));
  fireEvent.changeText(screen.getByLabelText('Nome', { exact: true }), 'Carlos Teste');
  fireEvent.press(screen.getByRole('button', { name: 'Salvar alterações' }));
  await waitFor(() => expect(screen.getByText('Carlos Teste')).toBeTruthy());
  expect(screen.getByText('Perfil atualizado nesta sessão.')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Abrir configurações' }));
  fireEvent.press(screen.getByRole('button', { name: /Sair da conta/ }));
  await waitFor(() => expect(screen.getByText('Treine melhor. Evolua com dados.')).toBeTruthy());
  act(() => router.push('/perfil'));
  await waitFor(() => expect(screen.queryByText('Meu perfil')).toBeNull());
});

test('training uses selected options and back preserves the form', async () => {
  await login();
  act(() => router.navigate('/(tabs)/treino'));
  fireEvent.press(screen.getByRole('radio', { name: '3 problemas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Gerar problemas' }));
  await waitFor(() => expect(screen.getByText('3 problemas demonstrativos gerados com sucesso.')).toBeTruthy());
  expect(screen.getByText('Exercício demonstrativo 3')).toBeTruthy();
  expect(screen.queryByText('Exercício demonstrativo 4')).toBeNull();
  fireEvent.press(screen.getByRole('button', { name: 'Ajustar opções do treino' }));
  expect(screen.getByRole('radio', { name: '3 problemas' })).toBeChecked();
});

test('Codeforces completion returns to the existing registration with data preserved', async () => {
  renderRouter('./src/app', { initialUrl: '/cadastro' });
  fireEvent.changeText(screen.getByLabelText('Nome completo'), 'Teste Cadastro');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'teste@example.com');
  fireEvent.press(screen.getByRole('button', { name: 'Ir para verificação' }));
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'tourist');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  await waitFor(() => expect(screen.getByText('Conta encontrada!')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Iniciar verificação' }));
  fireEvent.press(screen.getByRole('button', { name: 'Já enviei / Atualizar status' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Concluir e voltar' })).toBeTruthy(), { timeout: 3000 });
  fireEvent.press(screen.getByRole('button', { name: 'Concluir e voltar' }));
  await waitFor(() => expect(screen.getByLabelText('Nome completo')).toHaveDisplayValue('Teste Cadastro'));
  expect(screen.getByLabelText('E-mail')).toHaveDisplayValue('teste@example.com');
  expect(screen.getByText('✓ Codeforces verificado')).toBeTruthy();
});

test('direct verification result without a handle cannot link an arbitrary account', () => {
  renderRouter('./src/app', { initialUrl: '/codeforces/sucesso' });
  expect(screen.getByText('Informe um handle para iniciar a verificação.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Concluir e voltar' })).toBeNull();
});

test('notification switch has a full-row touch target and preserves preference after back', async () => {
  await login();
  act(() => router.push('/configuracoes/notificacoes'));
  const toggle = screen.getByRole('switch', { name: 'Permitir notificações' });
  expect(toggle).toHaveStyle({ minHeight: 48 });
  fireEvent.press(toggle);
  expect(screen.getByRole('switch', { name: 'Resumo semanal' })).toBeDisabled();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar para a tela anterior' }));
  act(() => router.push('/configuracoes/notificacoes'));
  expect(screen.getByRole('switch', { name: 'Permitir notificações' })).not.toBeChecked();
});

test('Codeforces started from platforms returns there instead of registration', async () => {
  await login();
  act(() => router.push('/configuracoes/plataformas'));
  fireEvent.press(screen.getByRole('button', { name: 'Verificar Codeforces' }));
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'novo_handle');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  await waitFor(() => expect(screen.getByText('Conta encontrada!')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Iniciar verificação' }));
  fireEvent.press(screen.getByRole('button', { name: 'Já enviei / Atualizar status' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Concluir e voltar' })).toBeTruthy(), { timeout: 3000 });
  fireEvent.press(screen.getByRole('button', { name: 'Concluir e voltar' }));
  await waitFor(() => expect(screen.getByText('Conta novo_handle verificada nesta sessão')).toBeTruthy());
  expect(screen.queryByLabelText('Nome completo')).toBeNull();
});

test('friends search and statistics preserve stack return destinations', async () => {
  await login();
  fireEvent.press(await screen.findByRole('button', { name: 'Ver estatísticas de desempenho' }));
  fireEvent.press(screen.getByRole('tab', { name: 'Rating' }));
  expect(await screen.findByText('Evolução de rating')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar para a tela anterior' }));
  expect(screen.getByText(/Olá,/)).toBeTruthy();
  act(() => router.navigate('/(tabs)/amigos'));
  fireEvent.changeText(screen.getByLabelText('Buscar amigo pelo handle'), 'nao_existe');
  expect(await screen.findByText('Nenhum amigo encontrado. Tente outro handle ou limpe a busca.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('Buscar amigo pelo handle'), 'ana');
  fireEvent.press(await screen.findByRole('button', { name: /Ver perfil de ana_cp/ }));
  expect(screen.getByText('Perfil do amigo')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Voltar para a tela anterior' }));
  expect(screen.getByLabelText('Buscar amigo pelo handle')).toHaveDisplayValue('ana');
});

test('generated training can open the scoreboard and return to the tabs', async () => {
  await login();
  act(() => router.navigate('/(tabs)/treino'));
  fireEvent.press(screen.getByRole('button', { name: 'Gerar problemas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Ver placar demonstrativo' }));
  await waitFor(() => expect(screen.getByText('Placar ao vivo')).toBeTruthy());
  expect(screen.queryByText('Treino gerado')).toBeNull();
});

test('recovery rejects malformed email and identifies simulated sending', () => {
  renderRouter('./src/app', { initialUrl: '/recuperar-senha' });
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'invalido');
  fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));
  expect(screen.getByText('Informe um e-mail válido, como nome@exemplo.com.')).toBeTruthy();
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'teste@example.com');
  fireEvent.press(screen.getByRole('button', { name: 'Enviar link' }));
  expect(screen.getByText('Solicitação simulada com sucesso. Nenhum e-mail foi enviado.')).toBeTruthy();
});

test('Codeforces lookup can be retried after returning from found account', async () => {
  renderRouter('./src/app', { initialUrl: '/codeforces/verificar-conta' });
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'naoexiste');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  await waitFor(() => expect(screen.getByText(/Não encontramos esse usuário/)).toBeTruthy());
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'tourist');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  await waitFor(() => expect(screen.getByText('Conta encontrada!')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Voltar para a tela anterior' }));
  expect(screen.getByRole('button', { name: 'Confirmar dados' })).not.toBeDisabled();
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'outro_handle');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  await waitFor(() => expect(screen.getByText('outro_handle')).toBeTruthy());
});

test('cancelling lookup prevents its delayed response from changing the route', async () => {
  jest.useFakeTimers();
  renderRouter('./src/app', { initialUrl: '/cadastro' });
  fireEvent.press(screen.getByRole('button', { name: 'Ir para verificação' }));
  fireEvent.changeText(screen.getByLabelText('Handle do Codeforces'), 'tourist');
  fireEvent.press(screen.getByRole('button', { name: 'Confirmar dados' }));
  fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.getByLabelText('Nome completo')).toBeTruthy();
  expect(screen.queryByText('Conta encontrada!')).toBeNull();
});

test('settings tab opens preferences and returns from a detail', async () => {
  await login();
  fireEvent.press(screen.getByLabelText('Configurações, aba'));
  expect(await screen.findByText('Personalize o RankFlow')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: /Notificações/ }));
  act(() => router.back());
  expect(await screen.findByText('Personalize o RankFlow')).toBeTruthy();
});

test('completed training history preserves its own results after a new training', async () => {
  await login();
  act(() => router.navigate('/(tabs)/treino'));
  fireEvent.press(await screen.findByRole('radio', { name: '3 problemas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Gerar problemas' }));
  fireEvent.press(await screen.findByRole('button', { name: 'Concluir treino demonstrativo' }));
  expect(await screen.findByText('Resultado do treino')).toBeTruthy();
  act(() => router.back());
  fireEvent.press(await screen.findByRole('radio', { name: '6 problemas' }));
  fireEvent.press(screen.getByRole('button', { name: 'Gerar problemas' }));
  await screen.findByText('6 problemas demonstrativos gerados com sucesso.');
  fireEvent.press(screen.getByRole('button', { name: 'Concluir treino demonstrativo' }));
  expect(screen.getByText('6/6 resolvidos • 600 pontos')).toBeTruthy();
  act(() => router.back());
  fireEvent.press(await screen.findByRole('button', { name: /Ver resultado do treino.*3 problemas/ }));
  expect(await screen.findByText('Resultado do treino')).toBeTruthy();
  expect(screen.getByText('Exercício demonstrativo 3')).toBeTruthy();
  expect(screen.queryByText('Exercício demonstrativo 4')).toBeNull();
  expect(screen.getByText('3/3 resolvidos • 300 pontos')).toBeTruthy();
  act(() => router.back());
  fireEvent.press(await screen.findByRole('button', { name: /Ver resultado do treino.*6 problemas/ }));
  expect(screen.getByText('6/6 resolvidos • 600 pontos')).toBeTruthy();
});


test('unknown training history ID does not show the current training', async () => {
  await login();
  act(() => router.navigate('/(tabs)/treino'));
  fireEvent.press(screen.getByRole('button', { name: 'Gerar problemas' }));
  act(() => router.push('/treinos/resultado?id=inexistente'));
  expect(await screen.findByText('Não há treino nesta sessão. Escolha as opções para gerar uma lista.')).toBeTruthy();
  expect(screen.queryByText('Exercício demonstrativo 1')).toBeNull();
});
