require('jasmine-ajax');
const ChoiceChallenge = require('../administrative-sdk/choice-challenge/choice-challenge');
const ChoiceChallengeController = require('../administrative-sdk/choice-challenge/choice-challenge-controller');
const Connection = require('../administrative-sdk/connection/connection-controller');

describe('ChoiceChallenge object test', () => {
  it('should require all required fields in constructor', () => {
    [0, 4, undefined, false, null].map(v => {
      expect(() => {
        new ChoiceChallenge(v);
      }).toThrowError(
        'organisationId parameter of type "string" is required');
    });

    [0, 4, false].map(v => {
      expect(() => {
        new ChoiceChallenge('org', v);
      }).toThrowError(
        'id parameter of type "string|null|undefined" is required');
    });
    expect(() => {
      new ChoiceChallenge('org', '');
    }).toThrowError(
      'id parameter should not be an empty string');

    [0, 4, false].map(v => {
      expect(() => {
        new ChoiceChallenge('org', null, v);
      }).toThrowError(
        'question parameter of type "string|null|undefined" is required');
    });

    [0, 4, undefined, false].map(v => {
      expect(() => {
        new ChoiceChallenge('org', null, 'question', v);
      }).toThrowError('choices parameter of type "Array" is required');
    });
  });
  it('should instantiate a ChoiceChallenge', () => {
    const s = new ChoiceChallenge('fb', 'test', 'q', ['a', 'a2']);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.question).toBe('q');
    expect(s.choices).toEqual(['a', 'a2']);
  });
});

describe('ChoiceChallenge API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should create a new choice challenge through API', done => {
    const challenge = new ChoiceChallenge('fb', '1', 'q', ['a', 'b']);
    const stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';

    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';

    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
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
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createChoiceChallenge(challenge)
      .then(() => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
        expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
        expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'b');
        expect(FormData.prototype.append.calls.count()).toEqual(4);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', done => {
    const challenge = new ChoiceChallenge('fb', '1', 'q', ['a']);

    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
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
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createChoiceChallenge(challenge)
      .then(() => {
        fail('No result should be returned');
      }).catch(error => {
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
        expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        const errors = [{
          resource: 'ChoiceChallenge',
          field: 'question',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing choice challenge', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/1';

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
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const stringDate = '2014-12-31T23:59:59Z';
    const challenge = new ChoiceChallenge('fb', '1', 'q', ['a']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    const controller = new ChoiceChallengeController(api);
    controller.getChoiceChallenge('fb', '1')
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
      authPrincipal: 'principal',
      authPassword: 'secret'
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
        choice: 'a2',
        audioUrl: ''
      }]
    }];

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';

    const stringDate = '2014-12-31T23:59:59Z';
    const challenge = new ChoiceChallenge('fb', '4', 'q', ['a', 'a2']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'prepared';
    const controller = new ChoiceChallengeController(api);
    controller.listChoiceChallenges('fb')
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
