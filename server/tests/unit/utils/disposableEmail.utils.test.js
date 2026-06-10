import { isDisposableEmail } from '../../../src/utils/disposableEmail.utils.js';

describe('isDisposableEmail', () => {
  it('should block known disposable domains', () => {
    expect(isDisposableEmail('bot@mailinator.com')).toBe(true);
    expect(isDisposableEmail('test@yopmail.com')).toBe(true);
  });

  it('should allow normal email domains', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false);
    expect(isDisposableEmail('dev@company.com')).toBe(false);
  });
});
