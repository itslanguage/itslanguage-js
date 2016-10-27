require('jasmine-ajax');
const PronunciationChallenge = require('../administrative-sdk/pronunciation-challenge/pronunciation-challenge');
const Controller = require('../administrative-sdk/pronunciation-challenge/pronunciation-challenge-controller');
const Connection = require('../administrative-sdk/connection/connection-controller');

describe('PronunciationChallenge object test', () => {
  it('should require all required fields in constructor', () => {
    expect(() => {
      new PronunciationChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(() => {
      new PronunciationChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(() => {
      new PronunciationChallenge('1', '1', null);
    }).toThrowError('transcription parameter of type "string" is required');

    expect(() => {
      new PronunciationChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });
  it('should instantiate a PronunciationChallenge ' +
    'without referenceAudio', () => {
    const s = new PronunciationChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBeUndefined();
  });
  it('should instantiate a PronunciationChallenge', () => {
    const blob = new Blob(['1234567890']);

    const s = new PronunciationChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
});

describe('PronunciationChallenge API interaction test', () => {
  const api = new Connection({
    authPrincipal: 'principal',
    authPassword: 'secret'
  });
  const controller = new Controller(api);
  const blob = new Blob(['1234567890']);
  const referenceAudioUrl = 'https://api.itslanguage.nl/download' +
    '/YsjdG37bUGseu8-bsJ';
  let url;


  beforeEach(() => {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');

    url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should check for required referenceAudio field', done => {
    // Because referenceAudio is not available when fetching existing
    // PronunciationChallenges from the server, the domain model doesn't
    // require the field, but the createPronunciationChallenge() should.
    const challenge = new PronunciationChallenge('fb', '1', 'test');

    controller.createPronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('referenceAudio parameter of type "Blob" is required');
      })
      .then(done);
  });

  it('should check for required referenceAudio field', done => {
    const challenge = new PronunciationChallenge('fb', '1', 'test', null);
    controller.createPronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('referenceAudio parameter of type "Blob" is required');
      })
      .then(done);
  });

  it('should not create a new challenge if organisationId is missing', done => {
    const challenge = new PronunciationChallenge(null, '1', 'test', blob);
    controller.createPronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should create a new pronunciation challenge through API', done => {
    const challenge = new PronunciationChallenge('fb', '1', 'test', blob);
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl,
      status: 'preparing'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 202,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createPronunciationChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'referenceAudio', blob);
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'transcription', 'test');
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new PronunciationChallenge('fb', '1', 'test', blob);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.referenceAudio = challenge.referenceAudio;
        outChallenge.referenceAudioUrl = referenceAudioUrl;
        outChallenge.status = 'preparing';
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a new pronunciation challenge through API without an id', done => {
    const challenge = new PronunciationChallenge('fb', null, 'test', blob);
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl,
      status: 'preparing'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 202,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createPronunciationChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'referenceAudio', blob);
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'transcription', 'test');
        expect(FormData.prototype.append.calls.count()).toEqual(2);
        const stringDate = '2014-12-31T23:59:59Z';
        const outChallenge = new PronunciationChallenge('fb', '1', 'test', blob);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.referenceAudio = challenge.referenceAudio;
        outChallenge.referenceAudioUrl = referenceAudioUrl;
        outChallenge.status = 'preparing';
        expect(result).toEqual(outChallenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', done => {
    const challenge = new PronunciationChallenge('fb', 'test', 'hi', blob);
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'transcription',
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

    controller.createPronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', 'test');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'transcription', 'hi');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'referenceAudio', blob);
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        const errors = [{
          resource: 'PronunciationChallenge',
          field: 'transcription',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing pronunciation challenge', done => {
    url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl,
      status: 'prepared'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getPronunciationChallenge('fb', '4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new PronunciationChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        challenge.referenceAudioUrl = referenceAudioUrl;
        challenge.status = 'prepared';
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
      transcription: 'Hi',
      referenceAudioUrl,
      status: 'prepared'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.listPronunciationChallenges('fb')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const challenge = new PronunciationChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        challenge.referenceAudioUrl = referenceAudioUrl;
        challenge.status = 'prepared';
        expect(result[0]).toEqual(challenge);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should reject when deleting a challenge without organisationId', done => {
    const challenge = new PronunciationChallenge(null, '1', 'test', blob);
    controller.deletePronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should reject when deleting a challenge without id', done => {
    const challenge = new PronunciationChallenge('fb', null, 'test', blob);
    controller.deletePronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('id field is required');
      })
      .then(done);
  });

  it('should delete a an existing challenge', done => {
    const challenge = new PronunciationChallenge('fb', 'test', 'hi', blob);
    url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';

    const content =
      {
        status: 204,
        contentType: 'application/json'
      };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.deletePronunciationChallenge(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('DELETE');
        expect(result).toEqual(challenge);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should not delete a non existing challenge', done => {
    const challenge = new PronunciationChallenge('fb', 'test', 'hi', blob);
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'id',
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

    controller.deletePronunciationChallenge(challenge)
      .then(() => {
        fail('An error should be a thrown');
      })
      .catch(error => {
        const errors = [{
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });
});
