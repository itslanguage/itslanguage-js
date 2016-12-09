import Profile from '../src/administrative-sdk/profile/profile';

describe('Profile', () => {
  it('should not construct with an invalid firstName', () => {
    [0, {}, true, false, null, undefined, []].map(v => {
      expect(() => {
        new Profile(v);
      }).toThrowError('firstName parameter of type "string" is required');
    });
  });

  it('should not construct with an invalid lastName', () => {
    [0, {}, true, false, null, undefined, []].map(v => {
      expect(() => {
        new Profile('mr', v);
      }).toThrowError('lastName parameter of type "string" is required');
    });
  });

  it('should not construct with an invalid infix', () => {
    [0, {}, true, false, undefined, []].map(v => {
      expect(() => {
        new Profile('mr', 'anderson', v);
      }).toThrowError('infix parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid gender', () => {
    [0, {}, true, false, null, undefined, []].map(v => {
      expect(() => {
        new Profile('mr', 'anderson', null, v);
      }).toThrowError('gender parameter of type "string" is required');
    });
  });

  it('should not construct with an invalid birthDate', () => {
    [0, '0', {}, true, false, null, undefined, []].map(v => {
      expect(() => {
        new Profile('mr', 'anderson', null, 'male', v);
      }).toThrowError('birthDate parameter of type "string" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const stringDate = '2014-12-31T23:59:59Z';
    const profile = new Profile('mr', 'anderson', null, 'male', new Date(stringDate));
    expect(profile.firstName).toEqual('mr');
    expect(profile.lastName).toEqual('anderson');
    expect(profile.infix).toBeNull();
    expect(profile.gender).toEqual('male');
    expect(profile.birthDate).toEqual(new Date(stringDate));
  });
});
