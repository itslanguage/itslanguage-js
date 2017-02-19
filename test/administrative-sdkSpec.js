import * as CategoryController from '../src/administrative-sdk/category/category-controller';
import * as ChoiceChallengeController from '../src/administrative-sdk/choice-challenge/choice-challenge-controller';
import * as ChoiceRecogController from '../src/administrative-sdk/choice-recognition/choice-recognition-controller';
import * as EmailCredentialsController from '../src/administrative-sdk/email-credentials/email-credentials-controller';
import * as GroupController from '../src/administrative-sdk/group/group-controller';
import * as OrganisationController from '../src/administrative-sdk/organisation/organisation-controller';
import * as ProAnalaControl from '../src/administrative-sdk/pronunciation-analysis/pronunciation-analysis-controller';
import * as ProChalControl from '../src/administrative-sdk/pronunciation-challenge/pronunciation-challenge-controller';
import * as ProfileController from '../src/administrative-sdk/profile/profile-controller';
import * as ProgressController from '../src/administrative-sdk/progress/progress-controller';
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
  const fakeCategoryController = jasmine.createSpyObj('CategoryController',
  ['createCategory', 'getCategory', 'getTopLevelCategories', 'getCategoriesWithParent', 'getCategories']);
  const fakeChoiceChallengeController = jasmine.createSpyObj('ChoiceChallengeController',
    ['createChoiceChallenge', 'getChoiceChallenge', 'getChoiceChallenges']);
  const fakeChoiceRecognitionController = jasmine.createSpyObj('ChoiceRecogController',
    ['startStreamingChoiceRecognition', 'getChoiceRecognition', 'getChoiceRecognitions']);
  const fakeEmailCredentialsController = jasmine.createSpyObj('EmailCredentialsController',
  ['createEmailCredentials']);
  const fakeGroupController = jasmine.createSpyObj('GroupController',
  ['createGroup', 'getGroup', 'getGroups']);
  const fakeOrganisationController = jasmine.createSpyObj('OrganisationController',
    ['createOrganisation', 'getOrganisation', 'getOrganisations']);
  const fakeProfileController = jasmine.createSpyObj('ProfileController', ['getProfile', 'getProfiles']);
  const fakeProgressController = jasmine.createSpyObj('ProgressController', ['getProgress']);
  const fakePronunciationAnalysisController = jasmine.createSpyObj('PronunciationAnalysisController',
    ['startStreamingPronunciationAnalysis', 'getPronunciationAnalysis', 'getPronunciationAnalyses']);
  const fakePronunciationChallengeController = jasmine.createSpyObj(
    'PronunciationChallengeController',
    ['createPronunciationChallenge', 'getPronunciationChallenge',
      'getPronunciationChallenges', 'deletePronunciationChallenge']);
  const fakeRoleController = jasmine.createSpyObj('RoleController', ['getRoles', 'getRole']);
  const fakeSpeechChallengeController = jasmine.createSpyObj('SpeechChallengeController',
    ['createSpeechChallenge', 'getSpeechChallenge', 'getSpeechChallenges']);
  const fakeSpeechRecordingController = jasmine.createSpyObj('SpeechRecordingController',
    ['startStreamingSpeechRecording', 'getSpeechRecording', 'getSpeechRecordings']);
  const fakeUserController = jasmine.createSpyObj('UserController',
    ['createUser', 'getUser', 'getCurrentUser', 'getUsers']);
  beforeEach(() => {
    spyOn(CategoryController, 'default').and.returnValue(fakeCategoryController);
    spyOn(ChoiceChallengeController, 'default').and.returnValue(fakeChoiceChallengeController);
    spyOn(ChoiceRecogController, 'default').and.returnValue(fakeChoiceRecognitionController);
    spyOn(EmailCredentialsController, 'default').and.returnValue(fakeEmailCredentialsController);
    spyOn(GroupController, 'default').and.returnValue(fakeGroupController);
    spyOn(OrganisationController, 'default').and.returnValue(fakeOrganisationController);
    spyOn(ProfileController, 'default').and.returnValue(fakeProfileController);
    spyOn(ProgressController, 'default').and.returnValue(fakeProgressController);
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
    sdk.getChoiceChallenges(1);
    sdk.startStreamingChoiceRecognition(1, 2, 3);
    sdk.getChoiceRecognition(1, 2, 3);
    sdk.getChoiceRecognitions(1, 2);
    sdk.createOrganisation(1);
    sdk.getOrganisation(1);
    sdk.getOrganisations();
    sdk.startStreamingPronunciationAnalysis(1, 2, 3);
    sdk.getPronunciationAnalysis(1, 2, 3);
    sdk.getPronunciationAnalyses(1, 2, 3);
    sdk.createPronunciationChallenge(1);
    sdk.getPronunciationChallenge(1, 2);
    sdk.getPronunciationChallenges(1);
    sdk.deletePronunciationChallenge(1);
    sdk.createSpeechChallenge(1, 2);
    sdk.getSpeechChallenge(1, 2);
    sdk.getSpeechChallenges(1);
    sdk.startStreamingSpeechRecording(1, 2);
    sdk.getSpeechRecording(1, 2, 3);
    sdk.getSpeechRecordings(1, 2);
    sdk.createUser(1);
    sdk.getUser(1);
    sdk.getCurrentUser();
    sdk.getUsers();
    sdk.createEmailCredentials(1, 2);
    sdk.getRoles();
    sdk.getRole(1);
    sdk.getProfile(1);
    sdk.getProfiles();
    sdk.getProgress(1);
    sdk.createCategory(1);
    sdk.getCategory(1);
    sdk.getCategoriesWithParent(1);
    sdk.getTopLevelCategories();
    sdk.createGroup(1);
    sdk.getGroup(1);
    sdk.getGroups();

    expect(fakeCategoryController.createCategory).toHaveBeenCalledWith(1);
    expect(fakeCategoryController.getCategory).toHaveBeenCalledWith(1);
    expect(fakeCategoryController.getTopLevelCategories).toHaveBeenCalledWith();
    expect(fakeCategoryController.getCategoriesWithParent).toHaveBeenCalledWith(1);

    expect(fakeChoiceChallengeController.createChoiceChallenge).toHaveBeenCalledWith(1);
    expect(fakeChoiceChallengeController.getChoiceChallenge).toHaveBeenCalledWith(1);
    expect(fakeChoiceChallengeController.getChoiceChallenges).toHaveBeenCalledWith();

    expect(fakeChoiceRecognitionController.startStreamingChoiceRecognition).toHaveBeenCalledWith(1, 2, 3);
    expect(fakeChoiceRecognitionController.getChoiceRecognition).toHaveBeenCalledWith(1, 2);
    expect(fakeChoiceRecognitionController.getChoiceRecognitions).toHaveBeenCalledWith(1);

    expect(fakeEmailCredentialsController.createEmailCredentials).toHaveBeenCalledWith(1, 2);

    expect(fakeGroupController.createGroup).toHaveBeenCalledWith(1);
    expect(fakeGroupController.getGroup).toHaveBeenCalledWith(1);
    expect(fakeGroupController.getGroups).toHaveBeenCalledWith();

    expect(fakeOrganisationController.createOrganisation).toHaveBeenCalledWith(1);
    expect(fakeOrganisationController.getOrganisation).toHaveBeenCalledWith(1);
    expect(fakeOrganisationController.getOrganisations).toHaveBeenCalledWith();

    expect(fakePronunciationAnalysisController.startStreamingPronunciationAnalysis).toHaveBeenCalledWith(1, 2, 3);
    expect(fakePronunciationAnalysisController.getPronunciationAnalysis).toHaveBeenCalledWith(1, 2);
    expect(fakePronunciationAnalysisController.getPronunciationAnalyses).toHaveBeenCalledWith(1, 2);

    expect(fakePronunciationChallengeController.createPronunciationChallenge).toHaveBeenCalledWith(1);
    expect(fakePronunciationChallengeController.getPronunciationChallenge).toHaveBeenCalledWith(1);
    expect(fakePronunciationChallengeController.getPronunciationChallenges).toHaveBeenCalledWith();
    expect(fakePronunciationChallengeController.deletePronunciationChallenge).toHaveBeenCalledWith(1);

    expect(fakeSpeechChallengeController.createSpeechChallenge).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechChallengeController.getSpeechChallenge).toHaveBeenCalledWith(1);
    expect(fakeSpeechChallengeController.getSpeechChallenges).toHaveBeenCalledWith();

    expect(fakeSpeechRecordingController.startStreamingSpeechRecording).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechRecordingController.getSpeechRecording).toHaveBeenCalledWith(1, 2);
    expect(fakeSpeechRecordingController.getSpeechRecordings).toHaveBeenCalledWith(1);

    expect(fakeUserController.createUser).toHaveBeenCalledWith(1);
    expect(fakeUserController.getUser).toHaveBeenCalledWith(1);
    expect(fakeUserController.getCurrentUser).toHaveBeenCalledWith();
    expect(fakeUserController.getUsers).toHaveBeenCalledWith();

    expect(fakeRoleController.getRoles).toHaveBeenCalledWith();
    expect(fakeRoleController.getRole).toHaveBeenCalledWith(1);

    expect(fakeProfileController.getProfile).toHaveBeenCalledWith(1);
    expect(fakeProfileController.getProfiles).toHaveBeenCalledWith();

    expect(fakeProgressController.getProgress).toHaveBeenCalledWith(1);
  });
});
