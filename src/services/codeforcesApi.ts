declare const process: { env: { EXPO_PUBLIC_API_URL?: string } };

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

export type CodeforcesUser = {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  avatar?: string;
  titlePhoto?: string;
  contribution?: number;
};

export type CodeforcesRatingChange = {
  contestId: number;
  contestName: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

export type CodeforcesSubmission = {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
    name: string;
    rating?: number;
    tags: string[];
  };
};

export type CodeforcesSummary = {
  user: CodeforcesUser;
  ratingHistory: CodeforcesRatingChange[];
  submissions: CodeforcesSubmission[];
  solvedCount: number;
  contestCount: number;
  tagStats: { tag: string; solved: number }[];
  ratingGainLastFive: number;
  recentRating: number[];
  lastSubmissionAt?: number;
};

async function request<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`);
  } catch {
    throw new Error(
      `Não foi possível conectar ao RankFlow API em ${API_BASE_URL}. Confira se o backend está ativo e se EXPO_PUBLIC_API_URL aponta para o endereço acessível pelo dispositivo.`
    );
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    throw new Error(
      typeof detail === 'string'
        ? detail
        : `Falha na consulta (HTTP ${response.status}).`
    );
  }
  return payload as T;
}

export function getCodeforcesUser(handle: string): Promise<CodeforcesUser> {
  return request<CodeforcesUser>(`/api/codeforces/users/${encodeURIComponent(handle.trim())}`);
}

export function getCodeforcesRating(handle: string): Promise<CodeforcesRatingChange[]> {
  return request<CodeforcesRatingChange[]>(`/api/codeforces/users/${encodeURIComponent(handle.trim())}/rating`);
}

export function getCodeforcesSubmissions(
  handle: string,
  count = 1000
): Promise<CodeforcesSubmission[]> {
  return request<CodeforcesSubmission[]>(
    `/api/codeforces/users/${encodeURIComponent(handle.trim())}/submissions?count=${count}`
  );
}

function getSolvedProblems(submissions: CodeforcesSubmission[]) {
  const accepted = new Map<string, CodeforcesSubmission['problem']>();
  for (const submission of submissions) {
    if (submission.verdict !== 'OK') continue;
    const problem = submission.problem;
    const contestId = problem.contestId ?? submission.contestId;
    const key = `${contestId ?? 'gym'}-${problem.index}`;
    if (!accepted.has(key)) accepted.set(key, problem);
  }
  return [...accepted.values()];
}

export function buildCodeforcesSummary(
  user: CodeforcesUser,
  ratingHistory: CodeforcesRatingChange[],
  submissions: CodeforcesSubmission[]
): CodeforcesSummary {
  const solved = getSolvedProblems(submissions);
  const tags = new Map<string, number>();
  for (const problem of solved) {
    for (const tag of problem.tags ?? []) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }

  const lastFive = ratingHistory.slice(-5);
  const ratingGainLastFive = lastFive.reduce(
    (total, contest) => total + contest.newRating - contest.oldRating,
    0
  );
  const latestSubmission = submissions.reduce<number | undefined>(
    (latest, item) => Math.max(latest ?? 0, item.creationTimeSeconds),
    undefined
  );

  return {
    user,
    ratingHistory,
    submissions,
    solvedCount: solved.length,
    contestCount: ratingHistory.length,
    tagStats: [...tags.entries()]
      .map(([tag, count]) => ({ tag, solved: count }))
      .sort((a, b) => b.solved - a.solved),
    ratingGainLastFive,
    recentRating: ratingHistory.slice(-7).map((item) => item.newRating),
    lastSubmissionAt: latestSubmission,
  };
}

export async function getCodeforcesSummary(handle: string): Promise<CodeforcesSummary> {
  const normalized = handle.trim();
  if (!normalized) throw new Error('Informe um handle do Codeforces.');

  const [user, ratingHistory, submissions] = await Promise.all([
    getCodeforcesUser(normalized),
    getCodeforcesRating(normalized),
    getCodeforcesSubmissions(normalized),
  ]);

  return buildCodeforcesSummary(user, ratingHistory, submissions);
}

export function getCodeforcesRank(user: CodeforcesUser): string {
  if (user.rank) return user.rank;
  if (typeof user.rating === 'number') return 'Unrated';
  return 'Sem rating';
}
