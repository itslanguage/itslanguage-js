/* eslint-disable
 camelcase,
 new-cap
 */

/* global
 afterEach,
 beforeEach,
 describe,
 expect,
 it,
 jasmine,
 spyOn,
 window,
 FormData
 */

require('jasmine-ajax');

const its = require('../../');

describe('PronunciationChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new its.PronunciationChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(function() {
      new its.PronunciationChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new its.PronunciationChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });
  it('should instantiate a PronunciationChallenge ' +
    'without referenceAudio', function() {
    var s = new its.PronunciationChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBeUndefined();
  });
  it('should instantiate a PronunciationChallenge', function() {
    var blob = new Blob(['1234567890']);

    var s = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
});


describe('PronunciationChallenge API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should check for required referenceAudio field', function() {
    // Because referenceAudio is not available when fetching existing
    // PronunciationChallenges from the server, the domain model doesn't
    // require the field, but the createPronunciationChallenge() should.
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.PronunciationChallenge('fb', '1', 'test');
    expect(function() {
      api.createPronunciationChallenge(challenge, cb);
    }).toThrowError('referenceAudio parameter of type "Blob" is required');

    challenge = new its.PronunciationChallenge('fb', '1', 'test', null);
    expect(function() {
      api.createPronunciationChallenge(challenge, cb);
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });

  it('should create a new pronunciation challenge through API', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', '1', 'test', blob);
    var cb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createPronunciationChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'transcription', 'test');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl: referenceAudioUrl,
      status: 'preparing'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 202,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new its.PronunciationChallenge('fb', '1', 'test', blob);
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    outChallenge.referenceAudio = challenge.referenceAudio;
    outChallenge.referenceAudioUrl = referenceAudioUrl;
    outChallenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createPronunciationChallenge(challenge, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', 'test');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'transcription', 'hi');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'transcription',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'PronunciationChallenge',
      field: 'transcription',
      code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing pronunciation challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getPronunciationChallenge('fb', '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl: referenceAudioUrl,
      status: 'prepared'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.referenceAudioUrl = referenceAudioUrl;
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listPronunciationChallenges('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl: referenceAudioUrl,
      status: 'prepared'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.referenceAudioUrl = referenceAudioUrl;
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith([challenge]);
  });

  it('should delete a an existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);

    var output = api.deletePronunciationChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';
    expect(request.url).toBe(url);
    expect(request.method).toBe('DELETE');

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 204,
      contentType: 'application/json'
    });

    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should not delete a non existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);

    var output = api.deletePronunciationChallenge(challenge, cb, ecb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';
    expect(request.url).toBe(url);
    expect(request.method).toBe('DELETE');

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'PronunciationChallenge',
      field: 'id',
      code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });
});
