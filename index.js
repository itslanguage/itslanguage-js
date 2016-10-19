const BasicAuth = require('./administrative-sdk/models/basicAuth');
const BasicAuthController = require('./administrative-sdk/controllers/basicAuthController');
const ChoiceChallenge = require('./administrative-sdk/models/choiceChallenge');
const ChoiceChallengeController = require('./administrative-sdk/controllers/choiceChallengeController');
const ChoiceRecognition = require('./administrative-sdk/models/choiceRecognition');
const ChoiceRecognitionController = require('./administrative-sdk/controllers/choiceRecognitionController');
const Connection = require('./administrative-sdk/controllers/connectionController');
const Organisation = require('./administrative-sdk/models/organisation');
const OrganisationController = require('./administrative-sdk/controllers/organisationController');
const Phoneme = require('./administrative-sdk/models/phoneme');
const PronunciationAnalysis = require('./administrative-sdk/models/pronunciationAnalysis');
const PronunciationAnalysisController = require('./administrative-sdk/controllers/pronunciationAnalysisController');
const PronunciationChallenge = require('./administrative-sdk/models/pronunciationChallenge');
const PronunciationChallengeController = require('./administrative-sdk/controllers/pronunciationChallengeController');
const SpeechChallenge = require('./administrative-sdk/models/speechChallenge');
const SpeechChallengeController = require('./administrative-sdk/controllers/speechChallengeController');
const SpeechRecording = require('./administrative-sdk/models/speechRecording');
const SpeechRecordingController = require('./administrative-sdk/controllers/speechRecordingController');
const Student = require('./administrative-sdk/models/student');
const StudentController = require('./administrative-sdk/controllers/studentController');
const Tenant = require('./administrative-sdk/models/tenant');
const TenantController = require('./administrative-sdk/controllers/tenantController');
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
