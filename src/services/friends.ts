import {
  getCodeforcesSummary,
  type CodeforcesSummary,
} from './codeforcesApi';

export type FriendSummary = CodeforcesSummary & { handle: string };

// O resumo vem do endpoint que percorre o histórico de submissões público
// e conta problemas distintos aceitos (verdict OK).
export async function loadFriendSummaries(handles: string[]): Promise<FriendSummary[]> {
  const results = await Promise.allSettled(
    handles.map((handle) => getCodeforcesSummary(handle))
  );

  return results.flatMap((result, index) =>
    result.status === 'fulfilled'
      ? [{ ...result.value, handle: handles[index] }]
      : []
  );
}

export function summarizeFriendError(
  handles: string[],
  loaded: FriendSummary[]
): string | null {
  if (loaded.length === handles.length) return null;
  if (loaded.length === 0) {
    return 'Não foi possível carregar os amigos. Verifique os handles e a conexão com a API.';
  }
  return `Não foi possível carregar ${handles.length - loaded.length} amigo(s). Os demais dados foram atualizados.`;
}
