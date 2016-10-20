const BasicAuth = require('./administrative-sdk/models/basic-auth');
const BasicAuthController = require('./administrative-sdk/controllers/basic-auth-controller');
const ChoiceChallenge = require('./administrative-sdk/models/choice-challenge');
const ChoiceChallengeController = require('./administrative-sdk/controllers/choice-challenge-controller');
const ChoiceRecognition = require('./administrative-sdk/models/choice-recognition');
const ChoiceRecognitionController = require('./administrative-sdk/controllers/choice-recognition-controller');
const Connection = require('./administrative-sdk/controllers/connection-controller');
const Organisation = require('./administrative-sdk/models/organisation');
const OrganisationController = require('./administrative-sdk/controllers/organisation-controller');
const Phoneme = require('./administrative-sdk/models/phoneme');
const PronunciationAnalysis = require('./administrative-sdk/models/pronunciation-analysis');
const PronunciationAnalysisController = require('./administrative-sdk/controllers/pronunciation-analysis-controller');
const PronunciationChallenge = require('./administrative-sdk/models/pronunciation-challenge');
const PronunciationChallengeController = require('./administrative-sdk/controllers/pronunciation-challenge-controller');
const SpeechChallenge = require('./administrative-sdk/models/speech-challenge');
const SpeechChallengeController = require('./administrative-sdk/controllers/speech-challenge-controller');
const SpeechRecording = require('./administrative-sdk/models/speech-recording');
const SpeechRecordingController = require('./administrative-sdk/controllers/speech-recording-controller');
const Student = require('./administrative-sdk/models/student');
const StudentController = require('./administrative-sdk/controllers/student-controller');
const Tenant = require('./administrative-sdk/models/tenant');
const TenantController = require('./administrative-sdk/controllers/tenant-controller');
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
