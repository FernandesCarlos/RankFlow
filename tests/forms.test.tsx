import {
  isEmail,
  validateProfile,
  validateRegistration,
} from '../src/services/forms';

describe('isEmail', () => {
  it('accepts a valid email address', () => {
    expect(isEmail('carlos@example.com')).toBe(true);
  });

  it('ignores whitespace around the email address', () => {
    expect(isEmail('  carlos@example.com  ')).toBe(true);
  });

  it('rejects malformed email addresses', () => {
    expect(isEmail('carlos@')).toBe(false);
    expect(isEmail('carlos@example')).toBe(false);
    expect(isEmail('carlos example.com')).toBe(false);
  });
});

describe('validateProfile', () => {
  const validProfile = {
    name: 'Carlos Eduardo',
    username: 'cadu',
    email: 'carlos@example.com',
  };

  it('requires a name with at least three characters', () => {
    expect(validateProfile({ ...validProfile, name: 'Ca' })).toBe(
      'Informe um nome com pelo menos 3 caracteres.',
    );
  });

  it('requires a username', () => {
    expect(validateProfile({ ...validProfile, username: '   ' })).toBe(
      'Informe seu nome de usuário.',
    );
  });

  it('requires a valid email address', () => {
    expect(validateProfile({ ...validProfile, email: 'email-invalido' })).toBe(
      'Informe um e-mail válido, como nome@exemplo.com.',
    );
  });

  it('accepts a valid profile', () => {
    expect(validateProfile(validProfile)).toBe('');
  });
});

describe('validateRegistration', () => {
  const validRegistration = {
    name: 'Carlos Eduardo',
    email: 'carlos@example.com',
    password: 'senha123',
    confirmation: 'senha123',
  };

  it('requires a password with at least eight characters', () => {
    expect(
      validateRegistration({
        ...validRegistration,
        password: '1234567',
        confirmation: '1234567',
      }),
    ).toBe('A senha precisa ter pelo menos 8 caracteres.');
  });

  it('requires matching password and confirmation', () => {
    expect(
      validateRegistration({
        ...validRegistration,
        confirmation: 'senha456',
      }),
    ).toBe('As senhas não coincidem.');
  });

  it('accepts a valid registration', () => {
    expect(validateRegistration(validRegistration)).toBe('');
  });
});
