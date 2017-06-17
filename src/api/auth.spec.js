/**
 * This file contains the unittests for the exported function in the
 * acompanying `auth.js` file.
 */

import * as auth from './auth';
import * as communication from './communication';


describe('assembleScope', () => {
  it('should always require the tenant', () => {
    expect(() => auth.assembleScope())
      .toThrowError(Error, 'A tenant is always required.');
  });

  it('should build a complete scope when all parameterss are provided', () => {
    expect(auth.assembleScope('t3n', '0rg', 'u53r'))
      .toEqual('tenant/t3n/organisation/0rg/user/u53r');
  });

  it('should allow to omit the user', () => {
    expect(auth.assembleScope('t3n', '0rg'))
      .toEqual('tenant/t3n/organisation/0rg');
  });

  it('should not add the user if the organisation is omitted', () => {
    expect(auth.assembleScope('t3n', null, 'u53r'))
      .toEqual('tenant/t3n');
  });
});


describe('authenticate', () => {
  let requestSpy;
  let updateSettingsSpy;

  beforeEach(() => {
    requestSpy = spyOn(communication, 'request');
    updateSettingsSpy = spyOn(communication, 'updateSettings');
  });

  it('should make a post request and update the settings', done => {
    requestSpy.and.returnValue(Promise.resolve({access_token: 'token'})); // eslint-disable-line camelcase

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'password');
    expectedBody.set('username', 'foo');
    expectedBody.set('password', 'bar');
    expectedBody.set('scope', 'this/is/not/a/valid/scope');

    auth.authenticate('foo', 'bar', 'this/is/not/a/valid/scope')
      .then(() => {
        const requestCall = requestSpy.calls.mostRecent();
        expect(requestCall.args).toEqual(['POST', '/token', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({authorizationToken: 'token'});
        done();
      }, fail);
  });

  it('should not require a scope', done => {
    requestSpy.and.returnValue(Promise.resolve({access_token: 'token'})); // eslint-disable-line camelcase

    const expectedBody = new URLSearchParams();
    expectedBody.set('grant_type', 'password');
    expectedBody.set('username', 'foo');
    expectedBody.set('password', 'bar');

    auth.authenticate('foo', 'bar')
      .then(() => {
        const requestCall = requestSpy.calls.mostRecent();
        expect(requestCall.args).toEqual(['POST', '/token', expectedBody]);
        expect(updateSettingsSpy).toHaveBeenCalledWith({authorizationToken: 'token'});
        done();
      }, fail);
  });

  it('should return a rejected promise if the request went wrong', done => {
    requestSpy.and.returnValue(Promise.reject('418: I am a teapot'));

    auth.authenticate('foo', 'bar')
      .then(fail, done);
  });
});
