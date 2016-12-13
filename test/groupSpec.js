import Group from '../src/administrative-sdk/group/group';

describe('Group', () => {
  it('should not construct with an invalid id', () => {
    [1, {}, [], true, false, undefined].map(v => {
      expect(() => {
        new Group(v);
      }).toThrowError('id parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid name', () => {
    [1, {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new Group('1', v);
      }).toThrowError('name parameter of type "string" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const group = new Group('1', 'group1');
    expect(group.id).toEqual('1');
    expect(group.name).toEqual('group1');

    const group2 = new Group(null, 'group1');
    expect(group2.id).toBeNull();
    expect(group2.name).toEqual('group1');
  });
});
