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

  it('should not instantiate a User with an invalid profile', () => {
    [0, '0', {}, [], true, false, undefined].map(v => {
      expect(() => {
        new User('1', v);
      }).toThrowError('profile parameter of type "Profile|null" is required');
    });
  });

  it('should not instantiate a User with invalid groups', () => {
    [0, '0', {}, true, false, undefined].map(v => {
      expect(() => {
        new User('1', null, v);
      }).toThrowError('groups parameter of type "Array.<Groups>|null" is required');
    });
  });
  it('should not instantiate a User with invalid roles', () => {
    [0, '0', {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new User('1', null, null, v);
      }).toThrowError('non-empty roles parameter of type "Array.<string>" is required');
    });
  });

  it('should instantiate a User', () => {
    const s = new User('0', null, [], [{}]);
    expect(s).toBeDefined();
    expect(s.id).toBe('0');
    expect(s.profile).toBeNull();
    expect(s.groups).toEqual([]);
    expect(s.roles).toEqual([{}]);
  });
});

describe('User API interaction test', () => {
  it('should not create a user if the user is invalid', done => {
    const controller = new UserController();
    [0, '4', {}, [], true, false, null, undefined].map(v => {
      controller.createUser(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('user parameter of type "User" is required');
          })
          .then(done);
    });
  });

  it('should create a user', done => {
    const stringDate = '2014-12-31T23:59:59Z';
    const studentUser = new User('0', null, ['GROUP1'], ['STUDENT']);
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    const url = 'https://api.itslanguage.nl/users';
    const expected = JSON.stringify(studentUser);
    const content = {
      id: '0',
      created: stringDate,
      updated: stringDate,
      profile: null,
      roles: ['STUDENT'],
      groups: ['GROUP1']
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createUser(studentUser)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(expected);
        studentUser.created = new Date(stringDate);
        studentUser.updated = new Date(stringDate);
        expect(result).toEqual(studentUser);
      })
      .catch(error => {
        fail('No error should be thrown : ' + error);
      }).then(done);
  });

  it('should list all users', done => {
    const stringDate = '2014-12-31T23:59:59Z';
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/users';
    const content = [
      {
        id: 'sdcjb823jhguys5j',
        profile: null,
        roles: ['STUDENT'],
        groups: ['GROUP1'],
        created: stringDate,
        updated: stringDate
      },
      {
        id: 'iosdhrfd893ufg',
        profile: null,
        roles: ['TEACHER'],
        groups: ['GROUP1'],
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
    const controller = new UserController(api);
    controller.listUsers()
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const user1 = new User('sdcjb823jhguys5j', null, ['GROUP1'], ['STUDENT']);
        const user2 = new User('iosdhrfd893ufg', null, ['GROUP1'], ['TEACHER']);
        user1.created = new Date(stringDate);
        user1.updated = new Date(stringDate);
        user2.created = new Date(stringDate);
        user2.updated = new Date(stringDate);
        expect(result.length).toBe(2);
        expect(result).toEqual([user1, user2]);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not get a user on invalid id', done => {
    const controller = new UserController();
    [0, {}, [], true, false, null, undefined].map(v => {
      controller.getUser(v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('userId parameter of type "string" is required');
        })
        .then(done);
    });
  });

  it('should get a user', done => {
    const stringDate = '2014-12-31T23:59:59Z';
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/users/4';
    const content = {
      id: '4',
      created: stringDate,
      updated: stringDate,
      profile: null,
      roles: ['STUDENT'],
      groups: ['GROUP1']
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new UserController(api);
    controller.getUser('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const user = new User('4', null, ['GROUP1'], ['STUDENT']);
        user.created = new Date(stringDate);
        user.updated = new Date(stringDate);
        expect(result).toEqual(user);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

