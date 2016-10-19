const Student = require('../models/student').Student;

/**
 * Controller class for the Student model.
 */
class StudentController {
  /**
   * @param connection Object to connect to.
   */
  constructor(connection) {
    this.connection = connection;
  }

  /**
   * Create a student.
   *
   * @param {Student} student Object to create.
   * @returns Promise containing the newly created object.
   * @rejects If the server returned an error.
   */
  createStudent(student) {
    if (!student.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this.connection.settings.apiUrl + '/organisations/' +
      student.organisationId + '/students';
    const fd = JSON.stringify(student);

    return this.connection._secureAjaxPost(url, fd)
      .then(data => {
        // Update the id in case domain model didn't contain one.
        student.id = data.id;
        student.created = new Date(data.created);
        student.updated = new Date(data.updated);
        return student;
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
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    return connection._secureAjaxGet(url)
      .then(data => {
        const student = new Student(organisationId, data.id, data.firstName,
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
    const url = connection.settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    return connection._secureAjaxGet(url)
      .then(data => {
        const students = [];
        data.forEach(datum => {
          const student = new Student(organisationId, datum.id,
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
  StudentController
};
