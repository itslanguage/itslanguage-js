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
const its = require('../');

describe('ChoiceChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    [0, 4, undefined, false, null].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge(v);
      }).toThrowError(
        'organisationId parameter of type "string" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', v);
      }).toThrowError(
        'id parameter of type "string|null|undefined" is required');
    });
    expect(function() {
      new its.ChoiceChallenge('org', '');
    }).toThrowError(
      'id parameter should not be an empty string');

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', null, v);
      }).toThrowError(
        'question parameter of type "string|null|undefined" is required');
    });

    [0, 4, undefined, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', null, 'question', v);
      }).toThrowError('choices parameter of type "Array" is required');
    });
  });
  it('should instantiate a ChoiceChallenge', function() {
    var s = new its.ChoiceChallenge('fb', 'test', 'q', ['a', 'a2']);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.question).toBe('q');
    expect(s.choices).toEqual(['a', 'a2']);
  });
});


describe('ChoiceChallenge API interaction test', function() {
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

  it('should create a new choice challenge through API', function() {
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a', 'b']);
    var stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';

    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var content = {
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

    var fakeResponse = {
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.createChoiceChallenge(challenge);

    expect(output).toEqual(jasmine.any(Promise));

    return output.then(function(result) {
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('POST');
      expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
      expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
      expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
      expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'b');
      expect(FormData.prototype.append.calls.count()).toEqual(4);
    });
  });

  it('should handle errors while creating a new challenge', function() {
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'ChoiceChallenge',
          field: 'question',
          code: 'missing'
        }
      ]
    };
    var fakeResponse = {
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.createChoiceChallenge(challenge);
    expect(output).toEqual(jasmine.any(Promise));

    return output
      .then(function(result) {

        fail('No result should be returned');

      }).catch(function(error) {

        expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
        expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
        expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
        expect(FormData.prototype.append.calls.count()).toEqual(3);
        var errors = [{
          resource: 'ChoiceChallenge',
          field: 'question',
          code: 'missing'
        }];
        expect(error.errors.errors).toEqual(errors);

      });
  });

  it('should get an existing choice challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/1';

    var content = {
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

    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.getChoiceChallenge('fb', '1');
    expect(output).toEqual(jasmine.any(Promise));

    var request = jasmine.Ajax.requests.mostRecent();

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';

    return output.then(function(result) {
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
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

    var content = [{
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

    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '4', 'q', ['a', 'a2']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'prepared';
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.listChoiceChallenges('fb');
    expect(output).toEqual(jasmine.any(Promise));

    var request = jasmine.Ajax.requests.mostRecent();

    return output.then(function(result) {
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(challenge);
    }).catch(function(error) {
      fail('No error should be thrown : ' + error);
    });
  });
});
