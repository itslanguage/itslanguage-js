import Student from './student';

/**
 * Controller class for the Student model.
 */
export default class StudentController {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    /**
     * Object to use for making a connection to the REST API and Websocket server.
     * @type {Connection}
     */
    this._connection = connection;
  }

  /**
   * Create a student.
   *
   * @param {Student} student - Object to create.
   * @returns {Promise} Promise containing the newly created object.
   * @throws {Promise} {@link Student#organisationId} field is required.
   * @throws {Promise} If the server returned an error.
   */
  createStudent(student) {
    if (!student.organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      student.organisationId + '/students';
    const fd = JSON.stringify(student);

    return this._connection._secureAjaxPost(url, fd)
      .then(data => {
        const result = new Student(student.organisationId, data.id, data.firstName, data.lastName, data.gender,
          data.birthYear);
        result.created = new Date(data.created);
        result.updated = new Date(data.updated);
        return result;
      });
  }

  /**
   * Get a student.
   *
   * @param {Organisation#id} organisationId - Specify an organisation identifier.
   * @param {Student#id} studentId - Specify a student identifier.
   * @returns {Promise} Promise containing a Student.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} {@link Student#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  getStudent(organisationId, studentId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    if (!studentId) {
      return Promise.reject(new Error('studentId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      organisationId + '/students/' + studentId;
    return this._connection._secureAjaxGet(url)
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
   * @param {Organisation#id} organisationId - Specify an organisation identifier.
   * @returns {Promise} Promise containing a list of Students.
   * @throws {Promise} {@link Organisation#id} field is required.
   * @throws {Promise} If no result could not be found.
   */
  listStudents(organisationId) {
    if (!organisationId) {
      return Promise.reject(new Error('organisationId field is required'));
    }
    const url = this._connection._settings.apiUrl + '/organisations/' +
      organisationId + '/students';
    return this._connection._secureAjaxGet(url)
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
