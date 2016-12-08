import 'jasmine-ajax';
import Connection from '../src/administrative-sdk/connection/connection-controller';
import Controller from '../src/administrative-sdk/pronunciation-analysis/pronunciation-analysis-controller';
import Phoneme from '../src/administrative-sdk/phoneme/phoneme';
import PronunciationAnalysis from '../src/administrative-sdk/pronunciation-analysis/pronunciation-analysis';
import PronunciationChallenge from '../src/administrative-sdk/pronunciation-challenge/pronunciation-challenge';
import Word from '../src/administrative-sdk/word/word';
import WordChunk from '../src/administrative-sdk/word-chunk/word-chunk';
import autobahn from 'autobahn';
import when from 'when';

describe('Pronunciation Analyisis Websocket API interaction test', () => {
  let api;
  let RecorderMock;
  let SessionMock;
  let challenge;
  let recorder;
  let fakeResponse;
  let stringDate;
  let controller;

  beforeEach(() => {
    jasmine.Ajax.install();
    api = new Connection({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar',
      oAuth2Token: 'token'
    });
    let shouldFireRecord = true;
    RecorderMock = function() {
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
        } else if (name === 'recorded') {
          setTimeout(() => {
            if (shouldFireRecord) {
              method();
            }
          }, 1000);
        } else {
          method();
        }
      };
      this.removeEventListener = function(name) {
        if (name === 'recorded') {
          shouldFireRecord = false;
        }
      };

      this.hasUserMediaApproval = function() {
        return true;
      };
    };

    SessionMock = function() {
      this.call = function() {
        return when.promise((resolve, reject, notify) => {
          notify();
          resolve(fakeResponse);
        });
      };
    };

    challenge = new PronunciationChallenge('fb', '4', 'foo', new Blob(['a']));
    recorder = new RecorderMock();
    stringDate = '2014-12-31T23:59:59Z';
    fakeResponse = {
      id: '4',
      studentId: '1',
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
    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();
    spyOn(api, 'addAccessToken').and.callFake(url => url + 'token');
    controller = new Controller(api);
    spyOn(Controller, '_wordsToModels');
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', done => {
    api = new Connection({});
    controller = new Controller(api);
    const old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(result => {
        fail('An error should be thrown. Got ' + result);
      })
      .catch(error => {
        expect(error.message).toBe('WebSocket connection was not open.');
        // Restore WebSocket
        window.WebSocket = old;
      }).then(done);
  });

  it('should fail streaming when challenge is not present', done => {
    controller.startStreamingPronunciationAnalysis(null, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge is undefined', done => {
    controller.startStreamingPronunciationAnalysis(undefined, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge.id is not present', done => {
    challenge = new PronunciationChallenge('1', '', '', new Blob(['a']));
    controller.startStreamingPronunciationAnalysis(challenge, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should fail streaming when challenge.organisationId is not present', done => {
    challenge = new PronunciationChallenge('fb', '2', '', new Blob(['a']));
    challenge.organisationId = null;
    controller.startStreamingPronunciationAnalysis(challenge, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.organisationId field is required');
      })
      .then(done);
  });

  it('should fail streaming when recording is already recording', done => {
    recorder.isRecording = () => true;
    api._session = {};
    challenge = new PronunciationChallenge('1', '4', '', new Blob(['a']));
    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Recorder should not yet be recording.');
      })
      .then(done);
  });

  it('should fail streaming when there is a session in progress', done => {
    recorder.isRecording = () => false;
    api._analysisId = '5';
    api._session = {};
    controller = new Controller(api);
    challenge = new PronunciationChallenge('1', '4', '', new Blob(['a']));
    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Session with analysisId 5 still in progress.');
      })
      .then(done);
  });

  it('should start streaming a new pronunciation analysis without trimming', done => {
    controller.startStreamingPronunciationAnalysis(challenge, recorder, false)
      .then(() => {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.pronunciation.init_analysis', [],
          {trimStart: 0.00, trimEnd: 0});
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });

  it('should handle errors during streaming', done => {
    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.pronunciation.write') {
        d.reject({
          message: 'Encountered an error during writing',
          error: 'error',
          studentId: '1',
          id: '2',
          created: stringDate,
          updated: stringDate,
          audioUrl: fakeResponse.audioUrl
        });
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },
      hasUserMediaApproval() {
        return true;
      },
      isRecording() {
        return false;
      },
      addEventListener(name, callback) {
        if (name === 'dataavailable') {
          return callback(1);
        } else if (name === 'ready') {
          return callback();
        }
      },
      removeEventListener() {
      }
    };

    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(result => fail('An error should be thrown ' + JSON.stringify(result)))
      .catch(error => {
        expect(error.message).toEqual('Encountered an error during writing');
        expect(error.analysis.id).toEqual('2');
        expect(error.analysis.studentId).toEqual('1');
        expect(error.analysis.created).toEqual(new Date(stringDate));
        expect(error.analysis.updated).toEqual(new Date(stringDate));
        expect(error.analysis.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
  });

  it('should wait to stream when there is no user approval yet', done => {
    recorder.hasUserMediaApproval = () => false;
    spyOn(recorder, 'addEventListener').and.callThrough();
    controller = new Controller(api);
    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        expect(recorder.addEventListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
      })
      .catch(error => {
        fail('no error should be thrown ' + error);
      })
      .then(done);
  });
  it('should handle errors while initializing challenge', done => {
    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.pronunciation.init_challenge') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },
      hasUserMediaApproval() {
        return true;
      },
      isRecording() {
        return false;
      },
      addEventListener(name, callback) {
        if (name === 'dataavailable') {
          return callback(1);
        } else if (name === 'ready') {
          return callback();
        }
      },
      removeEventListener() {
      }
    };

    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing audio', done => {
    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.pronunciation.init_audio') {
        d.reject({error: 'error123'});
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },
      hasUserMediaApproval() {
        return true;
      },
      isRecording() {
        return false;
      },
      addEventListener(name, callback) {
        if (name === 'dataavailable') {
          return callback(1);
        } else if (name === 'ready') {
          return callback();
        }
      },
      removeEventListener() {
      }
    };

    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing recognition', done => {
    api._session.call = () => {
      const d = autobahn.when.defer();
      d.reject({error: 'error123'});
      return d.promise;
    };

    recorder = {
      getAudioSpecs() {
        return {
          audioFormat: 'audio/wave',
          audioParameters: {
            channels: 1,
            sampleWidth: 16,
            sampleRate: 48000
          },
          audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
        };
      },
      hasUserMediaApproval() {
        return true;
      },
      isRecording() {
        return false;
      },
      addEventListener() {
      },
      removeEventListener() {
      }
    };

    recorder.addEventListener = jasmine.createSpy();
    controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
  });
  describe('Analysis server errors', () => {
    it('should handle errors while initializing recognition with a failed reference alignment', done => {
      api._session.call = (name, args) => {
        if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
          expect(args[0]).not.toBeNull();
        }
        const d = autobahn.when.defer();
        if (name === 'nl.itslanguage.pronunciation.analyse') {
          d.reject({
            error: 'nl.itslanguage.ref_alignment_failed',
            kwargs: {
              analysis: {
                message: null,
                studentId: '1',
                id: '2',
                created: stringDate,
                updated: stringDate,
                audioUrl: fakeResponse.audioUrl
              }
            }
          });
        } else {
          d.notify();
          d.resolve(fakeResponse);
        }
        return d.promise;
      };

      recorder = {
        getAudioSpecs() {
          return {
            audioFormat: 'audio/wave',
            audioParameters: {
              channels: 1,
              sampleWidth: 16,
              sampleRate: 48000
            },
            audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
          };
        },
        hasUserMediaApproval() {
          return true;
        },
        isRecording() {
          return false;
        },
        addEventListener(name, callback) {
          if (name === 'dataavailable') {
            return callback(1);
          } else if (name === 'ready') {
            return callback();
          }
          setTimeout(callback, 500);
        },
        removeEventListener() {
        }
      };

      controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Reference alignment failed');
        expect(error.analysis.id).toEqual('2');
        expect(error.analysis.studentId).toEqual('1');
        expect(error.analysis.created).toEqual(new Date(stringDate));
        expect(error.analysis.updated).toEqual(new Date(stringDate));
        expect(error.analysis.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
    });

    it('should handle errors while initializing recognition with a failed alignment', done => {
      api._session.call = (name, args) => {
        if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
          expect(args[0]).not.toBeNull();
        }
        const d = autobahn.when.defer();
        if (name === 'nl.itslanguage.pronunciation.analyse') {
          d.reject({
            error: 'nl.itslanguage.alignment_failed',
            kwargs: {
              analysis: {
                message: null,
                studentId: '1',
                id: '2',
                created: stringDate,
                updated: stringDate,
                audioUrl: fakeResponse.audioUrl
              }
            }
          });
        } else {
          d.notify();
          d.resolve(fakeResponse);
        }
        return d.promise;
      };

      recorder = {
        getAudioSpecs() {
          return {
            audioFormat: 'audio/wave',
            audioParameters: {
              channels: 1,
              sampleWidth: 16,
              sampleRate: 48000
            },
            audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
          };
        },
        hasUserMediaApproval() {
          return true;
        },
        isRecording() {
          return false;
        },
        addEventListener(name, callback) {
          if (name === 'dataavailable') {
            return callback(1);
          } else if (name === 'ready') {
            return callback();
          }
          setTimeout(callback, 500);
        },
        removeEventListener() {
        }
      };

      controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Alignment failed');
        expect(error.analysis.id).toEqual('2');
        expect(error.analysis.studentId).toEqual('1');
        expect(error.analysis.created).toEqual(new Date(stringDate));
        expect(error.analysis.updated).toEqual(new Date(stringDate));
        expect(error.analysis.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
    });

    it('should handle errors while initializing recognition with a failed analysis', done => {
      api._session.call = (name, args) => {
        if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
          expect(args[0]).not.toBeNull();
        }
        const d = autobahn.when.defer();
        if (name === 'nl.itslanguage.pronunciation.analyse') {
          d.reject({
            error: 'nl.itslanguage.analysis_failed',
            kwargs: {
              analysis: {
                message: null,
                studentId: '1',
                id: '2',
                created: stringDate,
                updated: stringDate,
                audioUrl: fakeResponse.audioUrl
              }
            }
          });
        } else {
          d.notify();
          d.resolve(fakeResponse);
        }
        return d.promise;
      };

      recorder = {
        getAudioSpecs() {
          return {
            audioFormat: 'audio/wave',
            audioParameters: {
              channels: 1,
              sampleWidth: 16,
              sampleRate: 48000
            },
            audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
          };
        },
        hasUserMediaApproval() {
          return true;
        },
        isRecording() {
          return false;
        },
        addEventListener(name, callback) {
          if (name === 'dataavailable') {
            return callback(1);
          } else if (name === 'ready') {
            return callback();
          }
          setTimeout(callback, 500);
        },
        removeEventListener() {
        }
      };

      controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Analysis failed');
        expect(error.analysis.id).toEqual('2');
        expect(error.analysis.studentId).toEqual('1');
        expect(error.analysis.created).toEqual(new Date(stringDate));
        expect(error.analysis.updated).toEqual(new Date(stringDate));
        expect(error.analysis.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
    });

    it('should handle errors while initializing recognition with an unhandled error', done => {
      api._session.call = (name, args) => {
        if (name !== 'nl.itslanguage.pronunciation.init_analysis') {
          expect(args[0]).not.toBeNull();
        }
        const d = autobahn.when.defer();
        if (name === 'nl.itslanguage.pronunciation.analyse') {
          d.reject({
            error: 'nl.itslanguage.unknown',
            kwargs: {
              analysis: {
                message: null,
                studentId: '1',
                id: '2',
                created: stringDate,
                updated: stringDate,
                audioUrl: fakeResponse.audioUrl
              }
            }
          });
        } else {
          d.notify();
          d.resolve(fakeResponse);
        }
        return d.promise;
      };

      recorder = {
        getAudioSpecs() {
          return {
            audioFormat: 'audio/wave',
            audioParameters: {
              channels: 1,
              sampleWidth: 16,
              sampleRate: 48000
            },
            audioUrl: 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ'
          };
        },
        hasUserMediaApproval() {
          return true;
        },
        isRecording() {
          return false;
        },
        addEventListener(name, callback) {
          if (name === 'dataavailable') {
            return callback(1);
          } else if (name === 'ready') {
            return callback();
          }
          setTimeout(callback, 500);
        },
        removeEventListener() {
        }
      };

      controller.startStreamingPronunciationAnalysis(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Unhandled error');
        expect(error.analysis.id).toEqual('2');
        expect(error.analysis.studentId).toEqual('1');
        expect(error.analysis.created).toEqual(new Date(stringDate));
        expect(error.analysis.updated).toEqual(new Date(stringDate));
        expect(error.analysis.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
        expect(controller._connection._analysisId).toBeNull();
      })
      .then(done);
    });
  });
  it('should start streaming a new pronunciation analysis', done => {
    const progressCalled = [];
    recorder.addEventListener = function(name, method) {
      if (name === 'dataavailable') {
        method(1);
      } else if (name === 'recorded') {
        setTimeout(() => {
          method();
        }, 1000);
      } else {
        method();
      }
    };

    controller._connection._session.call.and.callFake(name => when.promise((resolve, reject, notify) => {
      notify('NOTIFY');
      if (name !== 'nl.itslanguage.pronunciation.alignment') {
        setTimeout(() => {
          resolve(fakeResponse);
        }, 200);
      } else {
        setTimeout(() => {
          resolve('AlignmentResult');
        }, 500);
      }
    })
    );
    const expectedNotifyCall = {progress: 'NOTIFY', referenceAlignment: 'AlignmentResult'};
    controller.startStreamingPronunciationAnalysis(
      challenge, recorder)
      .progress(args => {
        progressCalled.push(args);
      })
      .then(result => {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.pronunciation.init_analysis', [],
          {trimStart: 0.15, trimEnd: 0.0});
        expect(progressCalled[0]).toEqual('ReadyToReceive');
        expect(progressCalled[1]).toEqual(expectedNotifyCall);
        expect(result.analysis.challengeId).toEqual(challenge.id);
        expect(result.analysis.id).toEqual('4');
        expect(result.analysis.studentId).toBe('1');
        expect(result.analysisId).toEqual(fakeResponse);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
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

  it('should reject to get when challenge has no organisationId', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    challenge.organisationId = null;
    const controller = new Controller(api);
    controller.getPronunciationAnalysis()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should reject to get when challenge has no id', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '', 'test', new Blob());
    const controller = new Controller(api);
    controller.getPronunciationAnalysis(challenge.organisationId, null)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should reject to get when there is no analysis id', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '1', 'test', new Blob());
    const controller = new Controller(api);
    controller.getPronunciationAnalysis(challenge.organisationId, challenge.id)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('analysisId field is required');
      })
      .then(done);
  });

  it('should get an existing pronunciation analysis', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    const url = 'https://api.itslanguage.nl/challenges/pronunciation/4/analyses/5';
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
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new Controller(api);
    controller.getPronunciationAnalysis(challenge.organisationId, challenge.id, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const analysis = new PronunciationAnalysis(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate), audioUrl, undefined, undefined, null);
        expect(result).toEqual(analysis);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get an existing detailed pronunciation analysis', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    const url = 'https://api.itslanguage.nl/challenges/pronunciation/4/analyses/5';
    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    const content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6',
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
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new Controller(api);
    controller.getPronunciationAnalysis(challenge.organisationId, challenge.id, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const analysis = new PronunciationAnalysis(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate), audioUrl);
        analysis.score = 7.5;
        const chunk = [
          new WordChunk('b', 0.9, 'good', []),
          new WordChunk('o', 0.4, 'bad', []),
          new WordChunk('x', 0.5, 'moderate', [])
        ];
        const word = new Word(chunk);
        analysis.words = [word];
        expect(result).toEqual(analysis);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing pronunciation analyses', done => {
    const api = new Connection({
      oAuth2Token: 'token'
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
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const url = 'https://api.itslanguage.nl/challenges/pronunciation/4/analyses';
    const controller = new Controller(api);
    controller.listPronunciationAnalyses(challenge.organisationId, challenge.id, false)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const analysis = new PronunciationAnalysis(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate), undefined, undefined, undefined, null);
        analysis.audioUrl = audioUrl;
        const analysis2 = new PronunciationAnalysis(challenge.id, '24',
          '6', new Date(stringDate), new Date(stringDate), undefined, undefined, undefined, null);
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

  it('should reject to get a list when challenge.id is not present', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '', 'test', new Blob());
    const controller = new Controller(api);
    controller.listPronunciationAnalyses(challenge.organisationId, null)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should reject to get a list when challenge.organisationId is not present', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const challenge = new PronunciationChallenge('fb', '7', 'test', new Blob());
    challenge.organisationId = null;
    const controller = new Controller(api);
    controller.listPronunciationAnalyses()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should get a detailed list of pronunciation analyses', done => {
    const api = new Connection({
      oAuth2Token: 'token'
    });

    const challenge = new PronunciationChallenge('fb', '4', 'test', new Blob());
    const url = 'https://api.itslanguage.nl/challenges/pronunciation/4/analyses?detailed=true';

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
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new Controller(api);
    controller.listPronunciationAnalyses(challenge.organisationId, challenge.id, true)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const analysis = new PronunciationAnalysis(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate), undefined, undefined, undefined, null);
        analysis.audioUrl = audioUrl;
        const analysis2 = new PronunciationAnalysis(challenge.id, '24',
          '6', new Date(stringDate), new Date(stringDate), undefined, undefined, undefined, null);
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
