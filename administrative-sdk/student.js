/* eslint-disable
 callback-return,
 camelcase,
 func-style,
 handle-callback-err,
 max-len,
 no-unused-vars
 */
'use strict';

/**
 * @class Student
 *
 * @member {string} organisationId The organisation identifier this student is a member of.
 * @member {string} [id] The student identifier. If none is given, one is generated.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {string} [firstName] First name of the student.
 * @member {string} [lastName] Last name of the student.
 * @member {string} [gender] Gender of the student (either `male` or `female`).
 * @member {number} [birthYear] Birth year of the student.
 */
class Student {
  /**
   * Create a speech challenge domain model.
   *
   * @constructor
   * @param {string} organisationId The organisation identifier this student is a member of.
   * @param {string} [id] The student identifier. If none is given, one is generated.
   * @param {string} [firstName] First name of the student.
   * @param {string} [lastName] Last name of the student.
   * @param {string} [gender] Gender of the student (either `male` or `female`).
   * @param {number} [birthYear] Birth year of the student.
   */
  constructor(organisationId, id, firstName, lastName, gender, birthYear, connection) {
    if (id && typeof id !== 'string') {
      throw new Error(
        'id parameter of type "string|null" is required');
    }
    this.id = id;
    if (organisationId && typeof organisationId !== 'string') {
      throw new Error(
        'organisationId parameter of type "string|null" is required');
    }
    this.organisationId = organisationId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.birthYear = birthYear;
    this.connection = connection;
  }

  /**
   * Callback used by createStudent.
   *
   * @callback Sdk~studentCreatedCallback
   * @param {its.Student} student Updated student domain model instance.
   */
  studentCreatedCallback(student) {}

  /**
   * Error callback used by createStudent.
   *
   * @callback Sdk~studentCreatedErrorCallback
   * @param {object[]} errors Array of errors.
   * @param {its.Student} student Student domain model instance with unapplied changes.
   */
  studentCreatedErrorCallback(errors, student) {}

  /**
   * Create a student.
   *
   * @param {its.Student} student A student domain model instance.
   * @param {Sdk~studentCreatedCallback} [cb] The callback that handles the response.
   * @param {Sdk~studentCreatedErrorCallback} [ecb] The callback that handles the error response.
   */
  createStudent(cb, ecb) {
    var self = this;
    var _cb = function(data) {
      // Update the id in case domain model didn't contain one.
      self.id = data.id;
      self.created = new Date(data.created);
      self.updated = new Date(data.updated);
      if (cb) {
        cb(self);
      }
    };

    var _ecb = function(errors) {
      if (ecb) {
        ecb(errors, self);
      }
    };

    if (!this.organisationId) {
      throw new Error('organisationId field is required');
    }

    var url = this.connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/students';
    var fd = JSON.stringify(this);
    this.connection._secureAjaxPost(url, fd, _cb, _ecb);
  }

  /**
   * Callback used by getStudent.
   *
   * @callback Sdk~studentGetCallback
   * @param {its.Student} student Retrieved student domain model instance.
   */
  studentGetCallback(student) {}

  /**
   * Error callback used by getStudent.
   *
   * @callback Sdk~studentGetErrorCallback
   * @param {object[]} errors Array of errors.
   */
  studentGetErrorCallback(errors) {}

  /**
   * Get a student.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} studentId Specify a student identifier.
   * @param {Sdk~getCallback} [cb] The callback that handles the response.
   * @param {Sdk~getErrorCallback} [ecb] The callback that handles the error response.
   */
  getStudent(organisationId, studentId, cb, ecb) {
    var _cb = function(data) {
      var student = new Student(organisationId, data.id, data.firstName,
        data.lastName, data.gender, data.birthYear);
      student.created = new Date(data.created);
      student.updated = new Date(data.updated);
      if (cb) {
        cb(student);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    this.connection._secureAjaxGet(url, _cb, ecb);
  }

  /**
   * Callback used by listStudents.
   *
   * @callback Sdk~listCallback
   * @param {its.Student[]} student Retrieved student domain model instances.
   */
  studentListCallback(student) {}

  /**
   * Error callback used by listStudents.
   *
   * @callback Sdk~listErrorCallback
   * @param {object[]} errors Array of errors.
   */
  studentListErrorCallback(errors) {}

  /**
   * List all students in the organisation.
   *
   * @param {string} organisationId Specify an organisation identifier.
   * @param {Sdk~listCallback} cb The callback that handles the response.
   * @param {Sdk~listErrorCallback} [ecb] The callback that handles the error response.
   */
  listStudents(organisationId, cb, ecb) {
    var _cb = function(data) {
      var students = [];
      data.forEach(function(datum) {
        var student = new Student(organisationId, datum.id,
          datum.firstName, datum.lastName, datum.gender, datum.birthYear);
        student.created = new Date(datum.created);
        student.updated = new Date(datum.updated);
        students.push(student);
      });
      if (cb) {
        cb(students);
      }
    };

    var url = this.connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    this.connection._secureAjaxGet(url, _cb, ecb);
  }
}

module.exports = {
  Student: Student
};
