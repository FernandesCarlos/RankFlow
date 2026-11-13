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
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  registrationTimeSeconds?: number;
};

export type CodeforcesRatingChange = {
  contestId: number;
  contestName: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
};

export type CodeforcesProblem = {
  id: string;
  contestId: number;
  index: string;
  title: string;
  rating: number;
  tags: string[];
  tag: string;
  url: string;
};

export type CodeforcesSummary = {
  user: CodeforcesUser;
  ratingHistory: CodeforcesRatingChange[];
  solvedCount: number;
  submissionCount: number;
  contestCount: number;
  tagStats: { tag: string; solved: number }[];
  ratingGainLastFive: number;
  recentRating: number[];
  lastSubmissionAt?: number;
};

export type CodeforcesTraining = {
  quantity: number;
  min: number;
  max: number;
  tags: string[];
  problems: CodeforcesProblem[];
  participants: string[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
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

export function getCodeforcesSummary(handle: string): Promise<CodeforcesSummary> {
  if (!handle.trim()) return Promise.reject(new Error('Vincule seu handle do Codeforces nas configurações de plataformas.'));
  return request<CodeforcesSummary>(
    `/api/codeforces/users/${encodeURIComponent(handle.trim())}/summary`
  );
}

export async function getCodeforcesProblemTags(): Promise<string[]> {
  const result = await request<{ tags: string[] }>('/api/codeforces/problem-tags');
  return result.tags;
}

export function generateCodeforcesTraining(input: {
  handle: string;
  quantity: number;
  min: number;
  max: number;
  tags: string[];
}): Promise<Omit<CodeforcesTraining, 'participants'>> {
  const params = new URLSearchParams({
    quantity: String(input.quantity),
    min_rating: String(input.min),
    max_rating: String(input.max),
  });
  if (input.tags.length) params.set('tags', input.tags.join(','));
  return request<Omit<CodeforcesTraining, 'participants'>>(
    `/api/codeforces/users/${encodeURIComponent(input.handle.trim())}/training?${params.toString()}`
  );
}

export function getCodeforcesRank(user: CodeforcesUser): string {
  if (user.rank) return user.rank;
  if (typeof user.rating === 'number') return 'Unrated';
  return 'Sem rating';
}


export async function getCodeforcesVerificationProblem(handle: string): Promise<CodeforcesProblem> {
  const result = await request<{ problems: CodeforcesProblem[] }>(
    `/api/codeforces/users/${encodeURIComponent(handle.trim())}/verification-problem`
  );
  const problem = result.problems?.[0];
  if (!problem) throw new Error('Não foi possível encontrar um problema para a verificação.');
  return problem;
}

export async function checkCodeforcesVerificationSubmission(
  handle: string,
  contestId: number,
  index: string,
  startedAt: number,
): Promise<boolean> {
  const submissions = await request<{
    id: number;
    contestId?: number;
    creationTimeSeconds: number;
    verdict?: string;
    problem: { contestId?: number; index: string };
  }[]>(
    `/api/codeforces/users/${encodeURIComponent(handle.trim())}/submissions?count=1000`
  );
  return submissions.some((submission) => {
    const submittedContestId = submission.problem?.contestId ?? submission.contestId;
    return (
      submittedContestId === contestId &&
      submission.problem?.index === index &&
      submission.verdict === 'OK' &&
      submission.creationTimeSeconds >= startedAt
    );
  });
}


export type TrainingSession = {
  id: string;
  title: string;
  creatorHandle: string;
  participants: string[];
  problems: CodeforcesProblem[];
  durationMinutes: number;
  startedAt: string;
  endsAt: string;
  status: 'active' | 'finished';
  serverNow: string;
  submissions: TrainingAttempt[];
};

export type TrainingAttempt = {
  id: string;
  participant: string;
  problemId: string;
  verdict: string;
  points: number;
  submittedAt: string | null;
};

export type TrainingScoreboard = TrainingSession & {
  ranking: { participant: string; solved: number; points: number; attempts: number; lastSubmissionAt: string | null }[];
};

export function createTrainingSession(input: {
  creatorHandle: string;
  participants: string[];
  problems: CodeforcesProblem[];
  durationMinutes: number;
}): Promise<TrainingSession> {
  return request<TrainingSession>('/api/trainings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function getTrainingSession(id: string): Promise<TrainingSession> {
  return request<TrainingSession>(`/api/trainings/${encodeURIComponent(id)}`);
}

export function getTrainingScoreboard(id: string): Promise<TrainingScoreboard> {
  return request<TrainingScoreboard>(`/api/trainings/${encodeURIComponent(id)}/scoreboard`);
}

export function simulateTrainingSubmission(input: {
  sessionId: string;
  participant: string;
  problemId: string;
  verdict: 'OK' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
}): Promise<TrainingSession> {
  return request<TrainingSession>(
    `/api/trainings/${encodeURIComponent(input.sessionId)}/submissions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant: input.participant,
        problemId: input.problemId,
        verdict: input.verdict,
      }),
    },
  );
}
