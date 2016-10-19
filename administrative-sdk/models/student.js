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
}

module.exports = {
  Student
};
