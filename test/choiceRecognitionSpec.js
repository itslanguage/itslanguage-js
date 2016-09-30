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
const ChoiceRecognition = require('../administrative-sdk/choiceRecognition').ChoiceRecognition;
const ChoiceChallenge = require('../administrative-sdk/choiceChallenge').ChoiceChallenge;
const SpeechChallenge = require('../administrative-sdk/speechChallenge').SpeechChallenge;
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;

describe('ChoiceRecognition Websocket API interaction test', function() {
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

    var challenge = new ChoiceChallenge('fb', '4', null, []);
    var recog = new ChoiceRecognition();
    var recorder = new RecorderMock();
    var preparedcb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    expect(function() {
      recog.startStreamingChoiceRecognition(
        api, challenge, recorder, preparedcb, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');

    // Restore WebSocket
    window.WebSocket = old;
  });

  it('should start streaming a new choice recognition', function() {
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

    var challenge = new ChoiceChallenge('fb', '4', null, []);
    var recog = new ChoiceRecognition();

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
    var output = recog.startStreamingChoiceRecognition(
      api, challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.choice.init_recognition', [],
      {trimStart: 0.15, trimEnd: 0});
    expect(output).toBeUndefined();
  });

  it('should get an existing choice recognition', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var output = ChoiceRecognition.getChoiceRecognition(api, challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions/5';
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

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new Student('fb', '6');
    var recognition = new ChoiceRecognition(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    recognition.audioUrl = audioUrl;
    expect(cb).toHaveBeenCalledWith(recognition);
  });

  it('should get a list of existing choice recognitions', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var output = ChoiceRecognition.listChoiceRecognitions(api, challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24',
      recognised: 'Hi'
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new Student('fb', '6');
    var recognition = new ChoiceRecognition(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    recognition.audioUrl = audioUrl;

    var student2 = new Student('fb', '24');
    var recognition2 = new ChoiceRecognition(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    recognition2.audioUrl = audioUrl;
    recognition2.recognised = 'Hi';
    expect(cb).toHaveBeenCalledWith([recognition, recognition2]);
  });
});
