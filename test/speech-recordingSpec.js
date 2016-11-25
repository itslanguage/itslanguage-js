import 'jasmine-ajax';
import Connection from '../administrative-sdk/connection/connection-controller';
import SpeechChallenge from '../administrative-sdk/speech-challenge/speech-challenge';
import SpeechRecording from '../administrative-sdk/speech-recording/speech-recording';
import SpeechRecordingController from '../administrative-sdk/speech-recording/speech-recording-controller';
import Student from '../administrative-sdk/student/student';
import autobahn from 'autobahn';

describe('SpeechRecording object test', () => {
  it('should require all required fields in constructor', () => {
    expect(() => {
      new SpeechRecording();
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');
    expect(() => {
      new SpeechRecording(1);
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');

    const challenge = new SpeechChallenge('fb');
    expect(() => {
      new SpeechRecording(challenge);
    }).toThrowError(
      'student parameter of type "Student" is required');
    expect(() => {
      new SpeechRecording(challenge, 1);
    }).toThrowError(
      'student parameter of type "Student" is required');

    const student = new Student('org');
    expect(() => {
      new SpeechRecording(challenge, student, 1);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(() => {
      new SpeechRecording(challenge, student, '1', 'foo');
    }).toThrowError('audio parameter of type "Blob|null" is required');
  });
  it('should instantiate a SpeechRecording', () => {
    const blob = new Blob(['1234567890']);
    const challenge = new SpeechChallenge('fb');
    const student = new Student('org');

    // Without audio
    let s = new SpeechRecording(challenge, student, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.audio).toBeUndefined();
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // Without id
    s = new SpeechRecording(challenge, student, null, blob);
    expect(s).toBeDefined();
    expect(s.id).toBe(null);
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // With id
    s = new SpeechRecording(challenge, student, 'test', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);
  });
});

describe('SpeechRecording API interaction test', () => {
  const api = new Connection({
    oAuth2Token: 'token'
  });
  const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
  const controller = new SpeechRecordingController(api);

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

  it('should reject to get a recording if challenge is not present', done => {
    controller.getSpeechRecording(null, '5')
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should reject to get a recording if challenge.id is not present', done => {
    const challenge = new SpeechChallenge('fb', '');
    controller.getSpeechRecording(challenge, '5')
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should reject to get a recording if challenge.organisationId is not present', done => {
    const challenge = new SpeechChallenge('', '4');
    controller.getSpeechRecording(challenge, '5')
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.organisationId field is required');
      })
      .then(done);
  });

  it('should get an existing speech recording', done => {
    const url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings/5';
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

    const challenge = new SpeechChallenge('fb', '4');
    controller.getSpeechRecording(challenge, '5')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const student = new Student('fb', '6');
        const recording = new SpeechRecording(challenge, student, '5');
        const stringDate = '2014-12-31T23:59:59Z';
        recording.created = new Date(stringDate);
        recording.updated = new Date(stringDate);
        recording.audio = null;
        recording.audioUrl = audioUrl + '?access_token=token';
        expect(result).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should reject to get a list of recordings if challenge is not present', done => {
    controller.listSpeechRecordings(null)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should reject to get a list of recordings if challenge.id is not present', done => {
    const challenge = new SpeechChallenge('fb', '');
    controller.listSpeechRecordings(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should reject to get a list of recordings if challenge.organisationId is not present', done => {
    const challenge = new SpeechChallenge('', '4');
    controller.listSpeechRecordings(challenge)
      .then(() => {
        fail('An error should be thrown');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.organisationId field is required');
      })
      .then(done);
  });

  it('should get a list of existing speech recordings', done => {
    const url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings';
    const content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl,
      studentId: '6'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const challenge = new SpeechChallenge('fb', '4');
    controller.listSpeechRecordings(challenge)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const student = new Student('fb', '6');
        const recording = new SpeechRecording(challenge, student, '5');
        const stringDate = '2014-12-31T23:59:59Z';
        recording.created = new Date(stringDate);
        recording.updated = new Date(stringDate);
        recording.audio = null;
        recording.audioUrl = audioUrl + '?access_token=token';
        expect(result[0]).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

describe('Speech Recording Websocket API interaction test', () => {
  let api;
  let fakeResponse;
  let RecorderMock;
  let SessionMock;
  let challenge;
  let recorder;
  let session;
  let stringDate;
  let controller;
  function setupCalling(urlEndpoint, rejection) {
    session.call = (name, args) => {
      if (name !== 'nl.itslanguage.recording.init_recording') {
        expect(args[0]).not.toBeNull();
      }
      const d = autobahn.when.defer();
      if (name === 'nl.itslanguage.recording.' + urlEndpoint) {
        d.reject(rejection);
      } else {
        d.notify();
        d.resolve(fakeResponse);
      }
      return d.promise;
    };
    api._session = session;
  }

  beforeEach(() => {
    jasmine.Ajax.install();
    api = new Connection({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar',
      oAuth2Token: 'token'
    });
    fakeResponse = {
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

      this.isRecording = function() {
        return false;
      };

      this.recorded = null;

      this.addEventListener = function(name, func) {
        if (name === 'recorded') {
          this.recorded = func;
        } else if (name === 'dataavailable') {
          func('EventFired');
          this.recorded('recordDone');
        } else {
          func();
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
    challenge = new SpeechChallenge('fb', '4');
    recorder = new RecorderMock();
    session = new SessionMock();
    stringDate = '2014-12-31T23:59:59Z';
    controller = new SpeechRecordingController(api);
    api._session = new SessionMock();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when challenge is not present', done => {
    controller.startStreamingSpeechRecording(null, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge is undefined', done => {
    controller.startStreamingSpeechRecording(undefined, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('"challenge" parameter is required or invalid');
      })
      .then(done);
  });

  it('should fail streaming when challenge.id is not present', done => {
    challenge = new SpeechChallenge('1', '', '', null);
    controller.startStreamingSpeechRecording(challenge, null)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('challenge.id field is required');
      })
      .then(done);
  });

  it('should fail streaming when challenge.organisationId is not present', done => {
    challenge = new SpeechChallenge('', '2', '', null);
    controller.startStreamingSpeechRecording(challenge, null)
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
    challenge = new SpeechChallenge('1', '4', '', null);
    controller.startStreamingSpeechRecording(challenge, recorder)
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
    api._recordingId = '5';
    api._session = {};
    controller = new SpeechRecordingController(api);
    challenge = new SpeechChallenge('1', '4', '', null);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('No result should be returned');
      })
      .catch(error => {
        expect(error.message).toEqual('Session with recordingId 5 still in progress.');
      })
      .then(done);
  });

  it('should handle errors while initializing challenge', done => {
    setupCalling('init_challenge', {error: 'error123'});
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing recording', done => {
    setupCalling('init_recording', {error: 'error123'});
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors while initializing audio', done => {
    setupCalling('init_audio', {error: 'error123'});
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors when closing streaming', done => {
    setupCalling('close', {error: 'error123'});
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should handle errors when writing a chunk', done => {
    setupCalling('write', {error: 'error123'});
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be returned');
      })
      .catch(error => {
        expect(error.error).toEqual('error123');
        expect(controller._connection._recordingId).toBeNull();
      })
      .then(done);
  });

  it('should wait to stream when there is no user approval yet', done => {
    recorder.hasUserMediaApproval = () => false;
    spyOn(recorder, 'addEventListener').and.callThrough();
    controller = new SpeechRecordingController(api);
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        expect(recorder.addEventListener).toHaveBeenCalledWith('ready', jasmine.any(Function));
      })
      .catch(error => {
        fail('no error should be thrown ' + error);
      })
      .then(done);
  });

  it('should fail streaming when websocket connection is closed', done => {
    api = new Connection({});
    controller = new SpeechRecordingController(api);
    // Save WebSocket
    const old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');
    const expectedMessage = 'WebSocket connection was not open.';
    controller.startStreamingSpeechRecording(challenge, recorder)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        expect(error.message).toEqual(expectedMessage);
        // Restore WebSocket
        window.WebSocket = old;
      })
      .then(done);
  });

  it('should start streaming a new speech recording', done => {
    let progressCalled = false;
    api._session = session;
    spyOn(api._session, 'call').and.callThrough();
    controller.startStreamingSpeechRecording(
      challenge, recorder)
      .progress(() => {
        progressCalled = true;
      })
      .then(result => {
        expect(result.challenge).toEqual(challenge);
        expect(result.student.organisationId).toBe(challenge.organisationId);
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.recording.init_recording', []);
        expect(progressCalled).toBeTruthy();
        expect(result.recordingId).toEqual(fakeResponse);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
