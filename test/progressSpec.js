import Progress from '../src/administrative-sdk/progress/progress';

describe('Progress', () => {
  describe('Constructor', () => {
    it('should not construct with an invalid user', () => {
      [1, '0', true, false, undefined].map(v => {
        expect(() => {
          new Progress(v, 'cat');
        }).toThrowError('user parameter of type "Object" is required');
      });
    });

    it('should not construct with an invalid category', () => {
      [1, {}, true, false, null, undefined, []].map(v => {
        expect(() => {
          new Progress({}, v);
        }).toThrowError('category parameter of type "string" is required');
      });
    });

    it('should not construct with an invalid percentage', () => {
      [1, {}, true, false, []].map(v => {
        expect(() => {
          new Progress({}, 'cat', v);
        }).toThrowError('percentage parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid challenge(s)', () => {
      [1, '1', {}, true, false].map(v => {
        expect(() => {
          new Progress({}, 'cat', null, v);
        }).toThrowError('challenges parameter of type "Array.<Objects>|null" is required');
      });
    });

    it('should construct with valid arguments', () => {
      const progress = new Progress({}, 'category_x', '100', []);
      expect(progress).toBeDefined();
      expect(progress.user).toEqual({});
      expect(progress.category).toEqual('category_x');
      expect(progress.percentage).toEqual('100');
      expect(progress.challenges).toEqual([]);

      const progress1 = new Progress({}, 'category_x');
      expect(progress1).toBeDefined();
      expect(progress1.user).toEqual({});
      expect(progress1.category).toEqual('category_x');
      expect(progress1.percentage).toBeNull();
      expect(progress1.challenges).toBeNull();

      const progress2 = new Progress({}, 'category_x', null);
      expect(progress2).toBeDefined();
      expect(progress2.user).toEqual({});
      expect(progress2.category).toEqual('category_x');
      expect(progress2.percentage).toBeNull();
      expect(progress2.challenges).toBeNull();

      const progress3 = new Progress({}, 'category_x', '100', null);
      expect(progress3).toBeDefined();
      expect(progress3.user).toEqual({});
      expect(progress3.category).toEqual('category_x');
      expect(progress3.percentage).toEqual('100');
      expect(progress3.challenges).toBeNull();

      const progress4 = new Progress({}, 'category_x', null, []);
      expect(progress4).toBeDefined();
      expect(progress4.user).toEqual({});
      expect(progress4.category).toEqual('category_x');
      expect(progress4.percentage).toBeNull();
      expect(progress4.challenges).toEqual([]);
    });
  });
});
