import Role from '../src/administrative-sdk/role/role';

describe('Role', () => {
  it('should not construct with an invalid name', () => {
    [0, {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new Role(v);
      }).toThrowError('role parameter of type "string" is required');
    });
  });

  it('should not construct with invalid permissions', () => {
    [0, '0', {}, true, false, null, undefined].map(v => {
      expect(() => {
        new Role('student', v);
      }).toThrowError('permission parameter of type "Array" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const role = new Role('student', ['can_do_everything']);
    expect(role.name).toEqual('student');
    expect(role.permissions).toEqual(['can_do_everything']);
  });
});
