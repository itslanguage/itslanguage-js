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
 window,
 FormData
 */

require('jasmine-ajax');

const its = require('../../');

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
