import Connection from '../src/administrative-sdk/connection/connection-controller';
import Group from '../src/administrative-sdk/group/group';
import GroupController from '../src/administrative-sdk/group/group-controller';

describe('Group', () => {
  describe('Constructor', () => {
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
  describe('API', () => {
    it('should not create a group with invalid parameters', done => {
      const controller = new GroupController();
      [0, '0', {}, [], true, false, null, undefined].map(v => {
        controller.createGroup(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('group parameter of type "Group" is required');
          })
          .then(done);
      });
    });

    it('should create a new group through API', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const group = new Group('GROUP_1', 'First Grade');
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const controller = new GroupController(api);
      const url = 'https://api.itslanguage.nl/groups';
      const content = {
        id: 'GROUP_1',
        name: 'First Grade',
        created: stringDate,
        updated: stringDate
      };
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 201,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

      controller.createGroup(group)
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('POST');
          expect(request[1].body).toEqual(JSON.stringify(group));
          group.created = new Date(stringDate);
          group.updated = new Date(stringDate);
          expect(result).toEqual(group);
        })
        .catch(error => {
          fail('No error should be thrown : ' + error);
        }).then(done);
    });

    it('should not get on an invalid group id', done => {
      const controller = new GroupController();
      [0, {}, [], true, false, null, undefined].map(v => {
        controller.getGroup(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('groupId parameter of type "string" is required');
          })
          .then(done);
      });
    });

    it('should get an existing group through API', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/groups/4';
      const content = {
        id: 'GROUP_1',
        name: 'First Grade',
        created: stringDate,
        updated: stringDate
      };
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new GroupController(api);
      controller.getGroup('4')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const group = new Group('GROUP_1', 'First Grade');
          group.created = new Date(stringDate);
          group.updated = new Date(stringDate);
          expect(result).toEqual(group);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });

    it('should get a list of groups', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/groups';
      const content = [
        {
          id: 'GROUP_1',
          name: 'First Grade',
          created: stringDate,
          updated: stringDate
        },
        {
          id: 'GROUP_2',
          name: 'Second Grade',
          created: stringDate,
          updated: stringDate
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new GroupController(api);
      controller.getGroups()
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const group1 = new Group('GROUP_1', 'First Grade');
          group1.created = new Date(stringDate);
          group1.updated = new Date(stringDate);
          const group2 = new Group('GROUP_2', 'Second Grade');
          group2.created = new Date(stringDate);
          group2.updated = new Date(stringDate);
          expect(result.length).toBe(2);
          expect(result).toEqual([group1, group2]);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });
  });
});
