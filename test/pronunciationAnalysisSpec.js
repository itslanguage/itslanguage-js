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
const PronunciationAnalysis = require('../administrative-sdk/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationChallenge = require('../administrative-sdk/pronunciationChallenge').PronunciationChallenge;
const SpeechChallenge = require('../administrative-sdk/speechChallenge').SpeechChallenge;
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;
const WordChunk = require('../administrative-sdk/pronunciationAnalysis').WordChunk;
const Word = require('../administrative-sdk/pronunciationAnalysis').Word;
const Phoneme = require('../administrative-sdk/pronunciationAnalysis').Phoneme;

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
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var analys = new PronunciationAnalysis();
    var output = analys.getPronunciationAnalysis(api, challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses/5';
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
    var analysis = new PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;
    expect(cb).toHaveBeenCalledWith(analysis);
  });

  it('should get a list of existing pronunciation analyses', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var analys = new PronunciationAnalysis();
    var output = analys.listPronunciationAnalyses(api, challenge, false, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
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
      score: 7.5,
      words: [
        {
          chunks: [
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
        }
      ]
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new Student('fb', '6');
    var analysis = new PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;

    var student2 = new Student('fb', '24');
    var analysis2 = new PronunciationAnalysis(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    analysis2.audioUrl = audioUrl;
    analysis2.score = 7.5;
    var chunk = [
      new WordChunk('b', 0.9, 'good', []),
      new WordChunk('o', 0.4, 'bad', []),
      new WordChunk('x', 0.5, 'moderate', [])
    ];
    var word = new Word(chunk);
    var words = [word];
    analysis2.words = words;
    expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
  });

  it('should get a detailed list of pronunciation analyses', function() {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new SpeechChallenge('fb', '4');
    var analys = new PronunciationAnalysis();
    var output = analys.listPronunciationAnalyses(api, challenge, true, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses?detailed=true';
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
      score: 7.5,
      words: [
        {
          chunks: [
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
        }
      ]
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new Student('fb', '6');
    var analysis = new PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;

    var student2 = new Student('fb', '24');
    var analysis2 = new PronunciationAnalysis(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    analysis2.audioUrl = audioUrl;
    analysis2.score = 7.5;
    var phoneme1 = new Phoneme('b', 0.9);
    phoneme1.verdict = 'good';
    phoneme1.start = 0.11;
    phoneme1.end = 0.22;
    var phonemes1 = [phoneme1];
    var phoneme2 = new Phoneme('\u0251', 0.4);
    phoneme2.verdict = 'bad';
    var phonemes2 = [phoneme2];
    var phoneme3 = new Phoneme('k', 0.4);
    phoneme3.verdict = 'bad';
    var phoneme4 = new Phoneme('s', 0.6);
    phoneme4.verdict = 'moderate';
    var phonemes3 = [
      phoneme3, phoneme4
    ];
    var chunk = [
      new WordChunk('b', 0.9, 'good', phonemes1),
      new WordChunk('o', 0.4, 'bad', phonemes2),
      new WordChunk('x', 0.5, 'moderate', phonemes3)
    ];
    var word = new Word(chunk);
    var words = [word];
    analysis2.words = words;
    expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
  });
});


describe('Pronunciation Analyisis Websocket API interaction test', function() {
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

    var challenge = new PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    var analys = new PronunciationAnalysis();
    expect(function() {
      analys.startStreamingPronunciationAnalysis(
        api, challenge, recorder, prepareCb, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');
  });

  it('should start streaming a new pronunciation analysis', function() {
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
      this.addEventListener = function() {
      };
    }

    var challenge = new PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    var prepareCb = jasmine.createSpy('callback');
    var analys = new PronunciationAnalysis();

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();
    var output = analys.startStreamingPronunciationAnalysis(
      api, challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.pronunciation.init_analysis', [],
      {trimStart: 0.15, trimEnd: 0.0});
    expect(output).toBeUndefined();
  });
});
