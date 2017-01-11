import Connection from '../src/administrative-sdk/connection/connection-controller';
import Profile from '../src/administrative-sdk/profile/profile';
import ProfileController from '../src/administrative-sdk/profile/profile-controller';

describe('Profile', () => {
  describe('Constructor', () => {
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
      [0, {}, true, false, []].map(v => {
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
        }).toThrowError('birthDate parameter of type "Date" is required');
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
  describe('API calls', () => {
    it('should not get a profile with invalid parameters', done => {
      const controller = new ProfileController();
      [0, {}, [], true, false, null, undefined].map(v => {
        controller.getProfile(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('userId parameter of type "string" is required');
          })
          .then(done);
      });
    });

    it('should get a profile through the api', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/profiles/4';
      const content = {
        firstName: 'agent',
        lastName: 'smith',
        gender: 'virtual',
        birthDate: stringDate,
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
      const controller = new ProfileController(api);
      controller.getProfile('4')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          const profile = new Profile('agent', 'smith', null, 'virtual', new Date(stringDate));
          profile.created = new Date(stringDate);
          profile.updated = new Date(stringDate);
          expect(result).toEqual(profile);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });

    it('should get a list of existing profiles through API', done => {
      const stringDate = '2014-12-31T23:59:59Z';
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/profiles';
      const content = [{
        firstName: 'agent',
        lastName: 'smith',
        gender: 'virtual',
        birthDate: stringDate,
        created: stringDate,
        updated: stringDate
      },
      {
        firstName: 'kees',
        infix: 'van de',
        lastName: 'broek',
        gender: 'male',
        birthDate: stringDate,
        created: stringDate,
        updated: stringDate
      }];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new ProfileController(api);
      controller.getProfiles()
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');

          const profile1 = new Profile('agent', 'smith', null, 'virtual', new Date(stringDate));
          const profile2 = new Profile('kees', 'broek', 'van de', 'male', new Date(stringDate));
          profile1.created = new Date(stringDate);
          profile1.updated = new Date(stringDate);
          profile2.created = new Date(stringDate);
          profile2.updated = new Date(stringDate);
          const profiles = [profile1, profile2];
          expect(result.length).toBe(2);
          expect(result).toEqual(profiles);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });
  });
});
