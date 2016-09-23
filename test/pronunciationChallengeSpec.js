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
require('jasmine-as-promised')();
const autobahn = require('autobahn');
var Promise = require('es6-promise').Promise;
const its = require('..');

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
    var challenge = new its.PronunciationChallenge('fb', '1', 'test');

    return api.createPronunciationChallenge(challenge)
      .then(function() {

        fail('An error should be thrown');

      }).catch(function(error) {

        expect(error.message).toEqual('referenceAudio parameter of type "Blob" is required');

      });
  });

  it('should check for required referenceAudio field', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new its.PronunciationChallenge('fb', '1', 'test', null);

    return api.createPronunciationChallenge(challenge)
      .then(function() {

        fail('An error should be thrown');

      }).catch(function(error) {

        expect(error.message).toEqual('referenceAudio parameter of type "Blob" is required');

      });
  });

  it('should create a new pronunciation challenge through API', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', '1', 'test', blob);

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
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
    var fakeResponse = {
      status: 202,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.createPronunciationChallenge(challenge);
    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
      expect(FormData.prototype.append).toHaveBeenCalledWith(
        'referenceAudio', blob);
      expect(FormData.prototype.append).toHaveBeenCalledWith(
        'transcription', 'test');
      expect(FormData.prototype.append.calls.count()).toEqual(3);
      var stringDate = '2014-12-31T23:59:59Z';
      var outChallenge = new its.PronunciationChallenge('fb', '1', 'test', blob);
      outChallenge.created = new Date(stringDate);
      outChallenge.updated = new Date(stringDate);
      outChallenge.referenceAudio = challenge.referenceAudio;
      outChallenge.referenceAudioUrl = referenceAudioUrl;
      outChallenge.status = 'preparing';
      expect(result).toEqual(outChallenge);

    }).catch(function(error) {

      fail('No error should be thrown: ' + error);

    });
  });

  it('should handle errors while creating a new challenge', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
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
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.createPronunciationChallenge(challenge);

    return output.then(function() {

      fail('An error should be thrown!');

    }).catch(function(error) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(FormData.prototype.append).toHaveBeenCalledWith('id', 'test');
      expect(FormData.prototype.append).toHaveBeenCalledWith(
        'transcription', 'hi');
      expect(FormData.prototype.append).toHaveBeenCalledWith(
        'referenceAudio', blob);
      expect(FormData.prototype.append.calls.count()).toEqual(3);
      var errors = [{
        resource: 'PronunciationChallenge',
        field: 'transcription',
        code: 'missing'
      }];
      expect(error.errors.errors).toEqual(errors);

    });
  });

  it('should get an existing pronunciation challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4';
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
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.getPronunciationChallenge('fb', '4');
    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
      challenge.created = new Date(stringDate);
      challenge.updated = new Date(stringDate);
      challenge.referenceAudioUrl = referenceAudioUrl;
      challenge.status = 'prepared';
      expect(result).toEqual(challenge);

    }).catch(function(error) {

      fail('No error should be thrown: ' + error);

    });
  });

  it('should get a list of existing challenges', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
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
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.listPronunciationChallenges('fb');
    expect(output).toEqual(jasmine.any(Promise));

    return output.catch(function(error) {

      fail('No error should be thrown: ' + error);

    }).then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
      challenge.created = new Date(stringDate);
      challenge.updated = new Date(stringDate);
      challenge.referenceAudioUrl = referenceAudioUrl;
      challenge.status = 'prepared';
      expect(result[0]).toEqual(challenge);
      expect(result.length).toBe(1);
    });
  });

  it('should delete a an existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';

    jasmine.Ajax.stubRequest(url).andReturn({
      status: 204,
      contentType: 'application/json'
    });

    var output = api.deletePronunciationChallenge(challenge);
    expect(output).toEqual(jasmine.any(Promise));

    return output.catch(function(error) {

      fail('No error should be thrown: ' + error);

    }).then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('DELETE');
      expect(result).toEqual(challenge);

    });
  });

  it('should not delete a non existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';
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
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.deletePronunciationChallenge(challenge);
    expect(output).toEqual(jasmine.any(Promise));

    return output
      .then(function(result) {

        fail('An error should be a thrown');

      })
      .catch(function(error) {

        var errors = [{
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);

      });
  });
});
