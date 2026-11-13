import {
  checkCodeforcesVerificationSubmission,
  getCodeforcesUser,
} from './codeforcesApi';

export type CodeforcesProfile = {
  handle: string;
  rating: number | null;
  rank: string;
  ranking: string;
  memberSince: number;
};

export async function findCodeforcesUser(
  handle: string,
): Promise<CodeforcesProfile | null> {
  const normalizedHandle = handle.trim();
  if (!normalizedHandle) return null;

  const user = await getCodeforcesUser(normalizedHandle);
  return {
    handle: user.handle,
    rating: user.rating ?? null,
    rank: user.rank ?? 'Unrated',
    ranking: user.rank ?? 'Unrated',
    memberSince: user.registrationTimeSeconds ?? 0,
  };
}

export async function checkVerificationSubmission(input: {
  handle: string;
  contestId: number;
  index: string;
  startedAt: number;
}) {
  return checkCodeforcesVerificationSubmission(
    input.handle,
    input.contestId,
    input.index,
    input.startedAt,
  );
}
