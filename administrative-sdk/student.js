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
  constructor(organisationId, id, firstName, lastName, gender, birthYear) {
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
  }

  /**
   * Create a student.
   *
   * @param {Connection} connection Object to connect to.
   * @returns Promise containing this.
   * @rejects If the server returned an error.
   */
  createStudent(connection) {
    if (!this.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    var url = connection.settings.apiUrl + '/organisations/' +
      this.organisationId + '/students';
    var fd = JSON.stringify(this);

    return connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        this.id = data.id;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        return this;
      });
  }

  /**
   * Get a student.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @param {string} studentId Specify a student identifier.
   * @returns Promise containing a Student.
   * @rejects If no result could not be found.
   */
  static getStudent(connection, organisationId, studentId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    return connection._secureAjaxGet(url)
      .then(data => {
        var student = new Student(organisationId, data.id, data.firstName,
          data.lastName, data.gender, data.birthYear);
        student.created = new Date(data.created);
        student.updated = new Date(data.updated);
        return student;
      });
  }

  /**
   * List all students in the organisation.
   *
   * @param {Connection} connection Object to connect to.
   * @param {string} organisationId Specify an organisation identifier.
   * @returns Promise containing a list of Students.
   * @rejects If no result could not be found.
   */
  static listStudents(connection, organisationId) {
    var url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    return connection._secureAjaxGet(url)
      .then(data => {
        var students = [];
        data.forEach(function(datum) {
          var student = new Student(organisationId, datum.id,
            datum.firstName, datum.lastName, datum.gender, datum.birthYear);
          student.created = new Date(datum.created);
          student.updated = new Date(datum.updated);
          students.push(student);
        });
        return students;
      });
  }
}

module.exports = {
  Student: Student
};
