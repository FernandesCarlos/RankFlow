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
  if (input.password.length < 6) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (input.password !== input.confirmation) return 'As senhas não coincidem.';
  return '';
}

export type TrainingInput = { quantity: number; min: number; max: number; tags: string[]; participants: string[] };
export function createTraining(input: TrainingInput) {
  if (!Number.isInteger(input.quantity) || input.quantity < 3 || input.quantity > 6) throw new Error('Selecione de 3 a 6 problemas.');
  if (!Number.isFinite(input.min) || !Number.isFinite(input.max) || input.min < 800 || input.max > 3500 || input.min > input.max) throw new Error('Use dificuldade entre 800 e 3500, com mínimo menor ou igual ao máximo.');
  if (!input.tags.length) throw new Error('Selecione pelo menos uma tag.');
  if (!input.participants.length) throw new Error('Selecione pelo menos um participante.');
  return {
    ...input,
    participants: [...input.participants],
    tags: [...input.tags],
    problems: Array.from({ length: input.quantity }, (_, index) => ({
      id: String(index + 1),
      title: `Exercício demonstrativo ${index + 1}`,
      tag: input.tags[index % input.tags.length],
      rating: Math.round(input.min + ((input.max - input.min) * index) / Math.max(1, input.quantity - 1)),
    })),
  };
}
export type Training = ReturnType<typeof createTraining>;
