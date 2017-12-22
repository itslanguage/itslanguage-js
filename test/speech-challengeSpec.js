import {AdministrativeSDK} from '../src/index';
import Connection from '../src/administrative-sdk/connection/connection-controller';
import SpeechChallenge from '../src/administrative-sdk/speech-challenge/speech-challenge';
import SpeechChallengeController from '../src/administrative-sdk/speech-challenge/speech-challenge-controller';

describe('Create SpeechChallenge', () => {
  // reset the settings object to "normal"
  afterEach(() => {
    new Connection({
      apiUrl: 'https://api.itslanguage.nl',
      oAuth2Token: 'fake_token'
    });
  });

  it('should not thow only relative url\'s are allowd', done => {
    const config = {
      apiUrl: 'https://custom.url.itslanguage.nl',
      oAuth2Token: 'fake_token'
    };

    const connection = new Connection(config);
    const sdk = new AdministrativeSDK(connection);
    const challenge = new SpeechChallenge('custom_challenge');
    const result = sdk.createSpeechChallenge(challenge);

    result
      .catch(error => {
        expect(error).not.toEqual('Only relative ITSLanguage API URLs are allowed.');
      })
      .then(done);
  });
});

describe('SpeechChallenge object test', () => {
  it('should not construct with an invalid id', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(v);
      }).toThrowError('id parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid topic', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(undefined, v);
      }).toThrowError('topic parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid referenceAudioUrl', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(undefined, undefined, v);
      }).toThrowError('referenceAudioUrl parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid srtUrl', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(undefined, undefined, undefined, v);
      }).toThrowError('srtUrl parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid imageUrl', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(undefined, undefined, undefined, undefined, v);
      }).toThrowError('imageUrl parameter of type "string|null" is required');
    });
  });

  it('should not construct with an invalid metadata', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new SpeechChallenge(undefined, undefined, undefined, undefined, undefined, v);
      }).toThrowError('metadata parameter of type "string|null" is required');
    });
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

  it('should instantiate a SpeechChallenge without topic', () => {
    const s = new SpeechChallenge('test', null, null);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.topic).toBeNull();
    expect(s.referenceAudioUrl).toBeNull();
  });

  it('should instantiate a SpeechChallenge without id', () => {
    const s = new SpeechChallenge(null, null, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.topic).toBeNull();
    expect(s.referenceAudioUrl).toBeNull();
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

  it('should not create a challenge with an invalid speechChallenge', done => {
    [0, '0', {}, [], true, false, null, undefined].map(v => {
      controller.createSpeechChallenge(v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('speechChallenge field of type "SpeechChallenge" is required');
        })
        .then(done);
    });
  });

  it('should not create a challenge with an invalid audioBlob', done => {
    [0, '0', {}, [], true, false].map(v => {
      controller.createSpeechChallenge(new SpeechChallenge(), v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('audioBlob parameter of type "Blob|null" is required');
        })
        .then(done);
    });
  });

  it('should not create a challenge with an invalid srtFile', done => {
    [0, '0', {}, [], true, false].map(v => {
      controller.createSpeechChallenge(new SpeechChallenge(), new Blob(['1234567890']), v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('srtFile parameter of type "Blob|null" is required');
        })
        .then(done);
    });
  });

  it('should not create a challenge with an invalid image', done => {
    [0, '0', {}, [], true, false].map(v => {
      controller.createSpeechChallenge(new SpeechChallenge(), new Blob(['1234567890']), new Blob(['1234567890']), v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('image parameter of type "Blob|null" is required');
        })
        .then(done);
    });
  });

  it('should not create a challenge with invalid metadata', done => {
    [0, {}, [], true, false].map(v => {
      controller.createSpeechChallenge(new SpeechChallenge(),
        new Blob(['1234567890']), new Blob(['1234567890']), null, v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('metadata parameter of type "string|null" is required');
        })
        .then(done);
    });
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

  it('should not get on invalid challenge id', done => {
    [0, {}, [], true, false, null, undefined].map(v => {
      controller.getSpeechChallenge(v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('challengeId field of type "string" is required');
        })
        .then(done);
    });
  });

  it('should get an existing speech challenge', done => {
    url = 'https://api.itslanguage.nl/challenges/speech/4';
    const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      referenceAudioUrl,
      topic: 'Hi'
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
        challenge.referenceAudioUrl = referenceAudioUrl;
        expect(result).toEqual(challenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing challenges', done => {
    const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      referenceAudioUrl,
      topic: 'Hi'
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
        challenge.referenceAudioUrl = referenceAudioUrl;
        expect(result[0]).toEqual(challenge);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
