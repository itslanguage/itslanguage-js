require('jasmine-ajax');
const Student = require('../administrative-sdk/student/student');
const StudentController = require('../administrative-sdk/student/student-controller');
const Connection = require('../administrative-sdk/connection/connection-controller');

describe('Student object test', () => {
  it('should instantiate a Student without id', () => {
    const s = new Student();
    expect(s).toBeDefined();
    expect(s.id).toBeUndefined();
    expect(s.organisationId).toBeUndefined();
    expect(s.firstName).toBeUndefined();
    expect(s.lastName).toBeUndefined();
    expect(s.gender).toBeUndefined();
    expect(s.birthYear).toBeUndefined();
  });

  it('should instantiate a Student with id and metadata', () => {
    const s = new Student('fb', 'test', 'Mark', 'Zuckerberg', 'male', 1984);
    expect(s).toBeDefined();
    expect(s.id).toBe('test');
    expect(s.organisationId).toBe('fb');
    expect(s.firstName).toBe('Mark');
    expect(s.lastName).toBe('Zuckerberg');
    expect(s.gender).toBe('male');
    expect(s.birthYear).toBe(1984);
  });
});

describe('Student API interaction test', () => {
  beforeEach(() => {
    jasmine.Ajax.install();
  });

  afterEach(() => {
    jasmine.Ajax.uninstall();
  });

  it('should create a new student through API', done => {
    const student = new Student('fb', '1', 'Mark');
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const controller = new StudentController(api);
    const url = 'https://api.itslanguage.nl/organisations/fb/students';
    const content = {
      id: '1',
      organisationId: 'fb',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 201,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createStudent(student)
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        const expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark'
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        const stringDate = '2014-12-31T23:59:59Z';
        student.created = new Date(stringDate);
        student.updated = new Date(stringDate);
        expect(result).toEqual(student);
        expect(result.id).toBe('1');
        expect(result.created).toEqual(new Date(stringDate));
        expect(result.updated).toEqual(new Date(stringDate));
        expect(result.firstName).toBe('Mark');
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should handle errors while creating a new student', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const controller = new StudentController(api);
    const student = new Student('fb', '1', 'Mark');
    const url = 'https://api.itslanguage.nl/organisations/fb/students';
    const content = {
      message: 'Validation failed',
      errors: [
        {
          resource: 'Student',
          field: 'lastName',
          code: 'missing'
        }
      ]
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 422,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.createStudent(student)
      .then(() => {
        fail('An error should be thrown!');
      })
      .catch(error => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('POST');
        const expected = {
          id: '1',
          organisationId: 'fb',
          firstName: 'Mark'
        };
        expect(request[1].body).toEqual(JSON.stringify(expected));
        const errors = [{
          resource: 'Student',
          field: 'lastName',
          code: 'missing'
        }];
        expect(error.errors).toEqual(errors);
      })
      .then(done);
  });

  it('should get an existing student through API', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/students/4';
    const content = {
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    };
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    const controller = new StudentController(api);
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    controller.getStudent('fb', '4')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const student = new Student('fb', '4', 'Mark');
        student.created = new Date(stringDate);
        student.updated = new Date(stringDate);
        expect(result).toEqual(student);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });

  it('should get a list of existing students through API', done => {
    const api = new Connection({
      authPrincipal: 'principal',
      authPassword: 'secret'
    });
    const url = 'https://api.itslanguage.nl/organisations/fb/students';
    const content = [{
      id: '4',
      created: '2014-12-31T23:59:59Z',
      updated: '2014-12-31T23:59:59Z',
      firstName: 'Mark'
    }];
    const fakeResponse = new Response(JSON.stringify(content), {
      status: 200,
      header: {
        'Content-type': 'application/json'
      }
    });
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(fakeResponse));
    const controller = new StudentController(api);
    controller.listStudents('fb')
      .then(result => {
        const request = window.fetch.calls.mostRecent().args;
        expect(request[0]).toBe(url);
        expect(request[1].method).toBe('GET');
        const stringDate = '2014-12-31T23:59:59Z';
        const student = new Student('fb', '4', 'Mark');
        student.created = new Date(stringDate);
        student.updated = new Date(stringDate);
        expect(result[0]).toEqual(student);
        expect(result.length).toBe(1);
      })
      .catch(error => {
        fail('No error should be thrown: ' + error);
      })
      .then(done);
  });
});
