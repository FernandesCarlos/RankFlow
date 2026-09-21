const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateProfile, validateRegistration, createTraining } = require('../.test-build/services/forms.js');
test('profile rejects blank name and invalid email', () => {
  assert.ok(validateProfile({ name: ' ', username: 'carlos', email: 'a@' }));
  assert.ok(validateProfile({ name: 'Carlos', username: ' ', email: 'carlos@email.com' }));
  assert.equal(validateProfile({ name: 'Carlos', username: 'carlos', email: 'carlos@email.com' }), '');
});
test('registration explains mismatched and short passwords', () => {
  const valid = { name: 'Carlos', email: 'carlos@email.com', password: '123456', confirmation: '123456' };
  assert.equal(validateRegistration(valid), '');
  assert.match(validateRegistration({ ...valid, confirmation: 'abcdef' }), /coincidem/);
  assert.match(validateRegistration({ ...valid, password: '123', confirmation: '123' }), /6/);
});
test('training honors quantity, bounds, participants and topics', () => {
  const result = createTraining({ quantity: 4, min: 1000, max: 1500, tags: ['dp', 'math'], participants: ['Você', 'ana_cp'] });
  assert.equal(result.problems.length, 4);
  assert.deepEqual(result.participants, ['Você', 'ana_cp']);
  assert.ok(result.problems.every(p => p.rating >= 1000 && p.rating <= 1500 && ['dp', 'math'].includes(p.tag)));
  assert.equal(new Set(result.problems.map(p => p.id)).size, 4);
});
test('training refuses invalid ranges and empty choices', () => {
  const input = { quantity: 3, min: 1000, max: 1500, tags: ['dp'], participants: ['Você'] };
  for (const invalid of [{ min: 1800 }, { min: NaN }, { quantity: 0 }, { quantity: 2.5 }, { tags: [] }, { participants: [] }]) {
    assert.throws(() => createTraining({ ...input, ...invalid }));
  }
});
