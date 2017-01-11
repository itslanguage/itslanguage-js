import ChoiceChallengeController from './choice-challenge/choice-challenge-controller';
import ChoiceRecognitionController from './choice-recognition/choice-recognition-controller';
import EmailCredentialsController from './email-credentials/email-credentials-controller';
import OrganisationController from './organisation/organisation-controller';
import PronAnalaController from './pronunciation-analysis/pronunciation-analysis-controller';
import PronChallController from './pronunciation-challenge/pronunciation-challenge-controller';
import RoleController from './role/role-controller';
import SpeechChallengeController from './speech-challenge/speech-challenge-controller';
import SpeechRecordingController from './speech-recording/speech-recording-controller';
import UserController from './user/user-controller';

/**
 * Facade for all methods used in the ITSLanguage Administrative SDK.
 */
export default class AdministrativeSDK {
  /**
   * @param {Connection} connection - Object to use for making a connection to the REST API and Websocket server.
   */
  constructor(connection) {
    this._connection = connection;
    this._choiceChallengeController = new ChoiceChallengeController(this._connection);
    this._choiceRecognitionController = new ChoiceRecognitionController(this._connection);
    this._emailCredentialsController = new EmailCredentialsController(this._connection);
    this._organisationController = new OrganisationController(this._connection);
    this._pronAnalaController = new PronAnalaController(this._connection);
    this._pronChallController = new PronChallController(this._connection);
    this._roleController = new RoleController(this._connection);
    this._speechChallengeController = new SpeechChallengeController(this._connection);
    this._speechRecordingController = new SpeechRecordingController(this._connection);
    this._userController = new UserController(this._connection);
  }

  /**
   * Create a choice challenge. The choice challenge will be created in the current active {@link Organisation} derived
   * from the OAuth2 scope.
   * It is necessary for a choice challenge to exist for a recording to be valid.
   *
   * @param {ChoiceChallenge} choiceChallenge - Object to create.
   * @returns {Promise.<ChoiceChallenge>} Containing the newly created ChoiceChallenge.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createChoiceChallenge(choiceChallenge) {
    return this._choiceChallengeController.createChoiceChallenge(choiceChallenge);
  }

  /**
   * Get a choice challenge. A choice challenge is identified by its identifier and the current active
   * {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a choice challenge identifier.
   * @returns {Promise.<ChoiceChallenge>} Containing a ChoiceChallenge.
   * @throws {Promise.<Error>} {@link ChoiceChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getChoiceChallenge(challengeId) {
    return this._choiceChallengeController.getChoiceChallenge(challengeId);
  }

  /**
   * List all choice challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<ChoiceChallenge[]>} Containing an array of ChoiceChallenges.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listChoiceChallenges() {
    return this._choiceChallengeController.listChoiceChallenges();
  }

  /**
   * Start a choice recognition from streaming audio.
   *
   * @param {ChoiceChallenge} challenge - The choice challenge to perform.
   * @param {AudioRecorder} recorder - The audio recorder to extract audio from.
   * @param {boolean} [trim=true] - Whether to trim the start and end of recorded audio.
   * @returns {Promise.<ChoiceRecognition>} A {@link https://github.com/cujojs/when} Promise containing a {@link ChoiceRecognition}.
   * @emits {string} 'ReadyToReceive' when the call is made to receive audio. The recorder can now send audio.
   * @throws {Promise.<Error>} {@link ChoiceChallenge} parameter is required or invalid.
   * @throws {Promise.<Error>} {@link ChoiceChallenge#id} field is required.
   * @throws {Promise.<Error>} If the connection is not open.
   * @throws {Promise.<Error>} If the recorder is already recording.
   * @throws {Promise.<Error>} If a recognition session is already in progress.
   * @throws {Promise.<Error>} If something went wrong during analysis.
   */
  startStreamingChoiceRecognition(challenge, recorder, trim) {
    return this._choiceRecognitionController.startStreamingChoiceRecognition(challenge, recorder, trim);
  }

  /**
   * Get a choice recognition in a choice challenge from the current active {@link Organisation} derived from
   * the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a choice challenge identifier.
   * @param {string} recognitionId - Specify a choice recognition identifier.
   * @returns {Promise.<ChoiceRecognition>} Promise containing a ChoiceRecognition.
   * @throws {Promise.<Error>} {@link ChoiceChallenge#id} field is required.
   * @throws {Promise.<Error>} {@link ChoiceRecognition#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getChoiceRecognition(challengeId, recognitionId) {
    return this._choiceRecognitionController.getChoiceRecognition(challengeId, recognitionId);
  }

  /**
   * List all choice recognitions in a specific {@link ChoiceChallenge} from the current active {@link Organisation}
   * derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a choice challenge to list speech recognitions for.
   * @returns {Promise.<ChoiceRecognition[]>} Promise containing an array of ChoiceRecognitions.
   * @throws {Promise.<Error>} {@link ChoiceChallenge#id} is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listChoiceRecognitions(challengeId) {
    return this._choiceRecognitionController.listChoiceRecognitions(challengeId);
  }

  /**
   * Create an organisation. The organisation will be owned by the current active tenant.
   *
   * @param {Organisation} organisation - Object to create.
   * @returns {Promise.<Organisation>} Promise containing the newly created Organisation.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createOrganisation(organisation) {
    return this._organisationController.createOrganisation(organisation);
  }

  /**
   * Get an organisation. You can only get an organisation the current tenant is the owner of.
   *
   * @param {string} organisationId - Specify an organisation identifier.
   * @returns {Promise.<Organisation>} Promise containing an Organisation.
   * @throws {Promise.<Error>} {@link Organisation#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getOrganisation(organisationId) {
    return this._organisationController.getOrganisation(organisationId);
  }

  /**
   * List all organisations the current tenant is the owner of.
   *
   * @returns {Promise.<Organisation[]>} Promise containing an array of Organisations.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listOrganisations() {
    return this._organisationController.listOrganisations();
  }

  /**
   * Start a pronunciation analysis from streaming audio.
   *
   * @param {PronunciationChallenge} challenge - The pronunciation challenge to perform.
   * @param {AudioRecorder} recorder - The audio recorder to extract audio from.
   * @param {boolean} [trim] - Whether to trim the start and end of recorded audio (default: true).
   * @returns {Promise.<PronunciationAnalysis>} A {@link https://github.com/cujojs/when} Promise containing a {@link PronunciationAnalysis}.
   * @emits {string} 'ReadyToReceive' when the call is made to receive audio. The recorder can now send audio.
   * @emits {Object} When the sent audio has finished alignment. Aligning audio is the process of mapping the audio
   * to spoken words and determining when what is said. An object is sent containing a property 'progress',
   * which is the sent audio alignment, and a property 'referenceAlignment' which is the alignment of the
   * reference audio.
   * @throws {Promise.<Error>} If challenge is not an object or not defined.
   * @throws {Promise.<Error>} If challenge has no id.
   * @throws {Promise.<Error>} If the connection is not open.
   * @throws {Promise.<Error>} If the recorder is already recording.
   * @throws {Promise.<Error>} If a session is already in progress.
   * @throws {Promise.<Error>} If something went wrong during analysis.
   */
  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    return this._pronAnalaController.startStreamingPronunciationAnalysis(challenge, recorder, trim);
  }

  /**
   * Get a pronunciation analysis in a pronunciation challenge from the current active {@link Organisation} derived
   * from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier.
   * @param {string} analysisId - Specify a pronunciation analysis identifier.
   * @returns {Promise.<PronunciationAnalysis>} Promise containing a PronunciationAnalysis.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} {@link PronunciationAnalysis#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationAnalysis(challengeId, analysisId) {
    return this._pronAnalaController.getPronunciationAnalysis(challengeId, analysisId);
  }

  /**
   * List all pronunciation analyses in a specific pronunciation challenge from the current active {@link Organisation}
   * derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier to list
   * speech recordings for.
   * @param {boolean} [detailed=false] - Returns extra analysis metadata when true.
   * @returns {Promise.<PronunciationAnalysis[]>} Promise containing an array PronunciationAnalyses.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listPronunciationAnalyses(challengeId, detailed) {
    return this._pronAnalaController.listPronunciationAnalyses(challengeId, detailed);
  }

  /**
   * Create a pronunciation challenge. The created challenge will be part of the current active {@link Organisation}
   * derived from the OAuth2 scope.
   *
   * @param {PronunciationChallenge} challenge - Object to create..
   * @returns {Promise.<PronunciationChallenge>} Promise containing the newly created PronunciationChallenge.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#referenceAudio} of type "Blob" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createPronunciationChallenge(challenge) {
    return this._pronChallController.createPronunciationChallenge(challenge);
  }

  /**
   * Get a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a pronunciation challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing a PronunciationChallenge.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getPronunciationChallenge(challengeId) {
    return this._pronChallController.getPronunciationChallenge(challengeId);
  }

  /**
   * List all pronunciation challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<PronunciationChallenge[]>} Promise containing an array of PronunciationChallenges.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listPronunciationChallenges() {
    return this._pronChallController.listPronunciationChallenges();
  }

  /**
   * Delete a pronunciation challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - A pronunciation challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the given challenge ID.
   * @throws {Promise.<Error>} {@link PronunciationChallenge#id} field is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  deletePronunciationChallenge(challengeId) {
    return this._pronChallController.deletePronunciationChallenge(challengeId);
  }

  /**
   * Create a speech challenge in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {SpeechChallenge} speechChallenge - Object to create.
   * @param {?Blob} audioBlob - Audio fragment to link to the challenge.
   * @returns {Promise.<PronunciationChallenge>} Promise containing the newly created SpeechChallenge.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createSpeechChallenge(speechChallenge, audioBlob) {
    return this._speechChallengeController.createSpeechChallenge(speechChallenge, audioBlob);
  }

  /**
   * Get a speech challenge from the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a speech challenge identifier.
   * @returns {Promise.<PronunciationChallenge>} Promise containing a SpeechChallenge.
   * @throws {Promise.<Error>} {@link SpeechChallenge#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getSpeechChallenge(challengeId) {
    return this._speechChallengeController.getSpeechChallenge(challengeId);
  }

  /**
   * List all speech challenges in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<SpeechChallenge[]>} Promise containing an array of SpeechChallenges.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listSpeechChallenges() {
    return this._speechChallengeController.listSpeechChallenges();
  }

  /**
   * Start a speech recording from streaming audio.
   *
   * @param {SpeechChallenge} challenge - The speech challenge to perform.
   * @param {AudioRecorder} recorder - The audio recorder to extract audio from.
   * @returns {Promise.<SpeechRecording>} A {@link https://github.com/cujojs/when} Promise containing a {@link SpeechRecording}.
   * @emits {string} 'ReadyToReceive' when the call is made to receive audio. The recorder can now send audio.
   * @throws {Promise.<Error>} If challenge is not an object or not defined.
   * @throws {Promise.<Error>} If challenge has no id.
   * @throws {Promise.<Error>} If the connection is not open.
   * @throws {Promise.<Error>} If the recorder is already recording.
   * @throws {Promise.<Error>} If a session is already in progress.
   * @throws {Promise.<Error>} If something went wrong during recording.
   */
  startStreamingSpeechRecording(challenge, recorder) {
    return this._speechRecordingController.startStreamingSpeechRecording(challenge, recorder);
  }

  /**
   * Get a speech recording in a speech challenge from the current active {@link Organisation} derived from the OAuth2
   * scope.
   *
   * @param {string} challengeId - Specify a speech challenge identifier.
   * @param {string} recordingId - Specify a speech recording identifier.
   * @returns {Promise.<SpeechRecording>} Promise containing a SpeechRecording.
   * @throws {Promise.<Error>} {@link SpeechChallenge#id} field is required.
   * @throws {Promise.<Error>} {@link SpeechRecording#id} field is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getSpeechRecording(challengeId, recordingId) {
    return this._speechRecordingController.getSpeechRecording(challengeId, recordingId);
  }

  /**
   * List all speech recordings in a specific speech challenge from the current active {@link Organisation} derived
   * from the OAuth2 scope.
   *
   * @param {string} challengeId - Specify a speech challenge identifier to list speech recordings for.
   * @returns {Promise.<SpeechRecording[]>} Promise containing an array of SpeechRecordings.
   * @throws {Promise.<Error>} {@link SpeechChallenge#id} is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listSpeechRecordings(challengeId) {
    return this._speechRecordingController.listSpeechRecordings(challengeId);
  }

  /**
   * Create a user. The user will be created in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {User} user - User to create.
   * @returns {Promise.<User>} Promise containing the newly created User.
   * @throws {Promise.<Error>} user parameter of type "User" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createUser(user) {
    return this._userController.createUser(user);
  }

  /**
   * Get a user in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @param {string} userId - Specify a user identifier.
   * @returns {Promise.<User>} Promise containing a User.
   * @throws {Promise.<Error>} userId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getUser(userId) {
    return this._userController.getUser(userId);
  }

  /**
   * Get the current authenticated user.
   *
   * @returns {Promise.<User>} The current authenticated user.
   * @throws {Promise.<Error>} If something went wrong in the server.
   */
  getCurrentUser() {
    return this._userController.getCurrentUser();
  }

  /**
   * List all users in the current active {@link Organisation} derived from the OAuth2 scope.
   *
   * @returns {Promise.<User[]>} Promise containing an array of Users.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  listUsers() {
    return this._userController.listUsers();
  }

  /**
   * Register credentials to the given user. Multiple credentials can be registered to one user.
   *
   * @param {string} userId - The identifier of the user to register credentials to.
   * @param {EmailCredentials} emailCredentials - The credentials to register to the user.
   * @returns {Promise.<EmailCredentials>} A promise containing the created EmailCredentials.
   * @throws {Promise.<Error>} UserId parameter of type "string" is required.
   * @throws {Promise.<Error>} EmailCredentials parameter of type "EmailCredentials" is required.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  createEmailCredentials(userId, emailCredentials) {
    return this._emailCredentialsController.createEmailCredentials(userId, emailCredentials);
  }

  /**
   * List all roles available in the API.
   *
   * @returns {Promise.<Role[]>} Promise containing an array of Roles.
   * @throws {Promise.<Error>} If the server returned an error.
   */
  listRoles() {
    return this._roleController.listRoles();
  }

  /**
   * Get a single role.
   *
   * @param {string} roleId - Identifier of the role.
   * @returns {Promise.<Role>} Promise containing a Role.
   * @throws {Promise.<Error>} roleId parameter of type "string" is required.
   * @throws {Promise.<Error>} If no result could not be found.
   */
  getRole(roleId) {
    return this._roleController.getRole(roleId);
  }
}


