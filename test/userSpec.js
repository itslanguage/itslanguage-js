import Connection from '../src/administrative-sdk/connection/connection-controller';
import User from '../src/administrative-sdk/user/user';
import UserController from '../src/administrative-sdk/user/user-controller';

describe('User object test', () => {
  it('should not instantiate a User without an organisationId', () => {
    expect(() => {
      new User();
    }).toThrowError('organisationId parameter of type "string" is required');
  });

  it('should not instantiate a User with an organisationId as number', () => {
    expect(() => {
      new User(1);
    }).toThrowError('organisationId parameter of type "string" is required');
  });

  it('should not instantiate a User with an id as number', () => {
    expect(() => {
      new User('1', 1);
    }).toThrowError('id parameter of type "string|null" is required');
  });

  it('should not instantiate a User with a birthYear as string', () => {
    expect(() => {
      new User('fb', 'test', 'Mark', 'Zuckerberg', 'male', '1984');
    }).toThrowError('birthYear parameter of type "number|null" is required');
  });

  it('should instantiate a User with id and metadata', () => {
    const s = new User('fb', 'test', 'Mark', 'Zuckerberg', 'male', 1984);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.firstName).toBe('Mark');
    expect(s.lastName).toBe('Zuckerberg');
    expect(s.gender).toBe('male');
    expect(s.birthYear).toBe(1984);
  });
});

describe('User API interaction test', () => {
  it('should not create when user.organisationId is missing', done => {
    const user = new User('fb', '1', 'Mark');
    user.organisationId = null;
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    controller.createUser(user)
      .then(fail)
      .catch(err => {
        expect(err.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should create a new user through API', done => {
    const user = new User('fb', '1', 'Mark');
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    const url = 'https://api.itslanguage.nl/organisations/fb/users';
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createUser(user)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        const expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark',
          created: null,
          updated: null
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        const stringDate = '2014-12-31T23:59:59Z';
        user.created = new Date(stringDate);
        user.updated = new Date(stringDate);
        expect(result).toEqual(user);
        expect(result.id).toBe('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
        expect(result.firstName).toBe('Mark');
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new user', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    const user = new User('fb', '1', 'Mark');
    const url = 'https://api.itslanguage.nl/organisations/fb/users';
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'User',
          field: 'lastName',
          code: 'missing'
        }
      ]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createUser(user)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        const expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark',
          created: null,
          updated: null
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        const errors = [{
          resource: 'User',
          field: 'lastName',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should not get when organisation id is missing', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    controller.getUser()
      .then(fail)
      .catch(err => {
        expect(err.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should not get when user id is missing', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    controller.getUser('fb')
      .then(fail)
      .catch(err => {
        expect(err.message).toEqual('userId field is required');
      })
      .then(done);
  });

  it('should get an existing user through API', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/users/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    const controller = new UserController(api);
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getUser('fb', '4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const user = new User('fb', '4', 'Mark');
        user.created = new Date(stringDate);
        user.updated = new Date(stringDate);
        expect(result).toEqual(user);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not list when organisation id is missing', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    controller.listUsers()
      .then(fail)
      .catch(err => {
        expect(err.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should get a list of existing users through API', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/users';
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new UserController(api);
    controller.listUsers('fb')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const user = new User('fb', '4', 'Mark');
        user.created = new Date(stringDate);
        user.updated = new Date(stringDate);
        expect(result[0]).toEqual(user);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
