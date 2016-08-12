/* eslint-disable
  camelcase,
  new-cap
*/

/* global
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jasmine,
  spyOn,
  window,
  FormData
*/

require('jasmine-ajax');
const autobahn = require('autobahn');

const its = require('..');


describe('Secure GET test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', function() {
    var api = new its.Sdk();

    expect(function() {
      api._secureAjaxGet();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });

    api._secureAjaxGet();

    var request = jasmine.Ajax.requests.mostRecent();
    // That's the correct base64 representation of 'principal:secret'
    expect(request.requestHeaders).toEqual({
      Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
    });
  });
});

describe('Secure POST test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should throw error on required auth credentials', function() {
    var api = new its.Sdk();

    expect(function() {
      api._secureAjaxPost();
    }).toThrowError('Please set authPrincipal and authCredentials');
  });

  it('should correctly assemble the Authorization header', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authCredentials: 'secret'
    });

    api._secureAjaxPost();

    var request = jasmine.Ajax.requests.mostRecent();
    // That's the correct base64 representation of 'principal:secret'
    expect(request.requestHeaders).toEqual({
      Authorization: 'Basic cHJpbmNpcGFsOnNlY3JldA=='
    });
  });
});


describe('BasicAuth object test', function() {
  it('should require all required fields in constructor', function() {
    [0, 4, undefined, false, null].map(function(v) {
      expect(function() {
        new its.BasicAuth(v);
      }).toThrowError(
        'tenantId parameter of type "string" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.BasicAuth('tenantId', v);
      }).toThrowError(
        'principal parameter of type "string|null|undefined" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.BasicAuth('tenantId', 'principal', v);
      }).toThrowError(
        'credentials parameter of type "string|null|undefined" is required');
    });
  });

  it('should instantiate an BasicAuth with tenantId', function() {
    var o = new its.BasicAuth('tenantId');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBeUndefined();
    expect(o.credentials).toBeUndefined();
  });

  it('should instantiate a full BasicAuth', function() {
    var o = new its.BasicAuth('tenantId', 'principal', 'creds');
    expect(o).toBeDefined();
    expect(o.tenantId).toBe('tenantId');
    expect(o.principal).toBe('principal');
    expect(o.credentials).toBe('creds');
  });
});

describe('BasicAuth API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new BasicAuth through API', function() {
    var basicauth = new its.BasicAuth('4', 'principal');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createBasicAuth(basicauth, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/basicauths';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {tenantId: '4', principal: 'principal'};
    expect(request.data()).toEqual(expected);

    var content = {
      tenantId: '4',
      principal: 'principal',
      credentials: 'secret'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).toHaveBeenCalledWith(basicauth);
    expect(basicauth.tenantId).toBe('4');
    expect(basicauth.principal).toBe('principal');
    expect(basicauth.credentials).toBe('secret');
  });

  it('should handle errors while creating a new basicauth', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var basicauth = new its.BasicAuth('4', 'principal');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createBasicAuth(basicauth, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/basicauths';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {tenantId: '4', principal: 'principal'};
    expect(request.data()).toEqual(expected);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'BasicAuth',
          field: 'credentials',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{
      resource: 'BasicAuth',
      field: 'credentials',
      code: 'missing'
    }];
    expect(ecb).toHaveBeenCalledWith(errors, basicauth);
    expect(output).toBeUndefined();
  });
});


describe('Organisation object test', function() {
  it('should instantiate an Organisation without id', function() {
    var o = new its.Organisation();
    expect(o).toBeDefined();
    expect(o.id).toBeUndefined();
    expect(o.name).toBeUndefined();
  });

  it('should instantiate an Organisation with id and metadata', function() {
    var o = new its.Organisation('test', 'School of silly walks');
    expect(o).toBeDefined();
    expect(o.id).toBe('test');
    expect(o.name).toBe('School of silly walks');
  });
});

describe('Organisation API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new organisation through API', function() {
    var organisation = new its.Organisation('1', 'School of silly walks');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createOrganisation(organisation, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1', name: 'School of silly walks'};
    expect(request.data()).toEqual(expected);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    expect(cb).toHaveBeenCalledWith(organisation);
    expect(organisation.id).toBe('1');
    expect(organisation.created).toEqual(new Date(stringDate));
    expect(organisation.updated).toEqual(new Date(stringDate));
    expect(organisation.name).toBe('School of silly walks');
  });

  it('should handle errors while creating a new organisation', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var organisation = new its.Organisation('1');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createOrganisation(organisation, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1'};
    expect(request.data()).toEqual(expected);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'Organisation',
          field: 'name',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{
      resource: 'Organisation',
      field: 'name',
      code: 'missing'
    }];
    expect(ecb).toHaveBeenCalledWith(errors, organisation);
    expect(output).toBeUndefined();
  });

  it('should get an existing organisation through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getOrganisation('4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var organisation = new its.Organisation('4', 'School of silly walks');
    organisation.created = new Date(stringDate);
    organisation.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(organisation);
  });

  it('should get a list of existing organisations through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listOrganisations(cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      name: 'School of silly walks'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var organisation = new its.Organisation('4', 'School of silly walks');
    organisation.created = new Date(stringDate);
    organisation.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith([organisation]);
  });
});


describe('Student object test', function() {
  it('should instantiate a Student without id', function() {
    var s = new its.Student();
    expect(s).toBeDefined();
    expect(s.id).toBeUndefined();
    expect(s.organisationId).toBeUndefined();
    expect(s.firstName).toBeUndefined();
    expect(s.lastName).toBeUndefined();
    expect(s.gender).toBeUndefined();
    expect(s.birthYear).toBeUndefined();
  });

  it('should instantiate a Student with id and metadata', function() {
    var s = new its.Student('fb', 'test', 'Mark', 'Zuckerberg', 'male', 1984);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.firstName).toBe('Mark');
    expect(s.lastName).toBe('Zuckerberg');
    expect(s.gender).toBe('male');
    expect(s.birthYear).toBe(1984);
  });
});

describe('Student API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new student through API', function() {
    var student = new its.Student('fb', '1', 'Mark');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createStudent(student, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1',
                    organisationId: 'fb',
                    firstName: 'Mark'};
    expect(request.data()).toEqual(expected);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    expect(cb).toHaveBeenCalledWith(student);
    expect(student.id).toBe('1');
    expect(student.created).toEqual(new Date(stringDate));
    expect(student.updated).toEqual(new Date(stringDate));
    expect(student.firstName).toBe('Mark');
  });

  it('should handle errors while creating a new student', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var student = new its.Student('fb', '1', 'Mark');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createStudent(student, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    var expected = {id: '1',
                    organisationId: 'fb',
                    firstName: 'Mark'};
    expect(request.data()).toEqual(expected);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'Student',
          field: 'lastName',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{
      resource: 'Student',
      field: 'lastName',
      code: 'missing'
    }];
    expect(ecb).toHaveBeenCalledWith(errors, student);
    expect(output).toBeUndefined();
  });

  it('should get an existing student through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getStudent('fb', '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/students/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '4', 'Mark');
    student.created = new Date(stringDate);
    student.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(student);
  });

  it('should get a list of existing students through API', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listStudents('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '4', 'Mark');
    student.created = new Date(stringDate);
    student.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith([student]);
  });
});


describe('SpeechChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new its.SpeechChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(function() {
      new its.SpeechChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new its.SpeechChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });
  it('should instantiate a SpeechChallenge with referenceAudio', function() {
    var blob = new Blob(['1234567890']);

    var s = new its.SpeechChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
  it('should instantiate a SpeechChallenge', function() {
    var s = new its.SpeechChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.topic).toBe('hi');
    expect(s.referenceAudio).toBe(null);
  });
});

describe('SpeechChallenge API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new challenge', function() {
    var challenge = new its.SpeechChallenge('fb', '1', 'Hi');
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createSpeechChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(2);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new its.SpeechChallenge('fb', '1', 'Hi');
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });
  it('should create a new challenge with referenceAudio', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '1', 'Hi', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createSpeechChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
                '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi',
      referenceAudioUrl: referenceAudioUrl
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new its.SpeechChallenge('fb', '1', 'Hi', blob);
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    outChallenge.referenceAudio = challenge.referenceAudio;
    outChallenge.referenceAudioUrl = referenceAudioUrl;
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var challenge = new its.SpeechChallenge('fb', '1', 'Hi');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createSpeechChallenge(challenge, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('topic', 'Hi');
    expect(FormData.prototype.append.calls.count()).toEqual(2);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'SpeechChallenge',
          field: 'topic',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'SpeechChallenge',
            field: 'topic',
            code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing speech challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getSpeechChallenge('fb', '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/speech/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.SpeechChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listSpeechChallenges('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      topic: 'Hi'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.SpeechChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    expect(cb).toHaveBeenCalledWith([challenge]);
  });
});


describe('SpeechRecording object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new its.SpeechRecording();
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');
    expect(function() {
      new its.SpeechRecording(1);
    }).toThrowError(
      'challenge parameter of type "SpeechChallenge" is required');

    var challenge = new its.SpeechChallenge('fb');
    expect(function() {
      new its.SpeechRecording(challenge);
    }).toThrowError(
      'student parameter of type "Student" is required');
    expect(function() {
      new its.SpeechRecording(challenge, 1);
    }).toThrowError(
      'student parameter of type "Student" is required');

    var student = new its.Student('org');
    expect(function() {
      new its.SpeechRecording(challenge, student, 1);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new its.SpeechRecording(challenge, student, '1', 'foo');
    }).toThrowError('audio parameter of type "Blob|null" is required');
  });
  it('should instantiate a SpeechRecording', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb');
    var student = new its.Student('org');

    // Without audio
    var s = new its.SpeechRecording(challenge, student, null);
    expect(s).toBeDefined();
    expect(s.id).toBeNull();
    expect(s.audio).toBeUndefined();
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // Without id
    s = new its.SpeechRecording(challenge, student, null, blob);
    expect(s).toBeDefined();
    expect(s.id).toBe(null);
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);

    // With id
    s = new its.SpeechRecording(challenge, student, 'test', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.audio).toBe(blob);
    expect(s.challenge).toBe(challenge);
    expect(s.student).toBe(student);
  });
});


describe('SpeechRecording API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should get an existing speech recording', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.getSpeechRecording(challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings/5';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '5');
    var stringDate = '2014-12-31T23:59:59Z';
    recording.created = new Date(stringDate);
    recording.updated = new Date(stringDate);
    recording.audio = null;
    recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    expect(cb).toHaveBeenCalledWith(recording);
  });

  it('should get a list of existing speech recordings', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.listSpeechRecordings(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb/challenges/speech' +
      '/4/recordings';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '5');
    var stringDate = '2014-12-31T23:59:59Z';
    recording.created = new Date(stringDate);
    recording.updated = new Date(stringDate);
    recording.audio = null;
    recording.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    expect(cb).toHaveBeenCalledWith([recording]);
  });
});


describe('Speech Recording Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function() {
    var api = new its.Sdk();

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

    // Save WebSocket
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recorder = new RecorderMock();
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    expect(function() {
      api.startStreamingSpeechRecording(
        challenge, student, recorder, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');

    // Restore WebSocket
    window.WebSocket = old;
  });

  it('should start streaming a new speech recording', function() {
    var api = new its.Sdk({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar'
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
          }
        };
      };
      this.isRecording = function() {
        return false;
      };
      this.addEventListener = function() {};
    }

    var challenge = new its.SpeechChallenge('fb', '4');
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }
    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    var output = api.startStreamingSpeechRecording(
      challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.recording.init_recording', []);
    expect(output).toBeUndefined();
  });
});


describe('PronunciationChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    expect(function() {
      new its.PronunciationChallenge(4);
    }).toThrowError(
      'organisationId parameter of type "string|null" is required');

    expect(function() {
      new its.PronunciationChallenge(null, 4);
    }).toThrowError('id parameter of type "string|null" is required');

    expect(function() {
      new its.PronunciationChallenge('fb', null, 'hi', '1');
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });
  it('should instantiate a PronunciationChallenge ' +
      'without referenceAudio', function() {
    var s = new its.PronunciationChallenge('fb', 'test', 'hi');
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBeUndefined();
  });
  it('should instantiate a PronunciationChallenge', function() {
    var blob = new Blob(['1234567890']);

    var s = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.transcription).toBe('hi');
    expect(s.referenceAudio).toBe(blob);
  });
});


describe('PronunciationChallenge API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should check for required referenceAudio field', function() {
    // Because referenceAudio is not available when fetching existing
    // PronunciationChallenges from the server, the domain model doesn't
    // require the field, but the createPronunciationChallenge() should.
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.PronunciationChallenge('fb', '1', 'test');
    expect(function() {
      api.createPronunciationChallenge(challenge, cb);
    }).toThrowError('referenceAudio parameter of type "Blob" is required');

    challenge = new its.PronunciationChallenge('fb', '1', 'test', null);
    expect(function() {
      api.createPronunciationChallenge(challenge, cb);
    }).toThrowError('referenceAudio parameter of type "Blob" is required');
  });

  it('should create a new pronunciation challenge through API', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', '1', 'test', blob);
    var cb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createPronunciationChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'transcription', 'test');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
                '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'test',
      referenceAudioUrl: referenceAudioUrl,
      status: 'preparing'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 202,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outChallenge = new its.PronunciationChallenge('fb', '1', 'test', blob);
    outChallenge.created = new Date(stringDate);
    outChallenge.updated = new Date(stringDate);
    outChallenge.referenceAudio = challenge.referenceAudio;
    outChallenge.referenceAudioUrl = referenceAudioUrl;
    outChallenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(outChallenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createPronunciationChallenge(challenge, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', 'test');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'transcription', 'hi');
    expect(FormData.prototype.append).toHaveBeenCalledWith(
      'referenceAudio', blob);
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'transcription',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'PronunciationChallenge',
            field: 'transcription',
            code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing pronunciation challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getPronunciationChallenge('fb', '4', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
                '/YsjdG37bUGseu8-bsJ';
    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl: referenceAudioUrl,
      status: 'prepared'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.referenceAudioUrl = referenceAudioUrl;
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listPronunciationChallenges('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var referenceAudioUrl = 'https://api.itslanguage.nl/download' +
                '/YsjdG37bUGseu8-bsJ';
    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      transcription: 'Hi',
      referenceAudioUrl: referenceAudioUrl,
      status: 'prepared'
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.PronunciationChallenge('fb', '4', 'Hi');
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.referenceAudioUrl = referenceAudioUrl;
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith([challenge]);
  });

  it('should delete a an existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);

    var output = api.deletePronunciationChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';
    expect(request.url).toBe(url);
    expect(request.method).toBe('DELETE');

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 204,
      contentType: 'application/json'
    });

    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should not delete a non existing challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var blob = new Blob(['1234567890']);
    var challenge = new its.PronunciationChallenge('fb', 'test', 'hi', blob);

    var output = api.deletePronunciationChallenge(challenge, cb, ecb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/test';
    expect(request.url).toBe(url);
    expect(request.method).toBe('DELETE');

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationChallenge',
          field: 'id',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'PronunciationChallenge',
            field: 'id',
            code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });
});

/*
Non streaming, move to streaming
describe('PronunciationAnalyses API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new pronunciation analysis', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '1', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.createPronunciationAnalysis(recording, false, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
    expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
    expect(FormData.prototype.append.calls.count()).toEqual(4);

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '34',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24',
      score: 7.5,
      words: [
        [
          {
            graphemes: 'B',
            score: 0.9,
            verdict: 'good'
          },
          {
            graphemes: 'o',
            score: 0.4,
            verdict: 'bad'
          },
          {
            graphemes: 'b',
            score: 0.6,
            verdict: 'moderate'
          },
          {
            graphemes: '\''
          },
          {
            graphemes: 's',
            score: 0.6,
            verdict: 'moderate'
          }
        ],
        [
          {
            graphemes: 'y',
            score: 0.9,
            verdict: 'good'
          },
          {
            graphemes: 'ou',
            score: 0.4,
            verdict: 'bad'
          },
          {
            graphemes: 'r',
            score: 0.6,
            verdict: 'moderate'
          }
        ]
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });
    var chunk = [
      new its.WordChunk('B', 0.9, 'good', []),
      new its.WordChunk('o', 0.4, 'bad', []),
      new its.WordChunk('b', 0.6, 'moderate', []),
      new its.WordChunk('\''),
      new its.WordChunk('s', 0.6, 'moderate', [])
    ];
    var chunk2 = [
      new its.WordChunk('y', 0.9, 'good', []),
      new its.WordChunk('ou', 0.4, 'bad', []),
      new its.WordChunk('r', 0.6, 'moderate', []),
    ];
    var word = new its.Word(chunk);
    var word2 = new its.Word(chunk2);
    var words = [word, word2];

    var stringDate = '2014-12-31T23:59:59Z';
    var analysis = new its.PronunciationAnalysis(
      '4', '24', '34', new Date(stringDate), new Date(stringDate), audioUrl);
    analysis.audio = recording.audio;
    analysis.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    analysis.score = 7.5;
    analysis.words = words;
    expect(cb).toHaveBeenCalledWith(analysis);
  });

  it('should handle alignment failure', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '1', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
    expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
    expect(FormData.prototype.append.calls.count()).toEqual(4);

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '34',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var outRecording = new its.SpeechRecording(challenge, student, '1', blob);
    outRecording.created = new Date(stringDate);
    outRecording.updated = new Date(stringDate);
    outRecording.audio = recording.audio;
    outRecording.audioUrl = audioUrl;
    outRecording.audioUrl += '?access_token=cHJpbmNpcGFsOm51bGw%3D';
    var errors = {status: 422};
    expect(ecb).toHaveBeenCalledWith(errors, outRecording);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should handle a locked challenge', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '1', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
    expect(output).toBeUndefined();

    var content = {};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 423,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var errors = {status: 423};
    expect(ecb).toHaveBeenCalledWith(errors, recording);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should handle an unprepared challenge', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '1', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
    expect(output).toBeUndefined();

    var content = {};
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 523,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var errors = {status: 523};
    expect(ecb).toHaveBeenCalledWith(errors, recording);
    expect(cb).not.toHaveBeenCalled();
  });

  it('should handle errors creating a pronunciation analysis', function() {
    var blob = new Blob(['1234567890']);
    var challenge = new its.SpeechChallenge('fb', '4');
    var student = new its.Student('fb', '6');
    var recording = new its.SpeechRecording(challenge, student, '1', blob);
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
    expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
    expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
    expect(FormData.prototype.append.calls.count()).toEqual(4);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'PronunciationAnalysis',
          field: 'studentId',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'PronunciationAnalysis',
            field: 'studentId',
            code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, recording);
    expect(output).toBeUndefined();
  });

  it('should get an existing pronunciation analysis', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.getPronunciationAnalysis(challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses/5';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '6');
    var analysis = new its.PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;
    expect(cb).toHaveBeenCalledWith(analysis);
  });

  it('should get a list of existing pronunciation analyses', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.listPronunciationAnalyses(challenge, false, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24',
      score: 7.5,
      words: [
        [
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
      ]
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '6');
    var analysis = new its.PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;

    var student2 = new its.Student('fb', '24');
    var analysis2 = new its.PronunciationAnalysis(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    analysis2.audioUrl = audioUrl;
    analysis2.score = 7.5;
    var chunk = [
      new its.WordChunk('b', 0.9, 'good', []),
      new its.WordChunk('o', 0.4, 'bad', []),
      new its.WordChunk('x', 0.5, 'moderate', []),
    ];
    var word = new its.Word(chunk);
    var words = [word];
    analysis2.words = words;
    expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
  });

  it('should get a detailed list of pronunciation analyses', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.listPronunciationAnalyses(challenge, true, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses?detailed=true';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24',
      score: 7.5,
      words: [
        [
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
      ]
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '6');
    var analysis = new its.PronunciationAnalysis(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    analysis.audioUrl = audioUrl;

    var student2 = new its.Student('fb', '24');
    var analysis2 = new its.PronunciationAnalysis(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    analysis2.audioUrl = audioUrl;
    analysis2.score = 7.5;
    var phoneme1 = new its.Phoneme('b', 0.9, 'good');
    phoneme1.start = 0.11;
    phoneme1.end = 0.22;
    var phonemes1 = [phoneme1];
    var phonemes2 = [
      new its.Phoneme('\u0251', 0.4, 'bad')
    ];
    var phonemes3 = [
      new its.Phoneme('k', 0.4, 'bad'),
      new its.Phoneme('s', 0.6, 'moderate')
    ];
    var chunk = [
      new its.WordChunk('b', 0.9, 'good', phonemes1),
      new its.WordChunk('o', 0.4, 'bad', phonemes2),
      new its.WordChunk('x', 0.5, 'moderate', phonemes3),
    ];
    var word = new its.Word(chunk);
    var words = [word];
    analysis2.words = words;
    expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
  });
});
*/

/*
describe('SDK is created without WebSocket browser support', function() {
  beforeEach(function() {
    // Browser has no support for WebSocket
    spyOn(window, 'WebSocket').and.returnValue(undefined);
  });

  it('should fail when no WebSocket object exists', function() {
    expect(function() {
      its.Sdk();
    }).toThrowError('No WebSocket capabilities');
  });
});
*/


describe('Pronunciation Analyisis Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function() {
    var api = new its.Sdk();

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

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    expect(function() {
      api.startStreamingPronunciationAnalysis(
        challenge, recorder, prepareCb, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');
  });

  it('should start streaming a new pronunciation analysis', function() {
    var api = new its.Sdk({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar'
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
          }
        };
      };
      this.isRecording = function() {
        return false;
      };
      this.addEventListener = function() {};
    }

    var challenge = new its.PronunciationChallenge('fb', '4', 'foo');
    var recorder = new RecorderMock();
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    var prepareCb = jasmine.createSpy('callback');

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }
    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    var output = api.startStreamingPronunciationAnalysis(
      challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.pronunciation.init_analysis', [],
        {trimStart: 0.15, trimEnd: 0.0});
    expect(output).toBeUndefined();
  });
});


describe('ChoiceChallenge object test', function() {
  it('should require all required fields in constructor', function() {
    [0, 4, undefined, false, null].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge(v);
      }).toThrowError(
        'organisationId parameter of type "string" is required');
    });

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', v);
      }).toThrowError(
        'id parameter of type "string|null|undefined" is required');
    });
    expect(function() {
      new its.ChoiceChallenge('org', '');
    }).toThrowError(
      'id parameter should not be an empty string');

    [0, 4, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', null, v);
      }).toThrowError(
        'question parameter of type "string|null|undefined" is required');
    });

    [0, 4, undefined, false].map(function(v) {
      expect(function() {
        new its.ChoiceChallenge('org', null, 'question', v);
      }).toThrowError('choices parameter of type "Array" is required');
    });
  });
  it('should instantiate a ChoiceChallenge', function() {
    var s = new its.ChoiceChallenge('fb', 'test', 'q', ['a', 'a2']);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.question).toBe('q');
    expect(s.choices).toEqual(['a', 'a2']);
  });
});


describe('ChoiceChallenge API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();

    // XXX: jasmine-ajax doesn't support asserting FormData yet.
    // Workaround by attaching a spy while appending to FormData.
    // https://github.com/pivotal/jasmine-ajax/issues/51
    spyOn(FormData.prototype, 'append');
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should create a new choice challenge through API', function() {
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a', 'b']);
    var cb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createChoiceChallenge(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'b');
    expect(FormData.prototype.append.calls.count()).toEqual(4);

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'preparing',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 201,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should handle errors while creating a new challenge', function() {
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var output = api.createChoiceChallenge(challenge, cb, ecb);

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('POST');
    expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
    expect(FormData.prototype.append).toHaveBeenCalledWith('question', 'q');
    expect(FormData.prototype.append).toHaveBeenCalledWith('choices', 'a');
    expect(FormData.prototype.append.calls.count()).toEqual(3);

    var content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'ChoiceChallenge',
          field: 'question',
          code: 'missing'
        }
      ]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 422,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    expect(cb).not.toHaveBeenCalled();
    var errors = [{resource: 'ChoiceChallenge',
            field: 'question',
            code: 'missing'}];
    expect(ecb).toHaveBeenCalledWith(errors, challenge);
    expect(output).toBeUndefined();
  });

  it('should get an existing choice challenge', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.getChoiceChallenge('fb', '1', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/1';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'preparing',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }]
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '1', 'q', ['a']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'preparing';
    expect(cb).toHaveBeenCalledWith(challenge);
  });

  it('should get a list of existing challenges', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var output = api.listChoiceChallenges('fb', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      question: 'q',
      status: 'prepared',
      choices: [{
        choice: 'a',
        audioUrl: ''
      }, {
        choice: 'a2',
        audioUrl: ''
      }]
    }];
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var challenge = new its.ChoiceChallenge('fb', '4', 'q', ['a', 'a2']);
    challenge.created = new Date(stringDate);
    challenge.updated = new Date(stringDate);
    challenge.status = 'prepared';
    expect(cb).toHaveBeenCalledWith([challenge]);
  });
});


describe('ChoiceRecognition Websocket API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fail streaming when websocket connection is closed', function() {
    var api = new its.Sdk();

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

    // Save WebSocket
    var old = window.WebSocket;
    window.WebSocket = jasmine.createSpy('WebSocket');

    var challenge = new its.ChoiceChallenge('fb', '4', null, []);
    var recorder = new RecorderMock();
    var preparedcb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');
    expect(function() {
      api.startStreamingChoiceRecognition(
        challenge, recorder, preparedcb, cb, ecb);
    }).toThrowError('WebSocket connection was not open.');

    // Restore WebSocket
    window.WebSocket = old;
  });

  it('should start streaming a new choice recognition', function() {
    var api = new its.Sdk({
      wsToken: 'foo',
      wsUrl: 'ws://foo.bar'
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
          }
        };
      };
      this.isRecording = function() {
        return false;
      };
      this.addEventListener = function() {};
    }

    var challenge = new its.ChoiceChallenge('fb', '4', null, []);
    var recorder = new RecorderMock();
    var prepareCb = jasmine.createSpy('callback');
    var cb = jasmine.createSpy('callback');
    var ecb = jasmine.createSpy('callback');

    function SessionMock() {
      this.call = function() {
        var d = autobahn.when.defer();
        return d.promise;
      };
    }
    api._session = new SessionMock();
    spyOn(api._session, 'call').and.callThrough();

    var output = api.startStreamingChoiceRecognition(
      challenge, recorder, prepareCb, cb, ecb);

    expect(api._session.call).toHaveBeenCalled();
    expect(api._session.call).toHaveBeenCalledWith(
      'nl.itslanguage.choice.init_recognition', [],
        {trimStart: 0.15, trimEnd: 0});
    expect(output).toBeUndefined();
  });

  it('should get an existing choice recognition', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.getChoiceRecognition(challenge, '5', cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions/5';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = {
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    };
    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '6');
    var recognition = new its.ChoiceRecognition(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    recognition.audioUrl = audioUrl;
    expect(cb).toHaveBeenCalledWith(recognition);
  });

  it('should get a list of existing choice recognitions', function() {
    var api = new its.Sdk({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var cb = jasmine.createSpy('callback');

    var challenge = new its.SpeechChallenge('fb', '4');
    var output = api.listChoiceRecognitions(challenge, cb);
    expect(output).toBeUndefined();

    var request = jasmine.Ajax.requests.mostRecent();
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/choice/4/recognitions';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
    var content = [{
      id: '5',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '6'
    }, {
      id: '6',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      audioUrl: audioUrl,
      studentId: '24',
      recognised: 'Hi'
    }];

    jasmine.Ajax.requests.mostRecent().respondWith({
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify(content)
    });

    var stringDate = '2014-12-31T23:59:59Z';
    var student = new its.Student('fb', '6');
    var recognition = new its.ChoiceRecognition(challenge, student,
      '5', new Date(stringDate), new Date(stringDate));
    recognition.audioUrl = audioUrl;

    var student2 = new its.Student('fb', '24');
    var recognition2 = new its.ChoiceRecognition(challenge, student2,
      '6', new Date(stringDate), new Date(stringDate));
    recognition2.audioUrl = audioUrl;
    recognition2.recognised = 'Hi';
    expect(cb).toHaveBeenCalledWith([recognition, recognition2]);
  });
});
