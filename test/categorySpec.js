import Category from '../src/administrative-sdk/category/category';
import CategoryController from '../src/administrative-sdk/category/category-controller';
import Connection from '../src/administrative-sdk/connection/connection-controller';

describe('Category', () => {
  describe('Constructor', () => {
    it('should not construct with invalid id', () => {
      [1, {}, [], true, false].map(v => {
        expect(() => {
          new Category(v);
        }).toThrowError('id parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid parent', () => {
      [1, {}, [], true, false].map(v => {
        expect(() => {
          new Category('0', v);
        }).toThrowError('parent parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid name', () => {
      [1, {}, [], true, false].map(v => {
        expect(() => {
          new Category('0', undefined, v);
        }).toThrowError('name parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid description', () => {
      [1, {}, [], true, false].map(v => {
        expect(() => {
          new Category(undefined, undefined, 'cat', v);
        }).toThrowError('description parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid color', () => {
      [1, {}, [], true, false].map(v => {
        expect(() => {
          new Category(undefined, undefined, 'cat', undefined, v);
        }).toThrowError('color parameter of type "string|null" is required');
      });
    });

    it('should not construct with invalid speechChallenges', () => {
      [1, '0', {}, true, false].map(v => {
        expect(() => {
          new Category(undefined, undefined, 'cat', undefined, undefined, v);
        }).toThrowError('speechChallenges parameter of type "Array.<string>|null" is required');
      });
    });

    it('should construct with valid parameters', () => {
      const category = new Category('0', '1', 'name', 'desc', 'col', null);
      expect(category.id).toEqual('0');
      expect(category.parent).toEqual('1');
      expect(category.name).toEqual('name');
      expect(category.description).toEqual('desc');
      expect(category.color).toEqual('col');
      expect(category.speechChallenges).toBeNull();
    });
  });
  describe('API', () => {
    it('should not create a category with invalid parameters', done => {
      const controller = new CategoryController();
      [0, '0', {}, [], true, false, null, undefined].map(v => {
        controller.createCategory(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('category parameter of type "Category" is required');
          })
          .then(done);
      });
    });

    it('should create a new category through API', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const category = new Category('category_1_1', 'category_1', 'Category 1.1', 'Super duper.', '#FFFFFF',
        ['speech_1', '12']);
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const controller = new CategoryController(api);
      const url = 'https://api.itslanguage.nl/categories';
      const content = {
        id: 'category_1_1',
        parent: 'category_1',
        created: stringDate,
        updated: stringDate,
        name: 'Category 1.1',
        description: 'Super duper.',
        color: '#FFFFFF',
        imageUrl: 'www.imageUrl.com',
        iconUrl: 'www.iconUrl.com',
        speechChallenges: ['speech_1', '12']
      };
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 201,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

      controller.createCategory(category)
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('POST');
          expect(request[1].body).toEqual(JSON.stringify(category));
          category.created = new Date(stringDate);
          category.updated = new Date(stringDate);
          category.imageUrl = 'www.imageUrl.com';
          category.iconUrl = 'www.iconUrl.com';
          expect(result).toEqual(category);
          expect(result.id).toBe('category_1_1');
          expect(result.imageUrl).toEqual('www.imageUrl.com');
          expect(result.iconUrl).toEqual('www.iconUrl.com');
          expect(result.created).toEqual(new Date(stringDate));
          expect(result.updated).toEqual(new Date(stringDate));
        })
        .catch(error => {
          fail('No error should be thrown : ' + error);
        }).then(done);
    });

    it('should not get on an invalid category id', done => {
      const controller = new CategoryController();
      [0, {}, [], true, false, null, undefined].map(v => {
        controller.getCategory(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('categoryId parameter of type "string" is required');
          })
          .then(done);
      });
    });

    it('should get an existing category through API', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/categories/4';
      const content = {
        id: 'category_1_1',
        parent: 'category_1',
        created: stringDate,
        updated: stringDate,
        name: 'Category 1.1',
        description: 'Super duper.',
        color: '#FFFFFF',
        imageUrl: 'www.imageUrl.com',
        iconUrl: 'www.iconUrl.com',
        speechChallenges: ['speech_1', '12']
      };
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new CategoryController(api);
      controller.getCategory('4')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const category = new Category('category_1_1', 'category_1', 'Category 1.1', 'Super duper.', '#FFFFFF',
            ['speech_1', '12']);
          category.imageUrl = 'www.imageUrl.com';
          category.iconUrl = 'www.iconUrl.com';
          category.created = new Date(stringDate);
          category.updated = new Date(stringDate);
          expect(result).toEqual(category);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });

    it('should get all top level categories', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/categories';
      const content = [
        {
          id: 'category_1',
          parent: null,
          created: stringDate,
          updated: stringDate,
          name: 'Category 1',
          description: 'Some awesome description.',
          color: '#00f',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: []
        },
        {
          id: 'category_2',
          parent: null,
          created: stringDate,
          updated: stringDate,
          name: 'Category 2',
          description: 'Another awesome description.',
          color: '#0f0',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: []
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new CategoryController(api);
      controller.getTopLevelCategories()
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const category1 = new Category('category_1', null, 'Category 1', 'Some awesome description.', '#00f', []);
          category1.imageUrl = 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK';
          category1.iconUrl = 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe';
          category1.created = new Date(stringDate);
          category1.updated = new Date(stringDate);
          const category2 = new Category('category_2', null, 'Category 2', 'Another awesome description.', '#0f0', []);
          category2.imageUrl = 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK';
          category2.iconUrl = 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe';
          category2.created = new Date(stringDate);
          category2.updated = new Date(stringDate);
          expect(result.length).toBe(2);
          expect(result).toEqual([category1, category2]);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });

    it('should get all top level categories for a group', done => {
      const url = 'https://api.itslanguage.nl/categories?group=fi_fa_fo';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const controller = new CategoryController(api);
      const stringDate = '2014-12-31T23:59:59Z';
      const content = [
        {
          id: 'category_1',
          parent: null,
          created: stringDate,
          updated: stringDate,
          name: 'Category 1',
          description: 'Some awesome description.',
          color: '#00f',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: []
        },
        {
          id: 'category_2',
          parent: null,
          created: stringDate,
          updated: stringDate,
          name: 'Category 2',
          description: 'Another awesome description.',
          color: '#0f0',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: []
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

      controller.getTopLevelCategories('fi_fa_fo')
        .then(() => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
        })
        .then(done, fail);
    });

    it('should not get all categories with an invalid parent', done => {
      const controller = new CategoryController();
      [0, {}, [], true, false, null, undefined].map(v => {
        controller.getCategoriesWithParent(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('parentId parameter of type "string" is required');
          })
          .then(done);
      });
    });

    it('should get all categories with the same parent', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/categories/category_1/categories';
      const content = [
        {
          id: 'category_1_1',
          parent: 'category_1',
          created: stringDate,
          updated: stringDate,
          name: 'Category 1.1',
          description: 'Some awesome description.',
          color: '#00f',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: ['speech_x']
        },
        {
          id: 'category_1_2',
          parent: 'category_1',
          created: stringDate,
          updated: stringDate,
          name: 'Category 1.2',
          description: 'Another awesome description.',
          color: '#0f0',
          imageUrl: 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK',
          iconUrl: 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe',
          speechChallenges: ['speech_y', 'speech_z']
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new CategoryController(api);
      controller.getCategoriesWithParent('category_1')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const category1 = new Category('category_1_1', 'category_1', 'Category 1.1', 'Some awesome description.',
            '#00f', ['speech_x']);
          category1.imageUrl = 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK';
          category1.iconUrl = 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe';
          category1.created = new Date(stringDate);
          category1.updated = new Date(stringDate);
          const category2 = new Category('category_1_2', 'category_1', 'Category 1.2', 'Another awesome description.',
            '#0f0', ['speech_y', 'speech_z']);
          category2.imageUrl = 'https://api.itslanguage.nl/download/UKbsMpBsXaJUsBbK';
          category2.iconUrl = 'https://api.itslanguage.nl/download/GdExSbs-ZVNnQUUe';
          category2.created = new Date(stringDate);
          category2.updated = new Date(stringDate);
          expect(result.length).toBe(2);
          expect(result).toEqual([category1, category2]);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });
  });
});
