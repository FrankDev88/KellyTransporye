import { User, UserRole } from './user.entity';

describe('User Entity', () => {
  const validProps = {
    email: 'test@example.com',
    fullName: 'Test User',
    role: UserRole.DRIVER,
    password: 'hashedpassword',
  };

  describe('create', () => {
    it('debería crear un usuario válido', () => {
      const result = User.create(validProps);
      
      expect(result.isSuccess).toBe(true);
      const user = result.getValue();
      expect(user.email).toBe(validProps.email);
      expect(user.isAdmin()).toBe(false);
      expect(user.isDriver()).toBe(true);
    });

    it('debería fallar si el email no es válido', () => {
      const result = User.create({ ...validProps, email: 'invalid-email' });
      expect(result.isFailure).toBe(true);
      expect(result.error).toContain('Email inválido');
    });

    it('debería identificar correctamente el rol ADMIN', () => {
      const user = User.create({ ...validProps, role: UserRole.ADMIN }).getValue();
      expect(user.isAdmin()).toBe(true);
      expect(user.isDriver()).toBe(false);
    });
  });
});
