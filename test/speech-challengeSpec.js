import Connection from '../src/administrative-sdk/connection/connection-controller';
import SpeechChallenge from '../src/administrative-sdk/speech-challenge/speech-challenge';
import SpeechChallengeController from '../src/administrative-sdk/speech-challenge/speech-challenge-controller';

describe('SpeechChallenge object test', () => {
  it('should require all required fields in constructor', () => {
    expect(() => {
      new SpeechChallenge(4);
    }).toThrowError('id parameter of type "string|null" is required');

    [0, {}, [], true, false, undefined].map(v => {
      expect(() => {
        new SpeechChallenge('hi', '1', v);
      }).toThrowError('referenceAudioUrl parameter of type "string|null" is required');
    });

    expect(() => {
      new SpeechChallenge('1', 66);
    }).toThrowError('topic parameter of type "string" is required');

    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge('hi', '1', null, v);
      }).toThrowError('srtUrl parameter of type "string|null" is required');
    });

    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge('hi', '1', null, null, v);
      }).toThrowError('imageUrl parameter of type "string|null" is required');
    });
  });
  it('should instantiate a SpeechChallenge with referenceAudioUrl', () => {
    const url = 'www.downloadaudiohere.exe.com';

    const s = new SpeechChallenge('test', 'hi', url);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudioUrl).toBe(url);
  });

  it('should instantiate a SpeechChallenge with all URLs', () => {
    const url = 'www.downloadaudiohere.exe.com';
    const srtUrl = 'www.downloadsrtfilehere.scr.com';
    const imageUrl = 'www.downloadimagehere.bat.com';

    const s = new SpeechChallenge('test', 'hi', url, srtUrl, imageUrl);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudioUrl).toBe(url);
    expect(s.srtUrl).toBe(srtUrl);
    expect(s.imageUrl).toBe(imageUrl);
  });

  it('should instantiate a SpeechChallenge', () => {
    const s = new SpeechChallenge('test', 'hi', null);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudioUrl).toBe(null);
  });
});

describe('SpeechChallenge API interaction test', () => {
  let url;
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const controller = new SpeechChallengeController(api);
  beforeEach(() => {
    spyOn(FormData.prototype, 'append');
    url = 'https://api.itslanguage.nl/challenges/speech';
  });

  it('should create a challenge without an id', done => {
    const challenge = new SpeechChallenge(null, 'Hi', null);
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: null
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createSpeechChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('1', 'Hi', null);
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
    const challenge = new SpeechChallenge('1', 'Hi', null);
    const srtUrl = 'www.downloadsrtfilehere.scr.com';
    const imageUrl = 'www.downloadimagehere.bat.com';
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: null,
      srtUrl,
      imageUrl
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createSpeechChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('1', 'Hi', null, srtUrl, imageUrl);
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
    const challenge = new SpeechChallenge('1', 'Hi', null);
    const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    const content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createSpeechChallenge(challenge, blob)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new SpeechChallenge('1', 'Hi', referenceAudioUrl);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.referenceAudioUrl = referenceAudioUrl;
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', done => {
    const challenge = new SpeechChallenge('1', 'Hi', null);
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
      headers: {
        'Content-type': 'application/json; charset=utf-8'
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
        expect(request[1].body).toEqual(JSON.stringify(challenge));
        const errors = [{
          resource: 'SpeechChallenge',
          field: 'topic',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should not get when challenge id is missing', done => {
    controller.getSpeechChallenge()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should get an existing speech challenge', done => {
    url = 'https://api.itslanguage.nl/challenges/speech/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: null
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getSpeechChallenge('4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new SpeechChallenge('4', 'Hi', null);
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
      topic: 'Hi',
      referenceAudioUrl: null
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getSpeechChallenges()
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new SpeechChallenge('4', 'Hi', null);
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
