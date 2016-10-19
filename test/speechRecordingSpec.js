require('jasmine-ajax');
const autobahn = require('autobahn');
const SpeechChallenge = require('../administrative-sdk/speechChallenge').SpeechChallenge;
const SpeechRecording = require('../administrative-sdk/speechRecording').SpeechRecording;
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;

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

  it('should get an existing speech recording', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings/5';
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

    const challenge = new SpeechChallenge('fb', '4');
    SpeechRecording.getSpeechRecording(api, challenge, '5')
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
        recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
        expect(result).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing speech recordings', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings';
    const audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
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
    SpeechRecording.listSpeechRecordings(api, challenge)
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
        recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
        expect(result[0]).toEqual(recording);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});

describe('Speech Recording Websocket API interaction test', () => {
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
    }

    // Save WebSocket
    const old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    const challenge = new SpeechChallenge('fb', '4');
    const recording = new SpeechRecording(challenge, new Student(), '3', new Blob());
    const recorder = new RecorderMock();

    const expectedMessage = 'WebSocket connection was not open.';

    recording.startStreamingSpeechRecording(api, challenge, recorder)
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
        }
      };
      this.removeEventListener = function() {
      };

      this.hasUserMediaApproval = function() {
        return true;
      };
    }

    const challenge = new SpeechChallenge('fb', '4');
    const recording = new SpeechRecording(challenge, new Student(), '3', new Blob());
    const recorder = new RecorderMock();
    const stringDate = '2014-12-31T23:59:59Z';
    const fakeResponse = {
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
        const d = autobahn.when.defer();
        d.resolve(fakeResponse);
        return d.promise;
      };
    }

    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    recording.startStreamingSpeechRecording(
      api, challenge, recorder)
      .then(result => {
        expect(result.challenge).toEqual(challenge);
        expect(result.student.organisationId).toBe(challenge.organisationId);
        expect(api._session.call).toHaveBeenCalled();
        expect(api._session.call).toHaveBeenCalledWith(
          'nl.itslanguage.recording.init_recording', []);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
