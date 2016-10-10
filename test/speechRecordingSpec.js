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
const autobahn = require('autobahn');

const SpeechChallenge = require('../administrative-sdk/speechChallenge').SpeechChallenge;
const SpeechRecording = require('../administrative-sdk/speechRecording').SpeechRecording;
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;

describe('SpeechRecording object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new SpeechRecording();
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');
    expect(function() {
      new SpeechRecording(1);
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');

    var challenge = new SpeechChallenge('fb');
    expect(function() {
      new SpeechRecording(challenge);
    }).toThrowError(
      'student parameter of type "Student" is required');
    expect(function() {
      new SpeechRecording(challenge, 1);
    }).toThrowError(
      'student parameter of type "Student" is required');

    var student = new Student('org');
    expect(function() {
      new SpeechRecording(challenge, student, 1);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new SpeechRecording(challenge, student, '1', 'foo');
    }).toThrowError('audio parameter of type "Blob|null" is required');
  });
  it('should instantiate a SpeechRecording', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new SpeechChallenge('fb');
    var student = new Student('org');

    // Without audio
    var s = new SpeechRecording(challenge, student, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.audio).toBeUndefined();
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // Without id
    s = new SpeechRecording(challenge, student, null, blob);
    expect(s).toBeDefined();
    expect(s.id).toBe(null);
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // With id
    s = new SpeechRecording(challenge, student, 'test', blob);
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
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var chall = new SpeechChallenge('fb');
    var stud = new Student('org');
    var rec = new SpeechRecording(chall, stud, null);
    rec.connection = api;
    var output = rec.getSpeechRecording(challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings/5';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var student = new Student('fb', '6');
    var recording = new SpeechRecording(challenge, student, '5');
    var stringDate = '2014-12-31T23:59:59Z';
    recording.created = new Date(stringDate);
    recording.updated = new Date(stringDate);
    recording.audio = null;
    recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    expect(cb).toHaveBeenCalledWith(recording);
  });

  it('should get a list of existing speech recordings', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var chall = new SpeechChallenge('fb');
    var stud = new Student('org');
    var rec = new SpeechRecording(chall, stud, null);
    rec.connection = api;
    var output = rec.listSpeechRecordings(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var student = new Student('fb', '6');
    var recording = new SpeechRecording(challenge, student, '5');
    var stringDate = '2014-12-31T23:59:59Z';
    recording.created = new Date(stringDate);
    recording.updated = new Date(stringDate);
    recording.audio = null;
    recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    expect(cb).toHaveBeenCalledWith([recording]);
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
    var api = new Connection();

    // Mock the audio recorder
    function RecorderMock() {
      this.getAudioSpecs = function() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          }
        };
      };
    }

    // Save WebSocket
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    var challenge = new SpeechChallenge('fb', '4');
    var chall = new SpeechChallenge('fb');
    var stud = new Student('org');
    var rec = new SpeechRecording(chall, stud, null);
    rec.connection = api;
    var student = new Student('fb', '6');
    var recorder = new RecorderMock();
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    expect(function() {
      rec.startStreamingSpeechRecording(
        challenge, student, recorder, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');

    // Restore WebSocket
    window.WebSocket = old;
  });

  it('should start streaming a new speech recording', function() {
    var api = new Connection({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar'
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
          }
        };
      };
      this.isRecording = function() {
        return false;
      };
      this.addEventListener = function() {};
    }

    var challenge = new SpeechChallenge('fb', '4');
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }
    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();
    var chall = new SpeechChallenge('fb');
    var stud = new Student('org');
    var rec = new SpeechRecording(chall, stud, null);
    rec.connection = api;
    var output = rec.startStreamingSpeechRecording(
      challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.recording.init_recording', []);
    expect(output).toBeUndefined();
  });
});
