import Connection from '../src/administrative-sdk/connection/connection-controller';
import User from '../src/administrative-sdk/user/user';
import UserController from '../src/administrative-sdk/user/user-controller';

describe('User object test', () => {
  it('should not instantiate a User with an invalid id', () => {
    [0, {}, [], true, false, undefined].map(v => {
      expect(() => {
        new User(v);
      }).toThrowError('id parameter of type "string|null" is required');
    });
  });

  it('should not instantiate a User with an invalid organisationId', () => {
    [0, {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new User('1', v);
      }).toThrowError('organisationId parameter of type "string" is required');
    });
  });

  it('should not instantiate a User with an invalid profile', () => {
    [0, '0', {}, [], true, false, undefined].map(v => {
      expect(() => {
        new User('1', '1', v);
      }).toThrowError('profile parameter of type "Profile|null" is required');
    });
  });
  it('should not instantiate a User with invalid groups', () => {
    [0, '0', {}, true, false, undefined].map(v => {
      expect(() => {
        new User('1', '1', null, v);
      }).toThrowError('groups parameter of type "Array|null" is required');
    });
  });
  it('should not instantiate a User with invalid roles', () => {
    [0, '0', {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new User('1', '1', null, null, v);
      }).toThrowError('non-empty roles parameter of type "Array" is required');
    });
  });

  it('should instantiate a User', () => {
    const s = new User('0', '1', null, [], [{}]);
    expect(s).toBeDefined();
    expect(s.id).toBe('0');
    expect(s.organisationId).toBe('1');
    expect(s.profile).toBeNull();
    expect(s.groups).toEqual([]);
    expect(s.roles).toEqual([{}]);
  });
});
