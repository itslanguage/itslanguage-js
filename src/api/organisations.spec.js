/**
 * The unittests for the exported functions from `organisations.js`.
 */

import * as communication from './communication';
import * as organisations from './organisations';


describe('createOrganisation', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

    organisations.createOrganisation({name: 'poes'})
      .then(() => {
        const createRequest = authorisedRequestSpy.calls.mostRecent();
        expect(createRequest.args).toEqual(['POST', '/organisations', {name: 'poes'}]);
        done();
      }, fail);
  });
});


describe('getOrganisationByID', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve({id: 'c4t'}));

    organisations.getOrganisationByID('c4t')
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/organisations/c4t']);
        done();
      }, fail);
  });
});


describe('getAllOrganisations', () => {
  it('should make an authorised request', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

    organisations.getAllOrganisations()
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/organisations']);
        done();
      }, fail);
  });

  it('should allow filters if they are a URLSearchParams object', done => {
    const authorisedRequestSpy = spyOn(communication, 'authorisedRequest');
    authorisedRequestSpy.and.returnValue(Promise.resolve([{id: 'c4t'}]));

    const filters = new URLSearchParams();
    filters.set('parent', 'd4ddyc4t');

    organisations.getAllOrganisations(filters)
      .then(() => {
        const getRequest = authorisedRequestSpy.calls.mostRecent();
        expect(getRequest.args).toEqual(['GET', '/organisations?parent=d4ddyc4t']);
        done();
      }, fail);
  });

  it('should reject when something other than URLSearchParams is given as the filters', done => {
    organisations.getAllOrganisations('this is not an instance of URLSearchParams')
      .then(fail, done);
  });
});
