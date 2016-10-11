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
 fail,
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

  it('should create a new challenge', function(done) {
    var challenge = new SpeechChallenge('fb', '1', 'Hi');
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    var fakeResponse = {
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    challenge.createSpeechChallenge(api)
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(2);
        var stringDate = '2014-12-31T23:59:59Z';
        var outChallenge = new SpeechChallenge('fb', '1', 'Hi');
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        expect(result).toEqual(outChallenge);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should create a new challenge with referenceAudio', function(done) {
    var blob = new Blob(['1234567890']);
    var challenge = new SpeechChallenge('fb', '1', 'Hi', blob);
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
      '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: referenceAudioUrl
    };
    var fakeResponse = {
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    challenge.createSpeechChallenge(api)
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith(
          'referenceAudio', blob);
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        var stringDate = '2014-12-31T23:59:59Z';
        var outChallenge = new SpeechChallenge('fb', '1', 'Hi', blob);
        outChallenge.created = new Date(stringDate);
        outChallenge.updated = new Date(stringDate);
        outChallenge.referenceAudio = challenge.referenceAudio;
        outChallenge.referenceAudioUrl = referenceAudioUrl;
        expect(result).toEqual(outChallenge);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new challenge', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new SpeechChallenge('fb', '1', 'Hi');
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
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
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    challenge.createSpeechChallenge(api)
      .then(function() {
        fail('An error should be thrown!');
      })
      .catch(function(error) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('POST');
        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
        expect(FormData.prototype.append.calls.count()).toEqual(2);
        var errors = [{
          resource: 'SpeechChallenge',
          field: 'topic',
          code: 'missing'
        }];
        expect(error.errors.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing speech challenge', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/speech/4';
    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    SpeechChallenge.getSpeechChallenge(api, 'fb', '4')
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var challenge = new SpeechChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        expect(result).toEqual(challenge);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing challenges', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    }];
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    SpeechChallenge.listSpeechChallenges(api, 'fb')
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var challenge = new SpeechChallenge('fb', '4', 'Hi');
        challenge.created = new Date(stringDate);
        challenge.updated = new Date(stringDate);
        expect(result[0]).toEqual(challenge);
        expect(result.length).toBe(1);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
