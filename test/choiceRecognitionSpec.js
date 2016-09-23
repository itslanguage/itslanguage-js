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
var nock = require('nock');
var Promise = require('es6-promise').Promise;
var mock = require('xhr-mock');
const its = require('../');

describe('ChoiceRecognition Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function() {
    var api = new its.Sdk();

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

    var challenge = new its.ChoiceChallenge('fb', '4', null, []);
    var recorder = new RecorderMock();

    return api.startStreamingChoiceRecognition(challenge, recorder).then(function() {
      fail('An error should be thrown!');
    }).catch(function(error) {
      expect(error.message).toEqual('WebSocket connection was not open.');
    });

    // Restore WebSocket
    window.WebSocket = old;
  });

  it('should start streaming a new choice recognition', function() {
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
        }
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
      }
    }

    var challenge = new its.ChoiceChallenge('fb', '4', null, []);
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

    var output = api.startStreamingChoiceRecognition(
      challenge, recorder);

    expect(output).toEqual(jasmine.any(Promise));
    return output.then(function(result) {
      expect(api._session.call).toHaveBeenCalled();
      expect(api._session.call).toHaveBeenCalledWith(
        'nl.itslanguage.choice.init_recognition', [],
        {trimStart: 0.15, trimEnd: 0});
    }).catch(function(error) {

      fail('No error should be thrown ' + error);

    });
  });

  it('should get an existing choice recognition', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
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
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions/5';
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.getChoiceRecognition(challenge, '5', cb);
    expect(output).toEqual(jasmine.any(Promise));

    var request = jasmine.Ajax.requests.mostRecent();
    return output.then(function(result) {

      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var student = new its.Student('fb', '6');
      var recognition = new its.ChoiceRecognition(challenge, student,
        '5', new Date(stringDate), new Date(stringDate));
      recognition.audioUrl = audioUrl;
      expect(result).toEqual(recognition);

    }).catch(function(error) {
      fail('No error should be thrown ' + error);
    });
  });

  it('should get a list of existing choice recognitions', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new its.SpeechChallenge('fb', '4');
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
    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);
    var output = api.listChoiceRecognitions(challenge);
    expect(output).toEqual(jasmine.any(Promise));


    return output.then(function(result) {
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var student = new its.Student('fb', '6');
      var recognition = new its.ChoiceRecognition(challenge, student,
        '5', new Date(stringDate), new Date(stringDate));
      recognition.audioUrl = audioUrl;

      var student2 = new its.Student('fb', '24');
      var recognition2 = new its.ChoiceRecognition(challenge, student2,
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

    });

  });
});
