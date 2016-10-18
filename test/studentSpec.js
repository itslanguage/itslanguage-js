require('jasmine-ajax');
const Student = require('../administrative-sdk/student').Student;
const Connection = require('../administrative-sdk/connection').Connection;

describe('Student object test', function() {
  it('should instantiate a Student without id', function() {
    var s = new Student();
    expect(s).toBeDefined();
    expect(s.id).toBeUndefined();
    expect(s.organisationId).toBeUndefined();
    expect(s.firstName).toBeUndefined();
    expect(s.lastName).toBeUndefined();
    expect(s.gender).toBeUndefined();
    expect(s.birthYear).toBeUndefined();
  });

  it('should instantiate a Student with id and metadata', function() {
    var s = new Student('fb', 'test', 'Mark', 'Zuckerberg', 'male', 1984);
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

  it('should create a new student through API', function(done) {
    var student = new Student('fb', '1', 'Mark');
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
    var content = {
      id: '1',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    student.createStudent(api)
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        var expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark'
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        var stringDate = '2014-12-31T23:59:59Z';
        expect(result).toEqual(student);
        expect(result.id).toBe('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
        expect(result.firstName).toBe('Mark');
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new student', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var student = new Student('fb', '1', 'Mark');
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
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
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    student.createStudent(api)
      .then(function() {
        fail('An error should be thrown!');
      })
      .catch(function(error) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        var expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark'
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        var errors = [{
          resource: 'Student',
          field: 'lastName',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing student through API', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/students/4';
    var content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    Student.getStudent(api, 'fb', '4')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new Student('fb', '4', 'Mark');
        student.created = new Date(stringDate);
        student.updated = new Date(stringDate);
        expect(result).toEqual(student);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing students through API', function(done) {
    var api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    var url = 'https://api.itslanguage.nl/organisations/fb/students';
    var content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    }];
    var fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    Student.listStudents(api, 'fb')
      .then(function(result) {
        var request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        var stringDate = '2014-12-31T23:59:59Z';
        var student = new Student('fb', '4', 'Mark');
        student.created = new Date(stringDate);
        student.updated = new Date(stringDate);
        expect(result[0]).toEqual(student);
        expect(result.length).toBe(1);
      })
      .catch(function(error) {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
