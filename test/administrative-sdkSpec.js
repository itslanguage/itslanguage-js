import * as ChoiceChallengeController from '../src/administrative-sdk/choice-challenge/choice-challenge-controller';
import * as ChoiceRecogController from '../src/administrative-sdk/choice-recognition/choice-recognition-controller';
import * as EmailCredentialsController from '../src/administrative-sdk/email-credentials/email-credentials-controller';
import * as OrganisationController from '../src/administrative-sdk/organisation/organisation-controller';
import * as ProAnalaControl from '../src/administrative-sdk/pronunciation-analysis/pronunciation-analysis-controller';
import * as ProChalControl from '../src/administrative-sdk/pronunciation-challenge/pronunciation-challenge-controller';
import * as RoleController from '../src/administrative-sdk/role/role-controller';
import * as SpeechChallengeController from '../src/administrative-sdk/speech-challenge/speech-challenge-controller';
import * as SpeechRecordingController from '../src/administrative-sdk/speech-recording/speech-recording-controller';
import * as UserController from '../src/administrative-sdk/user/user-controller';
import AdministrativeSDK from '../src/administrative-sdk/administrative-sdk';
import Connection from '../src/administrative-sdk/connection/connection-controller';

describe('Administrative SDK', () => {
  const connection = new Connection({
    oAuth2Token: 'token'
  });
  let sdk;
  const fakeChoiceChallengeController = jasmine.createSpyObj('ChoiceChallengeController',
    ['createChoiceChallenge', 'getChoiceChallenge', 'listChoiceChallenges']);
  const fakeChoiceRecognitionController = jasmine.createSpyObj('ChoiceRecogController',
    ['startStreamingChoiceRecognition', 'getChoiceRecognition', 'listChoiceRecognitions']);
  const fakeEmailCredentialsController = jasmine.createSpyObj('EmailCredentialsController',
  ['createEmailCredentials']);
  const fakeOrganisationController = jasmine.createSpyObj('OrganisationController',
    ['createOrganisation', 'getOrganisation', 'listOrganisations']);
  const fakePronunciationAnalysisController = jasmine.createSpyObj('PronunciationAnalysisController',
    ['startStreamingPronunciationAnalysis', 'getPronunciationAnalysis', 'listPronunciationAnalyses']);
  const fakePronunciationChallengeController = jasmine.createSpyObj(
    'PronunciationChallengeController',
    ['createPronunciationChallenge', 'getPronunciationChallenge',
      'listPronunciationChallenges', 'deletePronunciationChallenge']);
  const fakeRoleController = jasmine.createSpyObj('RoleController', ['listRoles']);
  const fakeSpeechChallengeController = jasmine.createSpyObj('SpeechChallengeController',
    ['createSpeechChallenge', 'getSpeechChallenge', 'listSpeechChallenges']);
  const fakeSpeechRecordingController = jasmine.createSpyObj('SpeechRecordingController',
    ['startStreamingSpeechRecording', 'getSpeechRecording', 'listSpeechRecordings']);
  const fakeUserController = jasmine.createSpyObj('UserController',
    ['createUser', 'getUser', 'listUsers']);
  beforeEach(() => {
    spyOn(ChoiceChallengeController, 'default').and.returnValue(fakeChoiceChallengeController);
    spyOn(ChoiceRecogController, 'default').and.returnValue(fakeChoiceRecognitionController);
    spyOn(EmailCredentialsController, 'default').and.returnValue(fakeEmailCredentialsController);
    spyOn(OrganisationController, 'default').and.returnValue(fakeOrganisationController);
    spyOn(ProAnalaControl, 'default').and.returnValue(fakePronunciationAnalysisController);
    spyOn(ProChalControl, 'default').and.returnValue(fakePronunciationChallengeController);
    spyOn(RoleController, 'default').and.returnValue(fakeRoleController);
    spyOn(SpeechChallengeController, 'default').and.returnValue(fakeSpeechChallengeController);
    spyOn(SpeechRecordingController, 'default').and.returnValue(fakeSpeechRecordingController);
    spyOn(UserController, 'default').and.returnValue(fakeUserController);
    sdk = new AdministrativeSDK(connection);
  });

  it('should call all the methods', () => {
    sdk.createChoiceChallenge(1);
    sdk.getChoiceChallenge(1, 2);
    sdk.listChoiceChallenges(1);
    sdk.startStreamingChoiceRecognition(1, 2, 3);
    sdk.getChoiceRecognition(1, 2, 3);
    sdk.listChoiceRecognitions(1, 2);
    sdk.createOrganisation(1);
    sdk.getOrganisation(1);
    sdk.listOrganisations();
    sdk.startStreamingPronunciationAnalysis(1, 2, 3);
    sdk.getPronunciationAnalysis(1, 2, 3);
    sdk.listPronunciationAnalyses(1, 2, 3);
    sdk.createPronunciationChallenge(1);
    sdk.getPronunciationChallenge(1, 2);
    sdk.listPronunciationChallenges(1);
    sdk.deletePronunciationChallenge(1);
    sdk.createSpeechChallenge(1, 2);
    sdk.getSpeechChallenge(1, 2);
    sdk.listSpeechChallenges(1);
    sdk.startStreamingSpeechRecording(1, 2);
    sdk.getSpeechRecording(1, 2, 3);
    sdk.listSpeechRecordings(1, 2);
    sdk.createUser(1);
    sdk.getUser(1, 2);
    sdk.listUsers(1);
    sdk.createEmailCredentials(1, 2);
    sdk.listRoles();

    expect(fakeChoiceChallengeController.createChoiceChallenge).toHaveBeenCalledWith(1);
    expect(fakeChoiceChallengeController.getChoiceChallenge).toHaveBeenCalledWith(1);
    expect(fakeChoiceChallengeController.listChoiceChallenges).toHaveBeenCalledWith();

    expect(fakeChoiceRecognitionController.startStreamingChoiceRecognition).toHaveBeenCalledWith(1, 2, 3);
    expect(fakeChoiceRecognitionController.getChoiceRecognition).toHaveBeenCalledWith(1, 2);
    expect(fakeChoiceRecognitionController.listChoiceRecognitions).toHaveBeenCalledWith(1);

    expect(fakeEmailCredentialsController.createEmailCredentials).toHaveBeenCalledWith(1, 2);

    expect(fakeOrganisationController.createOrganisation).toHaveBeenCalledWith(1);
    expect(fakeOrganisationController.getOrganisation).toHaveBeenCalledWith(1);
    expect(fakeOrganisationController.listOrganisations).toHaveBeenCalledWith();

    expect(fakePronunciationAnalysisController.startStreamingPronunciationAnalysis).toHaveBeenCalledWith(1, 2, 3);
    expect(fakePronunciationAnalysisController.getPronunciationAnalysis).toHaveBeenCalledWith(1, 2);
    expect(fakePronunciationAnalysisController.listPronunciationAnalyses).toHaveBeenCalledWith(1, 2);

    expect(fakePronunciationChallengeController.createPronunciationChallenge).toHaveBeenCalledWith(1);
    expect(fakePronunciationChallengeController.getPronunciationChallenge).toHaveBeenCalledWith(1);
    expect(fakePronunciationChallengeController.listPronunciationChallenges).toHaveBeenCalledWith();
    expect(fakePronunciationChallengeController.deletePronunciationChallenge).toHaveBeenCalledWith(1);

    expect(fakeSpeechChallengeController.createSpeechChallenge).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechChallengeController.getSpeechChallenge).toHaveBeenCalledWith(1);
    expect(fakeSpeechChallengeController.listSpeechChallenges).toHaveBeenCalledWith();

    expect(fakeSpeechRecordingController.startStreamingSpeechRecording).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechRecordingController.getSpeechRecording).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechRecordingController.listSpeechRecordings).toHaveBeenCalledWith(1);

    expect(fakeUserController.createUser).toHaveBeenCalledWith(1);
    expect(fakeUserController.getUser).toHaveBeenCalledWith(1, 2);
    expect(fakeUserController.listUsers).toHaveBeenCalledWith(1);

    expect(fakeRoleController.listRoles).toHaveBeenCalledWith();
  });
});
