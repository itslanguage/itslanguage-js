import Connection from '../src/administrative-sdk/connection/connection-controller';
import EmailCredentials from '../src/administrative-sdk/email-credentials/email-credentials';
import EmailCredentialsController from '../src/administrative-sdk/email-credentials/email-credentials-controller';

describe('Email credentials', () => {
  it('should not construct with an invalid email', () => {
    [0, {}, [], true, false, null, undefined].map(v => {
      expect(() => {
        new EmailCredentials(v);
      }).toThrowError('email parameter of type "string" is required');
    });
  });

  it('should not construct with an invalid password', () => {
    [0, {}, [], true, false].map(v => {
      expect(() => {
        new EmailCredentials('email', v);
      }).toThrowError('password parameter of type "string|null" is required');
    });
  });

  it('should construct with valid parameters', () => {
    const emailCredentials = new EmailCredentials('email@mail.mail', 'hunter2');
    expect(emailCredentials.email).toEqual('email@mail.mail');
    expect(emailCredentials.password).toEqual('hunter2');
  });

  it('should not create emailcredentials in API with invalid userId', done => {
    const controller = new EmailCredentialsController();
    [0, {}, [], true, false, null, undefined].map(v => {
      controller.createEmailCredentials(v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('userId field is required');
        })
        .then(done);
    });
  });

  it('should not create emailcredentials in API with invalid emailCredentials', done => {
    const controller = new EmailCredentialsController();
    [0, {}, [], true, false, null, undefined].map(v => {
      controller.createEmailCredentials('0', v)
        .then(fail)
        .catch(error => {
          expect(error.message).toEqual('emailCredentials field is required');
        })
        .then(done);
    });
  });

  it('should create an emailcredentials without password in API', done => {
    const creds = new EmailCredentials('email');
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new EmailCredentialsController(api);
    const url = 'https://api.itslanguage.nl/users/1/emailauths';
    const expected = {email: 'email', password: null};
    const pass = 'qwertyuiop';
    const stringDate = '2014-12-31T23:59:59Z';
    const content = {
      email: 'email',
      password: pass,
      created: stringDate,
      updated: stringDate
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createEmailCredentials('1', creds)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        expect(result.email).toEqual(creds.email);
        expect(result.password).toEqual(pass);
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
      })
      .catch(fail)
      .then(done);
  });

  it('should create an emailcredentials with password in API', done => {
    const pass = 'qwertyuiop';
    const email = 'email';
    const creds = new EmailCredentials(email, pass);
    const api = new Connection({
      oAuth2Token: 'token'
    });
    const controller = new EmailCredentialsController(api);
    const url = 'https://api.itslanguage.nl/users/1/emailauths';
    const expected = {email: 'email', password: pass};
    const stringDate = '2014-12-31T23:59:59Z';
    const content = {
      email,
      password: pass,
      created: stringDate,
      updated: stringDate
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));

    controller.createEmailCredentials('1', creds)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        expect(request[1].body).toEqual(JSON.stringify(expected));
        expect(result.email).toEqual(creds.email);
        expect(result.password).toEqual(creds.password);
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
      })
      .catch(fail)
      .then(done);
  });
});
