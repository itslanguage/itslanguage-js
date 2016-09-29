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

const its = require('../administrative-sdk/choiceChallenge');
const connection = require('../administrative-sdk/connection');

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
    var cb = jasmine.createSpy('callback');

    var api = new connection.Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    challenge.connection = api;
    var output = challenge.createChoiceChallenge(cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'b');
    expect(FormData.prototype.append.calls.count()).toEqual(4);

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
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var api = new connection.Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    challenge.connection = api;
    var output = challenge.createChoiceChallenge(cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

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
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'ChoiceChallenge',
      field: 'question',
      code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing choice challenge', function() {
    var api = new connection.Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var chal = new its.ChoiceChallenge('fb', '1', 'q', ['a', 'b']);
    chal.connection = api;
    var cb = jasmine.createSpy('callback');

    var output = chal.getChoiceChallenge('fb', '1', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/1';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

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
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new connection.Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var chal = new its.ChoiceChallenge('fb', '1', 'q', ['a', 'b']);
    chal.connection = api;
    var cb = jasmine.createSpy('callback');

    var output = chal.listChoiceChallenges('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

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
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '4', 'q', ['a', 'a2']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith([challenge]);
  });
});
