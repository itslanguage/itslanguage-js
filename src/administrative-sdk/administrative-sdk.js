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
    this.connection = connection;
    this.choiceChallengeController = new ChoiceChallengeController(this.connection);
    this.choiceRecognitionController = new ChoiceRecognitionController(this.connection);
    this.organisationController = new OrganisationController(this.connection);
    this.pronAnalaController = new PronAnalaController(this.connection);
    this.pronChallController = new PronChallController(this.connection);
    this.speechChallengeController = new SpeechChallengeController(this.connection);
    this.speechRecordingController = new SpeechRecordingController(this.connection);
    this.studentController = new StudentController(this.connection);
  }

  createChoiceChallenge(choiceChallenge) {
    return this.choiceChallengeController.createChoiceChallenge(choiceChallenge);
  }

  getChoiceChallenge(organisationId, challengeId) {
    return this.choiceChallengeController.getChoiceChallenge(organisationId, challengeId);
  }

  listChoiceChallenges(organisationId) {
    return this.choiceChallengeController.listChoiceChallenges(organisationId);
  }

  startStreamingChoiceRecognition(challenge, recorder, trim) {
    return this.choiceRecognitionController.startStreamingChoiceRecognition(challenge, recorder, trim);
  }

  getChoiceRecognition(organisationId, challengeId, recognitionId) {
    return this.choiceRecognitionController.getChoiceRecognition(organisationId, challengeId, recognitionId);
  }

  listChoiceRecognitions(organisationId, challengeId) {
    return this.choiceRecognitionController.listChoiceRecognitions(organisationId, challengeId);
  }

  createOrganisation(organisation) {
    return this.organisationController.createOrganisation(organisation);
  }

  getOrganisation(organisationId) {
    return this.organisationController.getOrganisation(organisationId);
  }

  listOrganisations() {
    return this.organisationController.listOrganisations();
  }

  startStreamingPronunciationAnalysis(challenge, recorder, trim) {
    return this.pronAnalaController.startStreamingPronunciationAnalysis(challenge, recorder, trim);
  }

  getPronunciationAnalysis(organisationId, challengeId, analysisId) {
    return this.pronAnalaController.getPronunciationAnalysis(organisationId, challengeId, analysisId);
  }

  listPronunciationAnalyses(organisationId, challengeId, detailed) {
    return this.pronAnalaController.listPronunciationAnalyses(organisationId, challengeId, detailed);
  }

  createPronunciationChallenge(challenge) {
    return this.pronChallController.createPronunciationChallenge(challenge);
  }

  getPronunciationChallenge(organisationId, challengeId) {
    return this.pronChallController.getPronunciationChallenge(organisationId, challengeId);
  }

  listPronunciationChallenges(organisationId) {
    return this.pronChallController.listPronunciationChallenges(organisationId);
  }

  deletePronunciationChallenge(challengeId) {
    return this.pronChallController.deletePronunciationChallenge(challengeId);
  }

  createSpeechChallenge(speechChallenge) {
    return this.speechChallengeController.createSpeechChallenge(speechChallenge);
  }

  getSpeechChallenge(organisationId, challengeId) {
    return this.speechChallengeController.getSpeechChallenge(organisationId, challengeId);
  }

  listSpeechChallenges(organisationId) {
    return this.speechChallengeController.listSpeechChallenges(organisationId);
  }

  startStreamingSpeechRecording(challenge, recorder) {
    return this.speechRecordingController.startStreamingSpeechRecording(challenge, recorder);
  }

  getSpeechRecording(organisationId, challengeId, recordingId) {
    return this.speechRecordingController.getSpeechRecording(organisationId, challengeId, recordingId);
  }

  listSpeechRecordings(organisationId, challengeId) {
    return this.speechRecordingController.listSpeechRecordings(organisationId, challengeId);
  }

  createStudent(student) {
    return this.studentController.createStudent(student);
  }

  getStudent(organisationId, studentId) {
    return this.studentController.getStudent(organisationId, studentId);
  }

  listStudents(organisationId) {
    return this.studentController.listStudents(organisationId);
  }
}


