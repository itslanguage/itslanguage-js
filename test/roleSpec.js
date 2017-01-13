import Connection from '../src/administrative-sdk/connection/connection-controller';
import Role from '../src/administrative-sdk/role/role';
import RoleController from '../src/administrative-sdk/role/role-controller';

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
      }).toThrowError('permission parameter of type "Array.<string>" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const role = new Role('student', ['can_do_everything']);
    expect(role.name).toEqual('student');
    expect(role.permissions).toEqual(['can_do_everything']);
  });

  it('should list roles', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/roles';
    const content = [
      {
        name: 'Admin',
        permissions: [
          'CHOICE_CHALLENGE_CREATE',
          'CHOICE_CHALLENGE_DELETE'
        ]
      },
      {
        name: 'Student',
        permissions: [
          'CHOICE_CHALLENGE_LIST'
        ]
      }
    ];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new RoleController(api);
    controller.getRoles()
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const role1 = new Role('Admin', [
          'CHOICE_CHALLENGE_CREATE',
          'CHOICE_CHALLENGE_DELETE'
        ]);
        const role2 = new Role('Student', [
          'CHOICE_CHALLENGE_LIST'
        ]);
        const expectedResult = [role1, role2];
        expect(result.length).toBe(2);
        expect(result).toEqual(expectedResult);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not get a role on invalid id', done => {
    const controller = new RoleController();
    [0, {}, [], true, false, null, undefined].map(v => {
      controller.getRole(v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('roleId parameter of type "string" is required');
        })
        .then(done);
    });
  });

  it('should get a role', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/roles/4';
    const content = {
      name: 'Student',
      permissions: [
        'CHOICE_CHALLENGE_LIST'
      ]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new RoleController(api);
    controller.getRole('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const role = new Role('Student', [
          'CHOICE_CHALLENGE_LIST'
        ]);
        expect(result).toEqual(role);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
