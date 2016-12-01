import ChoiceChallengeController from './choice-challenge/choice-challenge-controller';
import ChoiceRecognitionController from './choice-recognition/choice-recognition-controller';
import OrganisationController from './organisation/organisation-controller';
import PronAnalaController from './pronunciation-analysis/pronunciation-analysis-controller';
import PronChallController from './pronunciation-challenge/pronunciation-challenge-controller';
import SpeechChallengeController from './speech-challenge/speech-challenge-controller';
import SpeechRecordingController from './speech-recording/speech-recording-controller';
import StudentController from './student/student-controller';

/**
 * Facade for all methods used in the ITSLanguage Administrative SDK.
 */
export default class AdministrativeSDK {
  constructor(connection) {
    this._connection = connection;
    this._choiceChallengeController = new ChoiceChallengeController(this._connection);
    this._choiceRecognitionController = new ChoiceRecognitionController(this._connection);
    this._organisationController = new OrganisationController(this._connection);
    this._pronAnalaController = new PronAnalaController(this._connection);
    this._pronChallController = new PronChallController(this._connection);
    this._speechChallengeController = new SpeechChallengeController(this._connection);
    this._speechRecordingController = new SpeechRecordingController(this._connection);
    this._studentController = new StudentController(this._connection);
  }

  createChoiceChallenge(choiceChallenge) {
    return this._choiceChallengeController.createChoiceChallenge(choiceChallenge);
  }

  getChoiceChallenge(organisationId, challengeId) {
    return this._choiceChallengeController.getChoiceChallenge(organisationId, challengeId);
  }

  listChoiceChallenges(organisationId) {
    return this._choiceChallengeController.listChoiceChallenges(organisationId);
  }

  startStreamingChoiceRecognition(challenge, recorder, trim) {
    return this._choiceRecognitionController.startStreamingChoiceRecognition(challenge, recorder, trim);
  }

  getChoiceRecognition(organisationId, challengeId, recognitionId) {
    return this._choiceRecognitionController.getChoiceRecognition(organisationId, challengeId, recognitionId);
  }

  listChoiceRecognitions(organisationId, challengeId) {
    return this._choiceRecognitionController.listChoiceRecognitions(organisationId, challengeId);
  }

  createOrganisation(organisation) {
    return this._organisationController.createOrganisation(organisation);
  }

  getOrganisation(organisationId) {
    return this._organisationController.getOrganisation(organisationId);
  }

  listOrganisations() {
    return this._organisationController.listOrganisations();
  }

  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    return this._pronAnalaController.startStreamingPronunciationAnalysis(challenge, recorder, trim);
  }

  getPronunciationAnalysis(organisationId, challengeId, analysisId) {
    return this._pronAnalaController.getPronunciationAnalysis(organisationId, challengeId, analysisId);
  }

  listPronunciationAnalyses(organisationId, challengeId, detailed) {
    return this._pronAnalaController.listPronunciationAnalyses(organisationId, challengeId, detailed);
  }

  createPronunciationChallenge(challenge) {
    return this._pronChallController.createPronunciationChallenge(challenge);
  }

  getPronunciationChallenge(organisationId, challengeId) {
    return this._pronChallController.getPronunciationChallenge(organisationId, challengeId);
  }

  listPronunciationChallenges(organisationId) {
    return this._pronChallController.listPronunciationChallenges(organisationId);
  }

  deletePronunciationChallenge(challengeId) {
    return this._pronChallController.deletePronunciationChallenge(challengeId);
  }

  createSpeechChallenge(speechChallenge) {
    return this._speechChallengeController.createSpeechChallenge(speechChallenge);
  }

  getSpeechChallenge(organisationId, challengeId) {
    return this._speechChallengeController.getSpeechChallenge(organisationId, challengeId);
  }

  listSpeechChallenges(organisationId) {
    return this._speechChallengeController.listSpeechChallenges(organisationId);
  }

  startStreamingSpeechRecording(challenge, recorder) {
    return this._speechRecordingController.startStreamingSpeechRecording(challenge, recorder);
  }

  getSpeechRecording(organisationId, challengeId, recordingId) {
    return this._speechRecordingController.getSpeechRecording(organisationId, challengeId, recordingId);
  }

  listSpeechRecordings(organisationId, challengeId) {
    return this._speechRecordingController.listSpeechRecordings(organisationId, challengeId);
  }

  createStudent(student) {
    return this._studentController.createStudent(student);
  }

  getStudent(organisationId, studentId) {
    return this._studentController.getStudent(organisationId, studentId);
  }

  listStudents(organisationId) {
    return this._studentController.listStudents(organisationId);
  }
}


