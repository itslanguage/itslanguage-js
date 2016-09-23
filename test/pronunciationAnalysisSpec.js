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

describe('Pronunciation Analyisis Websocket API interaction test', function() {
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
          }
        };
      };
    }

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();

    var old = window.WebSocket;

    window.WebSocket = jasmine.createSpy('WebSocket');

    api.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(function(result) {
        fail('An error should be thrown. Got ' + result);
      })
      .catch(function(error) {
        expect(error.message).toBe('WebSocket connection was not open.');
        // Restore WebSocket
        window.WebSocket = old;
      });
  });

  it('should start streaming a new pronunciation analysis', function() {
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

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
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
    api._sessionBackup = api._session.call;
    spyOn(api._session, 'call').and.callThrough();
    spyOn(api, '_wordsToModels').and.returnValue('OK FROM FAKE WORDSTOMODELS');

    var output = api.startStreamingPronunciationAnalysis(
      challenge, recorder);

    return output
      .then(function(result) {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.pronunciation.init_analysis', [],
          {trimStart: 0.15, trimEnd: 0.0});
      }).catch(function(error) {
        fail('No error should be thrown: ' + error);
      });
  });
});

describe('PronunciationAnalyses API interaction test', function() {
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


  it('should get an existing pronunciation analysis', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new its.PronunciationChallenge('fb', '4', 'test', new Blob());

    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses/5';
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
    console.log('stubbing url ' + url);
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.getPronunciationAnalysis(challenge, '5');
    expect(output).toEqual(jasmine.any(Promise));
    return output.then(function(result) {
      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toBe(url);
      expect(request.method).toBe('GET');
      var stringDate = '2014-12-31T23:59:59Z';
      var student = new its.Student('fb', '6');
      var analysis = new its.PronunciationAnalysis(challenge, student,
        '5', new Date(stringDate), new Date(stringDate), audioUrl);
      expect(result).toEqual(analysis);
    }).catch(function(error) {
      fail('No error should be thrown: ' + error);
    });
  });

  it('should get a list of existing pronunciation analyses', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new its.PronunciationChallenge('fb', '4', 'test', new Blob());
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
      score: 7.5,
      words: [
        [
          {
            graphemes: 'b',
            score: 0.9,
            verdict: 'good'
          },
          {
            graphemes: 'o',
            score: 0.4,
            verdict: 'bad'
          },
          {
            graphemes: 'x',
            score: 0.5,
            verdict: 'moderate'
          }
        ]
      ]
    }];

    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.listPronunciationAnalyses(challenge, false);

    expect(output).toEqual(jasmine.any(Promise));

    return output
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new its.Student('fb', '6');
        var analysis = new its.PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate));
        analysis.audioUrl = audioUrl;
        var student2 = new its.Student('fb', '24');
        var analysis2 = new its.PronunciationAnalysis(challenge, student2,
          '6', new Date(stringDate), new Date(stringDate));
        analysis2.audioUrl = audioUrl;
        analysis2.score = 7.5;
        var chunk = [
          new its.WordChunk('b', 0.9, 'good', []),
          new its.WordChunk('o', 0.4, 'bad', []),
          new its.WordChunk('x', 0.5, 'moderate', [])
        ];
        var word = new its.Word(chunk);
        analysis2.words = [word];
        console.log('result is ' + result);
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      });
  });

  it('should get a detailed list of pronunciation analyses', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new its.PronunciationChallenge('fb', '4', 'test', new Blob());
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses?detailed=true';

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
      score: 7.5,
      words: [
        [
          {
            graphemes: 'b',
            phonemes: [
              {
                ipa: 'b',
                score: 0.9,
                verdict: 'good',
                start: 0.11,
                end: 0.22
              }
            ],
            score: 0.9,
            verdict: 'good'
          },
          {
            graphemes: 'o',
            phonemes: [
              {
                ipa: '\u0251',
                score: 0.4,
                verdict: 'bad'
              }
            ],
            score: 0.4,
            verdict: 'bad'
          },
          {
            graphemes: 'x',
            phonemes: [
              {
                ipa: 'k',
                score: 0.4,
                verdict: 'bad'
              },
              {
                ipa: 's',
                score: 0.6,
                verdict: 'moderate'
              }
            ],
            score: 0.5,
            verdict: 'moderate'
          }
        ]
      ]
    }];

    var fakeResponse = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    };

    jasmine.Ajax.stubRequest(url).andReturn(fakeResponse);

    var output = api.listPronunciationAnalyses(challenge, true);
    expect(output).toEqual(jasmine.any(Promise));

    return output
      .then(function(result) {
        var request = jasmine.Ajax.requests.mostRecent();
        expect(request.url).toBe(url);
        expect(request.method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new its.Student('fb', '6');
        var analysis = new its.PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate));
        analysis.audioUrl = audioUrl;
        var student2 = new its.Student('fb', '24');
        var analysis2 = new its.PronunciationAnalysis(challenge, student2,
          '6', new Date(stringDate), new Date(stringDate));
        analysis2.audioUrl = audioUrl;
        analysis2.score = 7.5;
        var phoneme1 = new its.Phoneme('b', 0.9);
        phoneme1.verdict = 'good';
        phoneme1.start = 0.11;
        phoneme1.end = 0.22;
        var phonemes1 = [phoneme1];
        var phoneme2 = new its.Phoneme('\u0251', 0.4);
        phoneme2.verdict = 'bad';
        var phonemes2 = [phoneme2];
        var phoneme4 = new its.Phoneme('k', 0.4);
        phoneme4.verdict = 'bad';
        var phoneme5 = new its.Phoneme('s', 0.6);
        phoneme5.verdict = 'moderate';
        var phonemes3 = [
          phoneme4,
          phoneme5
        ];
        var chunk = [
          new its.WordChunk('b', 0.9, 'good', phonemes1),
          new its.WordChunk('o', 0.4, 'bad', phonemes2),
          new its.WordChunk('x', 0.5, 'moderate', phonemes3)
        ];
        var word = new its.Word(chunk);
        analysis2.words = [word];
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(analysis);
        expect(result[1]).toEqual(analysis2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      });
  });
});
