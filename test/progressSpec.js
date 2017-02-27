import Connection from '../src/administrative-sdk/connection/connection-controller';
import Progress from '../src/administrative-sdk/progress/progress';
import ProgressController from '../src/administrative-sdk/progress/progress-controller';

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
    });
  });
  describe('API', () => {
    it('should not get progress with invalid categoryId parameter', done => {
      const controller = new ProgressController();
      [0, {}, [], true, false, null, undefined].map(v => {
        controller.getProgress(v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('categoryId parameter of type "string" is required');
          })
          .then(done);
      });
    });

    it('should not get progress with invalid groupId parameter', done => {
      const controller = new ProgressController();
      [0, {}, [], true, false].map(v => {
        controller.getProgress('x', v)
          .then(fail)
          .catch(error => {
            expect(error.message).toEqual('groupId parameter of type "string|null" is required');
          })
          .then(done);
      });
    });

    it('should get progress through the api', done => {
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/categories/category_x/progress';
      const content = [
        {
          percentage: 100,
          category: 'category_x',
          challenges: [
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/4efde4469b7f4d5f9d2fcafefaf993f1',
              id: 'assignment_a',
              recording: {
                id: '5066549580791808',
                audioUrl: 'https://api.itslanguage.nl/download/746f95e09334440ca186b1b387959037'
              }
            },
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/5c1c2066b1384b8dacce9ea2328b576c',
              id: 'assignment_b',
              recording: null
            },
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/ee07b91a14d64e3f9d750c3e6716ed84',
              id: 'assignment_c',
              recording: null
            }
          ],
          user: {
            infix: '',
            id: 'user1',
            firstName: 'Usert',
            lastName: 'Rules'
          }
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new ProgressController(api);
      controller.getProgress('category_x')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          expect(result.length).toBe(1);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });

    it('should get progress through the api with groupId', done => {
      const api = new Connection({
        oAuth2Token: 'token'
      });
      const url = 'https://api.itslanguage.nl/categories/category_x/progress?group=Groep_3';
      const content = [
        {
          percentage: 100,
          category: 'category_x',
          challenges: [
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/4efde4469b7f4d5f9d2fcafefaf993f1',
              id: 'assignment_a',
              recording: {
                id: '5066549580791808',
                audioUrl: 'https://api.itslanguage.nl/download/746f95e09334440ca186b1b387959037'
              }
            },
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/5c1c2066b1384b8dacce9ea2328b576c',
              id: 'assignment_b',
              recording: null
            },
            {
              referenceAudioUrl: 'https://api.itslanguage.nl/download/ee07b91a14d64e3f9d750c3e6716ed84',
              id: 'assignment_c',
              recording: null
            }
          ],
          user: {
            infix: '',
            id: 'user1',
            firstName: 'Usert',
            lastName: 'Rules'
          }
        }
      ];
      const fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        headers: {
          'Content-type': 'application/json; charset=utf-8'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const controller = new ProgressController(api);
      controller.getProgress('category_x', 'Groep_3')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].method).toBe('GET');
          expect(result.length).toBe(1);
        })
        .catch(error => {
          fail('No error should be thrown: ' + error);
        })
        .then(done);
    });
  });
});
