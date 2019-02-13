/**
 * This file contains the unit tests for the exported function in the
 * accompanying `auth.js` file.
 */

import * as auth from '.';
import * as communication from '../communication';


describe('assembleScope', () => {
  it('should always require arguments', () => {
    expect(() => auth.assembleScope())
      .toThrowError(Error, 'Arguments are required to assemble scope.');
  });

  it('should build a valid scope for a top level admin', () => {
    expect(auth.assembleScope(null, null, 'superadmin'))
      .toEqual('user/superadmin');
  });

  it('should build a valid scope for a tenant only', () => {
    expect(auth.assembleScope('rotterdam'))
      .toEqual('tenant/rotterdam');
  });

  it('should build a valid scope for a tenant user only', () => {
    expect(auth.assembleScope('rotterdam', null, 'lee'))
      .toEqual('tenant/rotterdam/user/lee');
  });

  it('should build a valid scope for an organisation in a tenant', () => {
    expect(auth.assembleScope('rotterdam', 'towers'))
      .toEqual('tenant/rotterdam/organisation/towers');
  });

  it('should build a valid scope for an user in an organisation in a tenant', () => {
    expect(auth.assembleScope('rotterdam', 'towers', 'lee'))
      .toEqual('tenant/rotterdam/organisation/towers/user/lee');
  });
});

describe('impersonate', () => {
  let authorisedRequestSpy;
  let updateSettingsSpy;

  beforeEach(() => {
    authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    updateSettingsSpy = spyOn(communication, 'updateSettings');
  });

  it('should make a post request and update the settings', (done) => {
    // eslint-disable-next-line camelcase
    authorisedRequestSpy.and.returnValue(Promise.resolve({ access_token: 'token' }));

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'client_credentials');
    expectedBody.set('scope', 'this/is/not/a/valid/scope');

    auth.impersonate('this/is/not/a/valid/scope')
      .then(() => {
        const requestCall = authorisedRequestSpy.calls.mostRecent();

        expect(requestCall.args).toEqual(['POST', '/tokens', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({ authorizationToken: 'token' });
        done();
      })
      .catch(done.fail);
  });

  it('should not require a scope', (done) => {
    // eslint-disable-next-line camelcase
    authorisedRequestSpy.and.returnValue(Promise.resolve({ access_token: 'token' }));

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'credentials');

    auth.impersonate()
      .then(() => {
        const requestCall = authorisedRequestSpy.calls.mostRecent();

        expect(requestCall.args).toEqual(['POST', '/tokens', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({ authorizationToken: 'token' });
        done();
      })
      .catch(done.fail);
  });

  it('should return a rejected promise if the request went wrong', (done) => {
    authorisedRequestSpy.and.returnValue(Promise.reject());

    auth.impersonate('foo')
      .then(done.fail)
      .catch(done);
  });
});

describe('authenticate', () => {
  let requestSpy;
  let updateSettingsSpy;

  beforeEach(() => {
    requestSpy = spyOn(communication, 'request');
    updateSettingsSpy = spyOn(communication, 'updateSettings');
  });

  it('should make a post request and update the settings', (done) => {
    requestSpy.and.returnValue(Promise.resolve({ access_token: 'token' })); // eslint-disable-line camelcase

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'password');
    expectedBody.set('username', 'foo');
    expectedBody.set('password', 'bar');
    expectedBody.set('scope', 'this/is/not/a/valid/scope');

    auth.authenticate('foo', 'bar', 'this/is/not/a/valid/scope')
      .then(() => {
        const requestCall = requestSpy.calls.mostRecent();

        expect(requestCall.args).toEqual(['POST', '/tokens', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({ authorizationToken: 'token' });
        done();
      })
      .catch(done.fail);
  });

  it('should not require a scope', (done) => {
    requestSpy.and.returnValue(Promise.resolve({ access_token: 'token' })); // eslint-disable-line camelcase

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'password');
    expectedBody.set('username', 'foo');
    expectedBody.set('password', 'bar');

    auth.authenticate('foo', 'bar')
      .then(() => {
        const requestCall = requestSpy.calls.mostRecent();

        expect(requestCall.args).toEqual(['POST', '/tokens', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({ authorizationToken: 'token' });
        done();
      })
      .catch(done.fail);
  });

  it('should return a rejected promise if the request went wrong', (done) => {
    requestSpy.and.returnValue(Promise.reject());

    auth.authenticate('foo', 'bar')
      .then(done.fail)
      .catch(done);
  });
});
