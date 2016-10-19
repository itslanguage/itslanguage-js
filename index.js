const BasicAuth = require('./administrative-sdk/models/basicAuth').BasicAuth;
const BasicAuthController = require('./administrative-sdk/controllers/basicAuthController').BasicAuthController;
const ChoiceChallenge = require('./administrative-sdk/models/choiceChallenge').ChoiceChallenge;
const ChoiceChallengeController = require('./administrative-sdk/controllers/choiceChallengeController')
  .ChoiceChallengeController;
const ChoiceRecognition = require('./administrative-sdk/models/choiceRecognition').ChoiceRecognition;
const ChoiceRecognitionController = require('./administrative-sdk/controllers/choiceRecognitionController')
  .ChoiceRecognitionController;
const Connection = require('./administrative-sdk/controllers/connectionController').Connection;
const Organisation = require('./administrative-sdk/models/organisation').Organisation;
const OrganisationController = require('./administrative-sdk/controllers/organisationController')
  .OrganisationController;
const Phoneme = require('./administrative-sdk/models/phoneme');
const PronunciationAnalysis = require('./administrative-sdk/models/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationAnalysisController = require('./administrative-sdk/controllers/pronunciationAnalysisController')
  .PronunciationAnalysisController;
const PronunciationChallenge = require('./administrative-sdk/models/pronunciationChallenge').PronunciationChallenge;
const PronunciationChallengeController = require('./administrative-sdk/controllers/pronunciationChallengeController')
  .PronunciationChallengeController;
const SpeechChallenge = require('./administrative-sdk/models/speechChallenge').SpeechChallenge;
const SpeechChallengeController = require('./administrative-sdk/controllers/speechChallengeController')
  .SpeechChallengeController;
const SpeechRecording = require('./administrative-sdk/models/speechRecording').SpeechRecording;
const SpeechRecordingController = require('./administrative-sdk/controllers/speechRecordingController')
  .SpeechRecordingController;
const Student = require('./administrative-sdk/models/student').Student;
const StudentController = require('./administrative-sdk/controllers/studentController').StudentController;
const Tenant = require('./administrative-sdk/models/tenant').Tenant;
const TenantController = require('./administrative-sdk/controllers/tenantController').TenantController;
const Word = require('./administrative-sdk/models/word');
const WordChunk = require('./administrative-sdk/models/word-chunk');
const audioSdk = require('./audio-sdk');
const AudioTools = require('./audio-tools');
const CordovaMediaPlayer = require('./cordova-media-player');
const CordovaMediaRecorder = require('./cordova-media-recorder');
const MediaRecorder = require('./media-recorder');
const Tools = require('./tools');
const WavePacker = require('./wave-packer');
const WebAudioPlayer = require('./web-audio-player');
const WebAudioRecorder = require('./web-audio-recorder');

module.exports = {
  BasicAuth,
  ChoiceChallenge,
  ChoiceRecognition,
  Connection,
  Organisation,
  Phoneme,
  PronunciationAnalysis,
  PronunciationChallenge,
  SpeechChallenge,
  SpeechRecording,
  Student,
  Tenant,
  Word,
  WordChunk,

  BasicAuthController,
  ChoiceChallengeController,
  ChoiceRecognitionController,
  OrganisationController,
  PronunciationAnalysisController,
  PronunciationChallengeController,
  SpeechChallengeController,
  SpeechRecordingController,
  StudentController,
  TenantController,

  AudioPlayer: audioSdk.AudioPlayer,
  AudioRecorder: audioSdk.AudioRecorder,

  AudioTools,

  CordovaMediaPlayer,

  CordovaMediaRecorder,

  MediaRecorder,

  Tools,

  WavePacker,

  WebAudioPlayer,

  WebAudioRecorder
};
