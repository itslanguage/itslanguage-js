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

const its = require('..');

describe('Pronunciation Analyisis Websocket API interaction test', function() {
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

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    expect(function() {
      api.startStreamingPronunciationAnalysis(
        challenge, recorder, prepareCb, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');
  });

  it('should start streaming a new pronunciation analysis', function() {
    var api = new its.Sdk({
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
      this.addEventListener = function() {
      };
    }

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    var prepareCb = jasmine.createSpy('callback');

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    var output = api.startStreamingPronunciationAnalysis(
      challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.pronunciation.init_analysis', [],
      {trimStart: 0.15, trimEnd: 0.0});
    expect(output).toBeUndefined();
  });
});
