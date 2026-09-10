import { mockCodeforces } from '../mocks';

export type CodeforcesProfile = {
  handle: string;
  rating: number;
  rank: string;
  ranking: string;
  memberSince: number;
};

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function findCodeforcesUser(
  handle: string
): Promise<CodeforcesProfile | null> {
  await sleep(650);

  const normalizedHandle = handle.trim();

  if (
    !normalizedHandle ||
    normalizedHandle.toLowerCase() === mockCodeforces.invalidHandle
  ) {
    return null;
  }

  return {
    ...mockCodeforces.profile,
    handle: normalizedHandle,
  };
}

export async function checkVerificationSubmission() {
  await sleep(750);
  return mockCodeforces.verificationSubmissionFound;
}
