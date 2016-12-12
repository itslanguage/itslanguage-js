import 'jasmine-ajax';
import ChoiceChallenge from '../src/administrative-sdk/choice-challenge/choice-challenge';
import ChoiceRecognition from '../src/administrative-sdk/choice-recognition/choice-recognition';
import ChoiceRecognitionController from '../src/administrative-sdk/choice-recognition/choice-recognition-controller';
import Connection from '../src/administrative-sdk/connection/connection-controller';
import SpeechChallenge from '../src/administrative-sdk/speech-challenge/speech-challenge';
import autobahn from 'autobahn';

describe('ChoiceRecognition Websocket API interaction test', () => {
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
            method();
          }, 500);
        } else {
          method();
        }
      };
      this.removeEventListener = function() {
      };

      this.hasUserMediaApproval = function() {
        return true;
      };
    };

    SessionMock = function() {
      this.call = function() {
        const d = autobahn.when.defer();
        d.resolve(fakeResponse);
        return d.promise;
      };
    };

    challenge = new ChoiceChallenge('fb', '4', null, ['a']);
    recorder = new RecorderMock();
    stringDate = '2014-12-31T23:59:59Z';
    fakeResponse = {
      id: '4',
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
    controller = new ChoiceRecognitionController(api);
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', done => {
    api = new Connection({});
    controller = new ChoiceRecognitionController(api);
      // Save WebSocket
    const old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');
    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be thrown!');
        })
        .catch(error => {
          expect(error.message).toEqual('WebSocket connection was not open.');
          // Restore WebSocket
          window.WebSocket = old;
        })
        .then(done);
  });

  it('should fail streaming when challenge is not present', done => {
    controller.startStreamingChoiceRecognition(null, null)
        .then(() => {
          fail('No result should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('"challenge" parameter is required or invalid');
        })
        .then(done);
  });

  it('should fail streaming when challenge is undefined', done => {
    controller.startStreamingChoiceRecognition(undefined, null)
        .then(() => {
          fail('No result should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('"challenge" parameter is required or invalid');
        })
        .then(done);
  });

  it('should fail streaming when challenge.id is not present', done => {
    challenge = new ChoiceChallenge('1', null, null, ['a']);
    controller.startStreamingChoiceRecognition(challenge, null)
        .then(() => {
          fail('No result should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('challenge.id field is required');
        })
        .then(done);
  });

  it('should fail streaming when challenge.organisationId is not present', done => {
    challenge = new ChoiceChallenge('', '2', null, ['a']);
    controller.startStreamingChoiceRecognition(challenge, null)
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
    challenge = new ChoiceChallenge('1', '4', null, ['a']);
    controller.startStreamingChoiceRecognition(challenge, recorder)
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
    api._recognitionId = '5';
    api._session = {};
    controller = new ChoiceRecognitionController(api);
    challenge = new ChoiceChallenge('1', '4', null, ['a']);
    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('No result should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('Session with recognitionId 5 still in progress.');
        })
        .then(done);
  });

  it('should start streaming a new choice recognition', done => {
    let progressCalled = false;
    controller.startStreamingChoiceRecognition(challenge, recorder)
      .progress(() => {
        progressCalled = true;
      })
      .then(result => {
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.choice.init_recognition', [],
          {trimStart: 0.15, trimEnd: 0});
        expect(progressCalled).toBeTruthy();
        expect(result.recognition.challenge).toEqual(challenge.id);
        expect(result.recognition.id).toEqual('4');
        expect(result.recognitionId).toBe(fakeResponse);
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
  });

  it('should start streaming a new choice recognition without trimming', done => {
    controller.startStreamingChoiceRecognition(challenge, recorder, false)
        .then(result => {
          expect(api._session.call).toHaveBeenCalled();
          expect(api._session.call).toHaveBeenCalledWith(
            'nl.itslanguage.choice.init_recognition', [],
            {trimStart: 0.00, trimEnd: 0});
          expect(result.recognition.challenge).toEqual(challenge.id);
          expect(result.recognition.id).toEqual('4');
          expect(result.recognitionId).toEqual(fakeResponse);
        })
        .catch(error => {
          fail('No error should be thrown ' + error);
        })
        .then(done);
  });

  it('should handle errors during streaming', done => {
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

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.choice.init_recognition') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.choice.write') {
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
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(result => fail('An error should be thrown ' + JSON.stringify(result)))
        .catch(error => {
          expect(error.message).toEqual('Encountered an error during writing');
          expect(error.recognition.id).toEqual('2');
          expect(error.recognition.student).toEqual('1');
          expect(error.recognition.created).toEqual(new Date(stringDate));
          expect(error.recognition.updated).toEqual(new Date(stringDate));
          expect(error.recognition.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });

  it('should wait to stream when there is no user approval yet', done => {
    recorder.hasUserMediaApproval = () => false;
    spyOn(recorder, 'addEventListener').and.callThrough();
    controller = new ChoiceRecognitionController(api);
    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          expect(recorder.addEventListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
        })
        .catch(error => {
          fail('no error should be thrown ' + error);
        })
        .then(done);
  });
  it('should handle errors while initializing challenge', done => {
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

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.choice.init_recognition') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.choice.init_challenge') {
        d.reject({error: 'error123'});
      } else {
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be returned');
        })
        .catch(error => {
          expect(error.error).toEqual('error123');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });

  it('should handle errors while initializing audio', done => {
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

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.choice.init_recognition') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.choice.init_audio') {
        d.reject({error: 'error123'});
      } else {
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be returned');
        })
        .catch(error => {
          expect(error.error).toEqual('error123');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });

  it('should handle errors while initializing recognition', done => {
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

    api._session.call = () => {
      const d = autobahn.when.defer();
      d.reject({error: 'error123'});
      return d.promise;
    };

    recorder.addEventListener = jasmine.createSpy();
    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be returned');
        })
        .catch(error => {
          expect(error.error).toEqual('error123');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });

  it('should handle errors while initializing recognition with a failed recognition', done => {
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

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.choice.recognise') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.choice.recognise') {
        d.reject({
          error: 'nl.itslanguage.recognition_failed',
          kwargs: {
            recognition: {
              message: null
            },
            analysis: {
              message: 'Encountered an error',
              studentId: '1',
              id: '2',
              created: stringDate,
              updated: stringDate,
              audioUrl: fakeResponse.audioUrl
            }
          }
        });
      } else {
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('Encountered an error');
          expect(error.recognition.id).toEqual('2');
          expect(error.recognition.student).toEqual('1');
          expect(error.recognition.created).toEqual(new Date(stringDate));
          expect(error.recognition.updated).toEqual(new Date(stringDate));
          expect(error.recognition.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });

  it('should handle errors while initializing recognition with a unhandled error', done => {
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

    api._session.call = (name, args) => {
      if (name !== 'nl.itslanguage.choice.recognise') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.choice.recognise') {
        d.reject({
          error: 'UNKNOWN ERROR',
          kwargs: {
            recognition: {
              message: null
            },
            analysis: {
              message: 'Encountered an error',
              studentId: '1',
              id: '2',
              created: stringDate,
              updated: stringDate,
              audioUrl: fakeResponse.audioUrl
            }
          }
        });
      } else {
        d.resolve(fakeResponse);
      }
      return d.promise;
    };

    controller.startStreamingChoiceRecognition(challenge, recorder)
        .then(() => {
          fail('An error should be returned');
        })
        .catch(error => {
          expect(error.message).toEqual('Encountered an error');
          expect(error.recognition.id).toEqual('2');
          expect(error.recognition.student).toEqual('1');
          expect(error.recognition.created).toEqual(new Date(stringDate));
          expect(error.recognition.updated).toEqual(new Date(stringDate));
          expect(error.recognition.audioUrl).toEqual(fakeResponse.audioUrl + 'token');
          expect(controller._connection._recognitionId).toBeNull();
        })
        .then(done);
  });
});

describe('API interaction', () => {
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';

  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should reject when there is no organisationId', done => {
    const controller = new ChoiceRecognitionController(api);
    controller.getChoiceRecognition()
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('organisationId field is required');
      })
      .then(done);
  });

  it('should reject when there is no challenge id', done => {
    const controller = new ChoiceRecognitionController(api);
    controller.getChoiceRecognition('fb')
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challengeId field is required');
      })
      .then(done);
  });

  it('should reject when there is no recognition id', done => {
    const controller = new ChoiceRecognitionController(api);
    controller.getChoiceRecognition('fb', '1')
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('recognitionId field is required');
      })
      .then(done);
  });

  it('should get a choicechallenge and update the recognised attribute', done => {
    const content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      recognised: 'recognised',
      studentId: '6'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const url = 'https://api.itslanguage.nl/challenges/choice/4/recognitions/5';
    const challenge = new SpeechChallenge('fb', '4');
    const controller = new ChoiceRecognitionController(api);
    controller.getChoiceRecognition(challenge.organisationId, challenge.id, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const recognition = new ChoiceRecognition(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate), audioUrl, 'recognised');
        expect(result).toEqual(recognition);
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      }).then(done);
  });

  it('should get an existing choice recognition', done => {
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
    const url = 'https://api.itslanguage.nl/challenges/choice/4/recognitions/5';
    const challenge = new SpeechChallenge('fb', '4');
    const controller = new ChoiceRecognitionController(api);
    controller.getChoiceRecognition(challenge.organisationId, challenge.id, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const recognition = new ChoiceRecognition(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate));
        recognition.audioUrl = audioUrl;
        expect(result).toEqual(recognition);
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      }).then(done);
  });

  it('should get a list of existing choice recognitions', done => {
    const challenge = new SpeechChallenge('fb', '4');
    const url = 'https://api.itslanguage.nl/challenges/choice/4/recognitions';
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
      recognised: 'Hi'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new ChoiceRecognitionController(api);
    controller.listChoiceRecognitions('fb', challenge.id)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const recognition = new ChoiceRecognition(challenge.id, '6',
          '5', new Date(stringDate), new Date(stringDate));
        recognition.audioUrl = audioUrl;

        const recognition2 = new ChoiceRecognition(challenge.id, '24',
          '6', new Date(stringDate), new Date(stringDate));
        recognition2.audioUrl = audioUrl;
        recognition2.recognised = 'Hi';
        const content1 = result[0];
        const content2 = result[1];

        expect(result.length).toBe(2);
        expect(content1).toEqual(recognition);
        expect(content2).toEqual(recognition2);
        expect(result).toEqual([recognition, recognition2]);
      }).catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should reject to get a list when challenge does not exist', done => {
    const controller = new ChoiceRecognitionController(api);
    controller.listChoiceRecognitions(null)
        .then(() => {
          fail('An error should be thrown');
        })
        .catch(error => {
          expect(error.message).toEqual('challengeId field is required');
        })
        .then(done);
  });

  it('should reject to get a list when challenge has no id', done => {
    const challenge = new SpeechChallenge('4', '');
    const controller = new ChoiceRecognitionController(api);
    controller.listChoiceRecognitions('4', challenge.id)
        .then(() => {
          fail('An error should be thrown');
        })
        .catch(error => {
          expect(error.message).toEqual('challengeId field is required');
        })
        .then(done);
  });

  it('should reject to get a list when challenge has no organisationId', done => {
    const challenge = new SpeechChallenge('', '4');
    const controller = new ChoiceRecognitionController(api);
    controller.listChoiceRecognitions('', challenge.id)
        .then(() => {
          fail('An error should be thrown');
        })
        .catch(error => {
          expect(error.message).toEqual('organisationId field is required');
        })
        .then(done);
  });
});
