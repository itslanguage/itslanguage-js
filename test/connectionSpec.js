/* eslint-disable
camelcase
 */

require('jasmine-ajax');
const Connection = require('../administrative-sdk/connection/connection-controller');
const BasicAuth = require('../administrative-sdk/basic-auth/basic-auth');
let api;

describe('Events', () => {
  let handler;
  beforeEach(() => {
    api = new Connection({
      oAuth2Token: 'token'
    });
    handler = jasmine.createSpyObj('handler', ['handler1', 'handler2', 'handler3']);
  });

  it('should try to remove a listener that is not registered', () => {
    api.addEventListener('evt1', handler.handler1);
    api.addEventListener('evt1', handler.handler2);
    api.removeEventListener('evt1', handler.handler3);
    api.fireEvent('evt1', ['argument']);
    expect(handler.handler1).toHaveBeenCalledTimes(1);
    expect(handler.handler1).toHaveBeenCalledWith('argument');
    expect(handler.handler2).toHaveBeenCalledTimes(1);
    expect(handler.handler2).toHaveBeenCalledWith('argument');
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should remove a listener that is registered', () => {
    api.addEventListener('evt1', handler.handler1);
    api.addEventListener('evt1', handler.handler2);
    api.removeEventListener('evt1', handler.handler1);
    api.fireEvent('evt1', ['argument']);
    expect(handler.handler1).toHaveBeenCalledTimes(0);
    expect(handler.handler2).toHaveBeenCalledTimes(1);
    expect(handler.handler2).toHaveBeenCalledWith('argument');
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should try to remove a listener when the event has no listeners', () => {
    api.removeEventListener('evt1', handler.handler1);
    api.fireEvent('evt1', ['argument']);
    expect(handler.handler1).toHaveBeenCalledTimes(0);
    expect(handler.handler2).toHaveBeenCalledTimes(0);
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should fire an event with two different handlers', () => {
    api.addEventListener('evt1', handler.handler1);
    api.addEventListener('evt1', handler.handler2);
    api.fireEvent('evt1', ['argument']);

    expect(handler.handler1).toHaveBeenCalledTimes(1);
    expect(handler.handler1).toHaveBeenCalledWith('argument');
    expect(handler.handler2).toHaveBeenCalledTimes(1);
    expect(handler.handler2).toHaveBeenCalledWith('argument');
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should fire an event with duplicate handlers', () => {
    api.addEventListener('evt1', handler.handler1);
    api.addEventListener('evt1', handler.handler1);
    api.fireEvent('evt1', ['argument']);
    expect(handler.handler1).toHaveBeenCalledTimes(2);
    expect(handler.handler1).toHaveBeenCalledWith('argument');
    expect(handler.handler2).toHaveBeenCalledTimes(0);
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should fire an event with no handlers', () => {
    api.addEventListener('evt1', handler.handler1);
    api.fireEvent('evt4');
    expect(handler.handler1).toHaveBeenCalledTimes(0);
    expect(handler.handler2).toHaveBeenCalledTimes(0);
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });

  it('should fire an event with no arguments', () => {
    api.addEventListener('evt1', handler.handler1);
    api.fireEvent('evt1');
    expect(handler.handler1).toHaveBeenCalledTimes(1);
    expect(handler.handler1).toHaveBeenCalledWith();
    expect(handler.handler2).toHaveBeenCalledTimes(0);
    expect(handler.handler3).toHaveBeenCalledTimes(0);
  });
});

describe('Connection', () => {
  let fakeResponse;
  let url;
  describe('POST, GET and DELETE', () => {
    beforeEach(() => {
      jasmine.Ajax.install();
    });

    afterEach(() => {
      jasmine.Ajax.uninstall();
    });

    it('should throw error on required auth credentials on GET', done => {
      api = new Connection();
      api._secureAjaxGet()
        .then(fail)
        .catch(error => {
          expect(error).toEqual('Please set oAuth2Token');
        })
        .then(done);
    });

    it('should throw error on required auth credentials on POST', done => {
      api._secureAjaxPost()
        .then(fail)
        .catch(error => {
          expect(error).toEqual('Please set oAuth2Token');
        })
        .then(done);
    });

    it('should throw error on required auth credentials on DELETE', done => {
      api._secureAjaxDelete()
        .then(fail)
        .catch(error => {
          expect(error).toEqual('Please set oAuth2Token');
        })
        .then(done);
    });

    describe('Authorization header', () => {
      beforeEach(() => {
        api = new Connection({
          oAuth2Token: 'token'
        });
        url = api.settings.apiUrl;
        fakeResponse = new Response(JSON.stringify({}), {
          status: 200,
          header: {
            'Content-type': 'application/json'
          }
        });
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      });
      describe('Assemble the Authorization header', () => {
        it('should correctly assemble the Authorization header on GET', done => {
          api._secureAjaxGet(url)
            .then(() => {
              const request = window.fetch.calls.mostRecent().args;
              expect(request[1].headers.get('Authorization')).toEqual('Bearer token');
            })
            .catch(error => {
              fail('No error should be thrown: ' + error);
            })
            .then(done);
        });

        it('should correctly assemble the Authorization header on POST', done => {
          api._secureAjaxPost(url)
            .then(() => {
              const request = window.fetch.calls.mostRecent().args;
              expect(request[1].headers.get('Authorization')).toEqual('Bearer token');
            })
            .catch(error => {
              fail('No error should be thrown: ' + error);
            }).then(done);
        });

        it('should correctly assemble the Authorization header on DELETE', done => {
          api._secureAjaxDelete(url)
            .then(() => {
              const request = window.fetch.calls.mostRecent().args;
              expect(request[1].headers.get('Authorization')).toEqual('Bearer token');
            })
            .catch(error => {
              fail('No error should be thrown: ' + error);
            }).then(done);
        });
      });
    });

    describe('Error handling', () => {
      beforeEach(() => {
        const content = {
          message: 'invalid_request'
        };
        fakeResponse = new Response(JSON.stringify(content), {
          status: 400,
          header: {
            'Content-type': 'application/json'
          }
        });
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      });
      it('should handle errors on GET', done => {
        api._secureAjaxGet(url)
          .then(() => {
            fail('No result should be returned');
          })
          .catch(error => {
            expect(error.message).toEqual('invalid_request');
          })
          .then(done);
      });

      it('should handle errors on POST', done => {
        api._secureAjaxPost(url)
          .then(() => {
            fail('No result should be returned');
          })
          .catch(error => {
            expect(error.message).toEqual('invalid_request');
          })
          .then(done);
      });

      it('should handle errors on DELETE', done => {
        api._secureAjaxDelete(url)
          .then(() => {
            fail('No result should be returned');
          })
          .catch(error => {
            expect(error.message).toEqual('invalid_request');
          })
          .then(done);
      });
    });
  });

  describe('Connection oauth2 token get', () => {
    it('should handle server error on invalid scope', done => {
      const content = {
        error: 'invalid_scope'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 400,
        header: {
          'Content-type': 'application/json'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const basicAuth = new BasicAuth('', 'principal', 'credentials');
      api.getOauth2Token(basicAuth, 'fb', 'dummy')
      .then(fail)
      .catch(error => {
        expect(error).toEqual(content);
      })
      .then(done);
    });

    it('should handle server errors on invalid credentials', done => {
      const content = {
        error: 'invalid_request'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 400,
        header: {
          'Content-type': 'application/json'
        }
      });
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      const basicAuth = new BasicAuth('', 'invalid', 'invalid');
      api.getOauth2Token(basicAuth, 'fb', 'dummy')
      .then(fail)
      .catch(error => {
        expect(error).toEqual(content);
      })
      .then(done);
    });

    it('should get a token', done => {
      const content = {
        access_token: '2b198b6bc87db1bdb',
        token_type: 'Bearer',
        scope: 'tenant/4'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        header: {
          'Content-type': 'application/json'
        }
      });
      const basicAuth = new BasicAuth('4', 'principal', 'credentials');
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      url += '/tokens';
      api.getOauth2Token(basicAuth, 'fb', 'dummy')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].body).toEqual('grant_type=password&' +
          'scope=tenant/' + basicAuth.tenantId +
          '/organisation/fb/student/dummy&username=' + basicAuth.principal +
          '&password=' + basicAuth.credentials);
        expect(result.token_type).toEqual('Bearer');
        expect(result.access_token).toEqual('2b198b6bc87db1bdb');
        expect(result.scope).toEqual('tenant/4');
      })
      .catch(error => {
        fail('No error should be thrown ' + error);
      })
      .then(done);
    });

    it('should get a token without student id', done => {
      const content = {
        access_token: '2b198b6bc87db1bdb',
        token_type: 'Bearer',
        scope: 'tenant/4'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        header: {
          'Content-type': 'application/json'
        }
      });
      const basicAuth = new BasicAuth('4', 'principal', 'credentials');
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      api.getOauth2Token(basicAuth, 'fb')
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].body).toEqual('grant_type=password&' +
            'scope=tenant/' + basicAuth.tenantId +
            '/organisation/fb&username=' + basicAuth.principal +
            '&password=' + basicAuth.credentials);
          expect(result.token_type).toEqual('Bearer');
          expect(result.access_token).toEqual('2b198b6bc87db1bdb');
          expect(result.scope).toEqual('tenant/4');
        })
        .catch(error => {
          fail('No error should be thrown ' + error);
        })
        .then(done);
    });

    it('should get a token without organisation and student', done => {
      const content = {
        access_token: '2b198b6bc87db1bdb',
        token_type: 'Bearer',
        scope: 'tenant/4'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 200,
        header: {
          'Content-type': 'application/json'
        }
      });
      const basicAuth = new BasicAuth('4', 'principal', 'credentials');
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      api.getOauth2Token(basicAuth)
        .then(result => {
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].body).toEqual('grant_type=password&' +
            'scope=tenant/' + basicAuth.tenantId +
            '&username=' + basicAuth.principal +
            '&password=' + basicAuth.credentials);
          expect(result.token_type).toEqual('Bearer');
          expect(result.access_token).toEqual('2b198b6bc87db1bdb');
          expect(result.scope).toEqual('tenant/4');
        })
        .catch(error => {
          fail('No error should be thrown ' + error);
        })
        .then(done);
    });

    it('should get a token without organisation and with student', done => {
      const content = {
        error: 'invalid_scope'
      };
      fakeResponse = new Response(JSON.stringify(content), {
        status: 400,
        header: {
          'Content-type': 'application/json'
        }
      });
      const basicAuth = new BasicAuth('4', null, 'credentials');
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
      api.getOauth2Token(basicAuth)
        .then(fail)
        .catch(error => {
          expect(error.error).toEqual('invalid_scope');
          const request = window.fetch.calls.mostRecent().args;
          expect(request[0]).toBe(url);
          expect(request[1].body).toEqual('grant_type=password&' +
            'scope=tenant/' + basicAuth.tenantId +
            '&username=' + basicAuth.principal +
            '&password=' + basicAuth.credentials);
        })
        .then(done);
    });
  });

  describe('Add access token', () => {
    it('should throw when credentials are invalid', () => {
      api = new Connection({
        oAuth2Token: null
      });
      expect(() => {
        api.addAccessToken();
      }).toThrowError('Please set oAuth2Token');
    });

    it('should add an access token to an url', () => {
      api = new Connection({
        oAuth2Token: 'token'
      });
      url = 'https://api.itslanguage.nl';
      const output = api.addAccessToken(url);
      expect(output).toEqual(url + '?access_token=token');
    });

    it('should add an access token to an url with an existing query parameter', () => {
      api = new Connection({
        oAuth2Token: 'token'
      });
      url = 'https://api.itslanguage.nl?foo=bar';
      const output = api.addAccessToken(url);
      expect(output).toEqual(url + '&access_token=token');
    });
  });
  it('should log RPC errors', () => {
    spyOn(console, 'error');
    Connection.logRPCError({
      error: 'Got an error!'
    });
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('RPC error returned:', 'Got an error!');
  });

  it('should detect browser incompatibility', () => {
    const backupSocket = window.WebSocket;
    delete window.WebSocket;
    expect(() => {
      Connection._sdkCompatibility();
    }).toThrowError('No WebSocket capabilities');
    window.WebSocket = backupSocket;
  });

  describe('Cancel streaming', () => {
    let recorderMock;
    beforeEach(() => {
      recorderMock = {
        removeAllEventListeners: jasmine.createSpy(),
        isRecording: jasmine.createSpy().and.returnValue(true),
        stop: jasmine.createSpy()
      };
      api = new Connection();
    });

    it('should cancel streaming', () => {
      api._recordingId = '1';
      api._analysisId = '2';
      api._recognitionId = '3';

      api.cancelStreaming(recorderMock);

      expect(recorderMock.removeAllEventListeners).toHaveBeenCalledTimes(1);
      expect(recorderMock.isRecording).toHaveBeenCalledTimes(1);
      expect(recorderMock.stop).toHaveBeenCalledTimes(1);
      expect(api._recognitionId).toBeNull();
      expect(api._recordingId).toBeNull();
      expect(api._analysisId).toBeNull();
    });

    it('should not cancel streaming when there is no session in progress', () => {
      api.cancelStreaming(recorderMock);
      expect(recorderMock.removeAllEventListeners).toHaveBeenCalledTimes(0);
      expect(recorderMock.isRecording).toHaveBeenCalledTimes(0);
      expect(recorderMock.stop).toHaveBeenCalledTimes(0);
      expect(api._recognitionId).toBeNull();
      expect(api._recordingId).toBeNull();
      expect(api._analysisId).toBeNull();
    });

    it('should cancel streaming when the recorder has already stopped', () => {
      recorderMock.isRecording = jasmine.createSpy().and.returnValue(false);
      api._recordingId = '1';
      api._analysisId = '2';
      api._recognitionId = '3';
      api.cancelStreaming(recorderMock);
      expect(recorderMock.removeAllEventListeners).toHaveBeenCalledTimes(1);
      expect(recorderMock.isRecording).toHaveBeenCalledTimes(1);
      expect(recorderMock.stop).toHaveBeenCalledTimes(0);
      expect(api._recognitionId).toBeNull();
      expect(api._recordingId).toBeNull();
      expect(api._analysisId).toBeNull();
    });
  });
});

describe('Autobahn', () => {
  it('should try to create an autobahn connection and handle an error', () => {
    const mockBahn = {
      Connection() {
        throw new Error('Cannot construct');
      }
    };
    spyOn(console, 'log');
    Connection.__set__('autobahn', mockBahn);
    api.webSocketConnect('token');
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('WebSocket creation error: Error: Cannot construct');
  });

  it('should create an autobahn connection', () => {
    const mockSession = {
      call: (url, ...args) => {
        console.log('Called mock session at ' + url + ' with ' + args);
      }
    };
    const mockBahn = {
      Connection(options) {
        this.onchallenge = options.onchallenge;
        this.onerror = null;
        this.onopen = null;
        this.onclose = null;
        this.open = () => {
          this.onerror('error');
          this.onopen(mockSession);
          this.onclose();
          this.onchallenge(mockSession, 'ticket');
        };
      }
    };
    spyOn(api, 'fireEvent');
    spyOn(console, 'log');
    spyOn(console, 'debug');
    Connection.__set__('autobahn', mockBahn);
    api.webSocketConnect('token');
    mockSession.call('apiUrl', 'extra argument');
    expect(api.fireEvent).toHaveBeenCalledWith('websocketError', ['error']);
    expect(console.log).toHaveBeenCalledWith('WebSocket error: error');

    expect(api.fireEvent).toHaveBeenCalledWith('websocketOpened');
    expect(console.log).toHaveBeenCalledWith('WebSocket connection opened');

    expect(api.fireEvent).toHaveBeenCalledWith('websocketClosed');
    expect(console.log).toHaveBeenCalledWith('WebSocket disconnected');

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledWith('Calling RPC: apiUrl');
    expect(console.log).toHaveBeenCalledWith('Called mock session at apiUrl with extra argument');

    expect(console.log).toHaveBeenCalledTimes(4);
  });

  it('should create an autobahn connection and throw on invalid challenge method', () => {
    const mockBahn = {
      Connection(options) {
        this.onchallenge = options.onchallenge;
        this.open = () => {
          this.onchallenge(null, 'cra');
        };
      }
    };
    Connection.__set__('autobahn', mockBahn);
    expect(() => {
      api.webSocketConnect('token');
    }).toThrowError('don\'t know how to authenticate using \'cra\'');
  });
});
