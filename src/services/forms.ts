export const isEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export function validateProfile(input: { name: string; username: string; email: string }) {
  if (input.name.trim().length < 3) return 'Informe um nome com pelo menos 3 caracteres.';
  if (!input.username.trim()) return 'Informe seu nome de usuário.';
  if (!isEmail(input.email)) return 'Informe um e-mail válido, como nome@exemplo.com.';
  return '';
}

export function validateRegistration(input: { name: string; email: string; password: string; confirmation: string }) {
  const error = validateProfile({ ...input, username: input.name });
  if (error) return error;
  if (input.password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (input.password !== input.confirmation) return 'As senhas não coincidem.';
  return '';
}

export type TrainingProblem = {
  id: string;
  contestId: number;
  index: string;
  title: string;
  tag: string;
  tags: string[];
  rating: number;
  url: string;
};

export type Training = {
  quantity: number;
  min: number;
  max: number;
  tags: string[];
  participants: string[];
  problems: TrainingProblem[];
  durationMinutes?: number;
  sessionId?: string;
};
