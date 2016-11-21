import 'jasmine-ajax';
import SpeechChallenge from '../administrative-sdk/speech-challenge/speech-challenge';
import SpeechChallengeController from '../administrative-sdk/speech-challenge/speech-challenge-controller';
import Connection from '../administrative-sdk/connection/connection-controller';

describe('SpeechChallenge object test', () => {
  it('should require all required fields in constructor', () => {
    expect(() => {
      new SpeechChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(() => {
      new SpeechChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(() => {
      new SpeechChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');

    expect(() => {
      new SpeechChallenge('fb', '2', 66, '1');
    }).toThrowError('topic parameter of type "string" is required');
  });
  it('should instantiate a SpeechChallenge with referenceAudio', () => {
    const blob = new Blob(['1234567890']);

    const s = new SpeechChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
  it('should instantiate a SpeechChallenge', () => {
    const s = new SpeechChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(null);
  });
});

describe('SpeechChallenge API interaction test', () => {
  let url;
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const controller = new SpeechChallengeController(api);
  beforeEach(() => {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
    url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should reject creation when organisationId is not present', done => {
    const challenge = new SpeechChallenge(null, '1', 'Hi');
    controller.createSpeechChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should create a challenge without an id', done => {
    const challenge = new SpeechChallenge('fb', null, 'Hi');
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createSpeechChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(1);
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('fb', '1', 'Hi');
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a new challenge', done => {
    const challenge = new SpeechChallenge('fb', '1', 'Hi');
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createSpeechChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(2);
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('fb', '1', 'Hi');
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a new challenge with referenceAudio', done => {
    const blob = new Blob(['1234567890']);
    const challenge = new SpeechChallenge('fb', '1', 'Hi', blob);
    const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createSpeechChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'referenceAudio', blob);
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('fb', '1', 'Hi', blob);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.referenceAudio = challenge.referenceAudio;
        outChallenge.referenceAudioUrl = referenceAudioUrl;
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', done => {
    const challenge = new SpeechChallenge('fb', '1', 'Hi');
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'SpeechChallenge',
          field: 'topic',
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
    controller.createSpeechChallenge(challenge)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(2);
        const errors = [{
          resource: 'SpeechChallenge',
          field: 'topic',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing speech challenge', done => {
    url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/speech/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getSpeechChallenge('fb', '4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new SpeechChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        expect(result).toEqual(challenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing challenges', done => {
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.listSpeechChallenges('fb')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new SpeechChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        expect(result[0]).toEqual(challenge);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
