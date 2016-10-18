require('jasmine-ajax');
const when = require('when');
const PronunciationAnalysis = require('../administrative-sdk/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationChallenge = require('../administrative-sdk/pronunciationChallenge').PronunciationChallenge;
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;
const WordChunk = require('../administrative-sdk/pronunciationAnalysis').WordChunk;
const Word = require('../administrative-sdk/pronunciationAnalysis').Word;
const Phoneme = require('../administrative-sdk/pronunciationAnalysis').Phoneme;

describe('Pronunciation Analyisis Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function(done) {
    var api = new Connection({
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

    var challenge = new PronunciationChallenge('fb', '4', 'foo');
    var analysis = new PronunciationAnalysis();
    var recorder = new RecorderMock();
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    analysis.startStreamingPronunciationAnalysis(api, challenge, recorder)
      .then(function(result) {
        fail('An error should be thrown. Got ' + result);
      })
      .catch(function(error) {
        expect(error.message).toBe('WebSocket connection was not open.');
        // Restore WebSocket
        window.WebSocket = old;
      }).then(done);
  });

  it('should start streaming a new pronunciation analysis', function(done) {
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

    var challenge = new PronunciationChallenge('fb', '4', 'foo');
    var analysis = new PronunciationAnalysis();
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
        return when.promise(function(resolve, reject, notify) {
          notify();
          resolve(fakeResponse);
        });
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();
    spyOn(PronunciationAnalysis, '_wordsToModels');

    analysis.startStreamingPronunciationAnalysis(
      api, challenge, recorder)
      .then(function() {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.pronunciation.init_analysis', [],
          {trimStart: 0.15, trimEnd: 0.0});
      }).catch(function(error) {
        fail('No error should be thrown: ' + error);
      }).then(done);
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

  it('should get an existing pronunciation analysis', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());

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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    PronunciationAnalysis.getPronunciationAnalysis(api, challenge, '5')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new Student('fb', '6');
        var analysis = new PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate), audioUrl);
        expect(result).toEqual(analysis);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing pronunciation analyses', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
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

    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    PronunciationAnalysis.listPronunciationAnalyses(api, challenge, false)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
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
        analysis2.words = [word];
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a detailed list of pronunciation analyses', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    var challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
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

    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    PronunciationAnalysis.listPronunciationAnalyses(api, challenge, true)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
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
        var phoneme4 = new Phoneme('k', 0.4);
        phoneme4.verdict = 'bad';
        var phoneme5 = new Phoneme('s', 0.6);
        phoneme5.verdict = 'moderate';
        var phonemes3 = [
          phoneme4,
          phoneme5
        ];
        var chunk = [
          new WordChunk('b', 0.9, 'good', phonemes1),
          new WordChunk('o', 0.4, 'bad', phonemes2),
          new WordChunk('x', 0.5, 'moderate', phonemes3)
        ];
        var word = new Word(chunk);
        analysis2.words = [word];
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(analysis);
        expect(result[1]).toEqual(analysis2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
