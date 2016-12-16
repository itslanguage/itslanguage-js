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

describe('User API interaction test', () => {
  it('should list users', done => {
    const stringDate = '2014-12-31T23:59:59Z';
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new UserController(api);
    const url = 'https://api.itslanguage.nl/users';
    const content = [
      {
        "id": "sdcjb823jhguys5j",
        "firstName": "Najat",
        "infix": "van der",
        "lastName": "Lee",
        "tenantId": null,
        "created": stringDate,
        "updated": stringDate
      },
      {
        "id": "iosdhrfd893ufg",
        "firstName": "Chrissy",
        "infix": null,
        "lastName": "Haagen",
        "tenantId": null,
        "created": stringDate,
        "updated": stringDate
      }
    ];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.listUsers()
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        expect(result.length).toEqual(2);
        expect(result[0]).toEqual(jasmine.any(User));
        expect(result[0].created).toEqual(new Date(stringDate));
        expect(result[0].updated).toEqual(new Date(stringDate));
        expect(result[1]).toEqual(jasmine.any(User));
        expect(result[1].created).toEqual(new Date(stringDate));
        expect(result[1].updated).toEqual(new Date(stringDate));
      })
      .catch(fail)
      .then(done);
  });
});

