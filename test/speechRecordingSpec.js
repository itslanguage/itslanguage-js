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

describe('SpeechRecording object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new its.SpeechRecording();
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');
    expect(function() {
      new its.SpeechRecording(1);
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');

    var challenge = new its.SpeechChallenge('fb');
    expect(function() {
      new its.SpeechRecording(challenge);
    }).toThrowError(
      'student parameter of type "Student" is required');
    expect(function() {
      new its.SpeechRecording(challenge, 1);
    }).toThrowError(
      'student parameter of type "Student" is required');

    var student = new its.Student('org');
    expect(function() {
      new its.SpeechRecording(challenge, student, 1);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new its.SpeechRecording(challenge, student, '1', 'foo');
    }).toThrowError('audio parameter of type "Blob|null" is required');
  });
  it('should instantiate a SpeechRecording', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb');
    var student = new its.Student('org');

    // Without audio
    var s = new its.SpeechRecording(challenge, student, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.audio).toBeUndefined();
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // Without id
    s = new its.SpeechRecording(challenge, student, null, blob);
    expect(s).toBeDefined();
    expect(s.id).toBe(null);
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // With id
    s = new its.SpeechRecording(challenge, student, 'test', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);
  });
});


describe('SpeechRecording API interaction test', function() {
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

  it('should get an existing speech recording', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings/5';
    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.getSpeechRecording(challenge, '5');
    expect(output).toEqual(jasmine.any(Promise));

    return output
      .then(function(result) {

        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('GET');
        var student = new its.Student('fb', '6');
        var recording = new its.SpeechRecording(challenge, student, '5');
        var stringDate = '2014-12-31T23:59:59Z';
        recording.created = new Date(stringDate);
        recording.updated = new Date(stringDate);
        recording.audio = null;
        recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
        expect(result).toEqual(recording);

      })
      .catch(function(error) {

        fail('No error should be thrown: ' + error);

      });
  });

  it('should get a list of existing speech recordings', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings';
    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }];
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var challenge = new its.SpeechChallenge('fb', '4');

    var output = api.listSpeechRecordings(challenge);
    expect(output).toEqual(jasmine.any(Promise));
    return output
      .then(function(result) {

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var student = new its.Student('fb', '6');
      var recording = new its.SpeechRecording(challenge, student, '5');
      var stringDate = '2014-12-31T23:59:59Z';
      recording.created = new Date(stringDate);
      recording.updated = new Date(stringDate);
      recording.audio = null;
      recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
      expect(result[0]).toEqual(recording);

    })
      .catch(function(error) {

      fail('No error should be thrown: ' + error);

    });
  });
});


describe('Speech Recording Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    // Mock the audio recorder
    function RecorderMock() {
      this.getAudioSpecs = function() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      };
    }

    // Save WebSocket
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    var challenge = new its.SpeechChallenge('fb', '4');
    var recorder = new RecorderMock();

    var expectedMessage = 'WebSocket connection was not open.';

    api.startStreamingSpeechRecording(challenge, recorder)
      .then(function(result) {

        fail('An error should be thrown!');

      }).catch(function(error) {

      expect(error.message).toEqual(expectedMessage);
      // Restore WebSocket
      window.WebSocket = old;
    });

  });

  it('should start streaming a new speech recording', function() {
    var api = new its.Sdk({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar',
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    // Mock the audio recorder
    function RecorderMock() {
      this.getAudioSpecs = function() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      };

      this.isRecording = function() {
        return false;
      };

      this.recorded = null;

      this.addEventListener = function(name, func) {
        if (name == 'recorded') {
          this.recorded = func;
        } else if (name == 'dataavailable') {
          func('EventFired');
          this.recorded('recordDone');
        }
      };
      this.removeEventListener = function() {
      };

      this.hasUserMediaApproval = function() {
        return true;
      }
    }

    var challenge = new its.SpeechChallenge('fb', '4');
    var recorder = new RecorderMock();
    var stringDate = '2014-12-31T23:59:59Z';
    var fakeResponse = {
      created: new Date(stringDate),
      updated: new Date(stringDate),
      audioFormat: 'audio/wave',
      audioParameters: {
        channels: 1,
        sampleWidth: 16,
        sampleRate: 48000
      },
      audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
    };

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        d.resolve(fakeResponse);
        return d.promise;
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    var output = api.startStreamingSpeechRecording(
      challenge, recorder);

    return output
      .then(function(result) {

        expect(result.challenge).toEqual(challenge);
        expect(result.student.organisationId).toBe(challenge.organisationId);
        expect(output).toEqual(jasmine.any(Promise));
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.recording.init_recording', []);
      })
      .catch(function(error) {

        fail('No error should be thrown: ' + error);

      });
  });
});
