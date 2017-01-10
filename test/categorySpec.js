import Category from '../src/administrative-sdk/category/category';
import Progress from '../src/administrative-sdk/progress/progress';

describe('Category', () => {
  it('should not construct with invalid id', () => {
    [1, {}, [], true, false].map(v => {
      expect(() => {
        new Category(v);
      }).toThrowError('id parameter of type "string|null" is required');
    });
  });

  it('should not construct with invalid name', () => {
    [1, {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new Category('0', v);
      }).toThrowError('name parameter of type "string" is required');
    });
  });

  it('should not construct with invalid description', () => {
    [1, {}, [], true, false].map(v => {
      expect(() => {
        new Category(undefined, 'cat', v);
      }).toThrowError('description parameter of type "string|null" is required');
    });
  });

  it('should not construct with invalid color', () => {
    [1, {}, [], true, false].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, v);
      }).toThrowError('color parameter of type "string|null" is required');
    });
  });

  it('should not construct with invalid image', () => {
    [1, {}, [], true, false].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, undefined, v);
      }).toThrowError('image parameter of type "string|null" is required');
    });
  });

  it('should not construct with invalid icon', () => {
    [1, {}, [], true, false].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, undefined, undefined, v);
      }).toThrowError('icon parameter of type "string|null" is required');
    });
  });

  it('should not construct with invalid categories', () => {
    [1, '0', {}, [], true, false, undefined].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, undefined, undefined, undefined, v);
      }).toThrowError('categories parameter of type "Array.<Category>|null" is required');
    });
  });

  it('should not construct with invalid speechChallenges', () => {
    [1, '0', {}, [], true, false, undefined].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, undefined, undefined, undefined, null, v);
      }).toThrowError('speechChallenges parameter of type "Array.<SpeechChallenge>|null" is required');
    });
  });

  it('should not construct with invalid progress', () => {
    [1, '0', {}, [], true, false].map(v => {
      expect(() => {
        new Category(undefined, 'cat', undefined, undefined, undefined, undefined, null, null, v);
      }).toThrowError('progress parameter of type "Progress|null" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const progress = new Progress('1', '4');
    const category = new Category('0', 'cat', 'desc', 'col', 'img', 'icon', null, null, progress);
    expect(category.id).toEqual('0');
    expect(category.name).toEqual('cat');
    expect(category.description).toEqual('desc');
    expect(category.color).toEqual('col');
    expect(category.image).toEqual('img');
    expect(category.icon).toEqual('icon');
    expect(category.categories).toBeNull();
    expect(category.speechChallenges).toBeNull();
    expect(category.progress).toEqual(progress);
  });
});
