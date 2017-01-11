import ChoiceChallenge from '../src/administrative-sdk/choice-challenge/choice-challenge';
import ChoiceChallengeController from '../src/administrative-sdk/choice-challenge/choice-challenge-controller';
import Connection from '../src/administrative-sdk/connection/connection-controller';

describe('ChoiceChallenge object test', () => {
  it('should require all required fields in constructor', () => {
    [0, 4, false].map(v => {
      expect(() => {
        new ChoiceChallenge(v);
      }).toThrowError(
        'id parameter of type "string|null|undefined" is required');
    });
    expect(() => {
      new ChoiceChallenge('');
    }).toThrowError(
      'id parameter should not be an empty string');

    [0, 4, false].map(v => {
      expect(() => {
        new ChoiceChallenge(null, v);
      }).toThrowError(
        'question parameter of type "string|null|undefined" is required');
    });

    [0, 4, undefined, false].map(v => {
      expect(() => {
        new ChoiceChallenge(null, 'question', v);
      }).toThrowError('choices parameter of type "Array" is required');
    });
  });
  it('should instantiate a ChoiceChallenge', () => {
    const s = new ChoiceChallenge('test', 'q', ['a', 'aa']);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.question).toBe('q');
    expect(s.choices).toEqual(['a', 'aa']);
  });
});

describe('ChoiceChallenge API interaction test', () => {
  beforeEach(() => {
    spyOn(FormData.prototype, 'append');
  });

  it('should create a new choice challenge through API', done => {
    const challenge = new ChoiceChallenge('1', 'q', ['a', 'b']);
    const stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';

    const url = 'https://api.itslanguage.nl/challenges/choice';

    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new ChoiceChallengeController(api);
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'preparing',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }]
    };

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createChoiceChallenge(challenge)
      .then(() => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a challenge without id', done => {
    const challenge = new ChoiceChallenge(null, 'q', ['a', 'b']);
    const stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';

    const url = 'https://api.itslanguage.nl/challenges/choice';

    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new ChoiceChallengeController(api);
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'preparing',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }]
    };

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createChoiceChallenge(challenge)
      .then(() => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', done => {
    const challenge = new ChoiceChallenge('1', 'q', ['a']);

    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new ChoiceChallengeController(api);
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'ChoiceChallenge',
          field: 'question',
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

    controller.createChoiceChallenge(challenge)
      .then(() => {
        fail('No result should be returned');
      }).catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const errors = [{
          resource: 'ChoiceChallenge',
          field: 'question',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should fail to get when challenge id is missing', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new ChoiceChallengeController(api);
    controller.getChoiceChallenge()
      .then(() => fail('No result should be returned'))
      .catch(error => expect(error.message).toEqual('challengeId field is required'))
      .then(done);
  });

  it('should get an existing choice challenge', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const url = 'https://api.itslanguage.nl/challenges/choice/1';

    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'preparing',
      choices: [
        {
          choice: 'a',
          audioUrl: ''
        }
      ]
    };

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const stringDate = '2014-12-31T23:59:59Z';
    const challenge = new ChoiceChallenge('1', 'q', ['a']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    const controller = new ChoiceChallengeController(api);
    controller.getChoiceChallenge('1')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        expect(result).toEqual(challenge);
      }).catch(error => {
        fail('No error should be thrown: ' + error);
      }).then(done);
  });

  it('should get a list of existing challenges', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });

    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'prepared',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }, {
        choice: 'aa',
        audioUrl: ''
      }]
    }];

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const url = 'https://api.itslanguage.nl/challenges/choice';

    const stringDate = '2014-12-31T23:59:59Z';
    const challenge = new ChoiceChallenge('4', 'q', ['a', 'aa']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'prepared';
    const controller = new ChoiceChallengeController(api);
    controller.getChoiceChallenges('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        expect(result.length).toBe(1);
        expect(result[0]).toEqual(challenge);
      }).catch(error => {
        fail('No error should be thrown : ' + error);
      }).then(done);
  });
});
