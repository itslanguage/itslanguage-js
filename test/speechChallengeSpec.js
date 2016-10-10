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

const SpeechChallenge = require('../administrative-sdk/speechChallenge').SpeechChallenge;
const Connection = require('../administrative-sdk/connection').Connection;

describe('SpeechChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new SpeechChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(function() {
      new SpeechChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new SpeechChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });
  it('should instantiate a SpeechChallenge with referenceAudio', function() {
    var blob = new Blob(['1234567890']);

    var s = new SpeechChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
  it('should instantiate a SpeechChallenge', function() {
    var s = new SpeechChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(null);
  });
});

describe('SpeechChallenge API interaction test', function() {
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

  it('should create a new challenge', function() {
    var challenge = new SpeechChallenge('fb', '1', 'Hi');
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var output = challenge.createSpeechChallenge(api, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(2);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new SpeechChallenge('fb', '1', 'Hi');
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });
  it('should create a new challenge with referenceAudio', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new SpeechChallenge('fb', '1', 'Hi', blob);
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var output = challenge.createSpeechChallenge(api, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: referenceAudioUrl
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new SpeechChallenge('fb', '1', 'Hi', blob, api);
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    outChallenge.referenceAudio = challenge.referenceAudio;
    outChallenge.referenceAudioUrl = referenceAudioUrl;
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new SpeechChallenge('fb', '1', 'Hi');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = challenge.createSpeechChallenge(api, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(2);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'SpeechChallenge',
          field: 'topic',
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
    var errors = [{resource: 'SpeechChallenge',
      field: 'topic',
      code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing speech challenge', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var output = SpeechChallenge.getSpeechChallenge(api, 'fb', '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/speech/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new SpeechChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var output = SpeechChallenge.listSpeechChallenges(api, 'fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new SpeechChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith([challenge]);
  });
});
