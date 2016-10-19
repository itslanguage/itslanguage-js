require('jasmine-ajax');
const when = require('when');
const PronunciationAnalysis = require('../administrative-sdk/models/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationAnalysisController = require('../administrative-sdk/controllers/pronunciationAnalysisController')
  .PronunciationAnalysisController;
const PronunciationChallenge = require('../administrative-sdk/models/pronunciationChallenge').PronunciationChallenge;
const Student = require('../administrative-sdk/models/student').Student;
const Connection = require('../administrative-sdk/controllers/connectionController').Connection;
const WordChunk = require('../administrative-sdk/models/pronunciationAnalysis').WordChunk;
const Word = require('../administrative-sdk/models/pronunciationAnalysis').Word;
const Phoneme = require('../administrative-sdk/models/pronunciationAnalysis').Phoneme;

describe('Pronunciation Analyisis Websocket API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var controller = new PronunciationAnalysisController(api);
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
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(function(result) {
        fail('An error should be thrown. Got ' + result);
      })
      .catch(error => {
        expect(error.message).toBe('WebSocket connection was not open.');
        // Restore WebSocket
        window.WebSocket = old;
      }).then(done);
  });

  it('should start streaming a new pronunciation analysis', done => {
    const api = new Connection({
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
        return when.promise((resolve, reject, notify) => {
          notify();
          resolve(fakeResponse);
        });
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();
    var controller = new PronunciationAnalysisController(api);
    spyOn(PronunciationAnalysisController, '_wordsToModels');

    controller.startStreamingPronunciationAnalysis(
      challenge, recorder)
      .then(function() {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.pronunciation.init_analysis', [],
          {trimStart: 0.15, trimEnd: 0.0});
      }).catch(error => {
        fail('No error should be thrown: ' + error);
      }).then(done);
  });
});

describe('PronunciationAnalyses API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should get an existing pronunciation analysis', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());

    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses/5';
    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    const content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    PronunciationAnalysisController.getPronunciationAnalysis(api, challenge, '5')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const student = new Student('fb', '6');
        const analysis = new PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate), audioUrl);
        expect(result).toEqual(analysis);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing pronunciation analyses', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    const content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
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

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    PronunciationAnalysisController.listPronunciationAnalyses(api, challenge, false)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const student = new Student('fb', '6');
        const analysis = new PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate));
        analysis.audioUrl = audioUrl;
        const student2 = new Student('fb', '24');
        const analysis2 = new PronunciationAnalysis(challenge, student2,
          '6', new Date(stringDate), new Date(stringDate));
        analysis2.audioUrl = audioUrl;
        analysis2.score = 7.5;
        const chunk = [
          new WordChunk('b', 0.9, 'good', []),
          new WordChunk('o', 0.4, 'bad', []),
          new WordChunk('x', 0.5, 'moderate', [])
        ];
        const word = new Word(chunk);
        analysis2.words = [word];
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a detailed list of pronunciation analyses', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });

    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    const url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses?detailed=true';

    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    const content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
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

    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    PronunciationAnalysisController.listPronunciationAnalyses(api, challenge, true)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const student = new Student('fb', '6');
        const analysis = new PronunciationAnalysis(challenge, student,
          '5', new Date(stringDate), new Date(stringDate));
        analysis.audioUrl = audioUrl;
        const student2 = new Student('fb', '24');
        const analysis2 = new PronunciationAnalysis(challenge, student2,
          '6', new Date(stringDate), new Date(stringDate));
        analysis2.audioUrl = audioUrl;
        analysis2.score = 7.5;
        const phoneme1 = new Phoneme('b', 0.9);
        phoneme1.verdict = 'good';
        phoneme1.start = 0.11;
        phoneme1.end = 0.22;
        const phonemes1 = [phoneme1];
        const phoneme2 = new Phoneme('\u0251', 0.4);
        phoneme2.verdict = 'bad';
        const phonemes2 = [phoneme2];
        const phoneme4 = new Phoneme('k', 0.4);
        phoneme4.verdict = 'bad';
        const phoneme5 = new Phoneme('s', 0.6);
        phoneme5.verdict = 'moderate';
        const phonemes3 = [
          phoneme4,
          phoneme5
        ];
        const chunk = [
          new WordChunk('b', 0.9, 'good', phonemes1),
          new WordChunk('o', 0.4, 'bad', phonemes2),
          new WordChunk('x', 0.5, 'moderate', phonemes3)
        ];
        const word = new Word(chunk);
        analysis2.words = [word];
        expect(result).toEqual(jasmine.any(Array));
        expect(result.length).toBe(2);
        expect(result[0]).toEqual(analysis);
        expect(result[1]).toEqual(analysis2);
        expect(result).toEqual([analysis, analysis2]);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
