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

  it('should fail streaming when websocket connection is closed', function(done) {
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
    var recognition = new ChoiceRecognition();
    var recorder = new RecorderMock();

    recognition.startStreamingChoiceRecognition(api, challenge, recorder)
      .then(function() {
        fail('An error should be thrown!');
      })
      .catch(function(error) {
        expect(error.message).toEqual('WebSocket connection was not open.');
        // Restore WebSocket
        window.WebSocket = old;
      })
      .then(done);
  });

  it('should start streaming a new choice recognition', function(done) {
    var api = new Connection({
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
      this.hasUserMediaApproval = function() {
        return true;
      };
      this.isRecording = function() {
        return false;
      };
      this.addEventListener = function(name, method) {
        if (name === 'dataavailable') {
          method(1);
        }
        method();
      };
      this.removeEventListener = function() {
      };

      this.hasUserMediaApproval = function() {
        return true;
      };
    }

    var challenge = new ChoiceChallenge('fb', '4', null, []);
    var recognition = new ChoiceRecognition();
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
    recognition.startStreamingChoiceRecognition(api, challenge, recorder)
      .then(function() {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.choice.init_recognition', [],
          {trimStart: 0.15, trimEnd: 0});
      })
      .catch(function(error) {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });

  it('should get an existing choice recognition', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions/5';
    var challenge = new SpeechChallenge('fb', '4');
    ChoiceRecognition.getChoiceRecognition(api, challenge, '5')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new Student('fb', '6');
        var recognition = new ChoiceRecognition(challenge, student,
          '5', new Date(stringDate), new Date(stringDate));
        recognition.audioUrl = audioUrl;
        expect(result).toEqual(recognition);
      })
      .catch(function(error) {
        fail('No error should be thrown ' + error);
      }).then(done);
  });

  it('should get a list of existing choice recognitions', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new SpeechChallenge('fb', '4');
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions';
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    ChoiceRecognition.listChoiceRecognitions(api, challenge)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
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
        var content1 = result[0];
        var content2 = result[1];

        expect(result.length).toBe(2);
        expect(content1).toEqual(recognition);
        expect(content2).toEqual(recognition2);
        expect(result).toEqual([recognition, recognition2]);
      }).catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
