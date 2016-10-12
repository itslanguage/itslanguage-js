const BasicAuth = require('./administrative-sdk/basic-auth/basic-auth');
const BasicAuthController = require('./administrative-sdk/basic-auth/basic-auth-controller');
const ChoiceChallenge = require('./administrative-sdk/choice-challenge/choice-challenge');
const ChoiceChallengeController = require('./administrative-sdk/choice-challenge/choice-challenge-controller');
const ChoiceRecognition = require('./administrative-sdk/choice-recognition/choice-recognition');
const ChoiceRecognitionController = require('./administrative-sdk/choice-recognition/choice-recognition-controller');
const Connection = require('./administrative-sdk/connection/connection-controller');
const Organisation = require('./administrative-sdk/organisation/organisation');
const OrganisationController = require('./administrative-sdk/organisation/organisation-controller');
const Phoneme = require('./administrative-sdk/phoneme/phoneme');
const PronunciationAnalysis = require('./administrative-sdk/pronunciation-analysis/pronunciation-analysis');
const PronAnalaController = require('./administrative-sdk/pronunciation-analysis/pronunciation-analysis-controller');
const PronunciationChallenge = require('./administrative-sdk/pronunciation-challenge/pronunciation-challenge');
const PronChallController = require('./administrative-sdk/pronunciation-challenge/pronunciation-challenge-controller');
const SpeechChallenge = require('./administrative-sdk/speech-challenge/speech-challenge');
const SpeechChallengeController = require('./administrative-sdk/speech-challenge/speech-challenge-controller');
const SpeechRecording = require('./administrative-sdk/speech-recording/speech-recording');
const SpeechRecordingController = require('./administrative-sdk/speech-recording/speech-recording-controller');
const Student = require('./administrative-sdk/student/student');
const StudentController = require('./administrative-sdk/student/student-controller');
const Tenant = require('./administrative-sdk/tenant/tenant');
const TenantController = require('./administrative-sdk/tenant/tenant-controller');
const Word = require('./administrative-sdk/word/word');
const WordChunk = require('./administrative-sdk/word-chunk/word-chunk');
const AudioPlayer = require('./audio-player');
const AudioRecorder = require('./audio-recorder');
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
  PronunciationAnalysisController: PronAnalaController,
  PronunciationChallengeController: PronChallController,
  SpeechChallengeController,
  SpeechRecordingController,
  StudentController,
  TenantController,

  AudioPlayer,
  AudioRecorder,

  AudioTools,

  CordovaMediaPlayer,

  CordovaMediaRecorder,

  MediaRecorder,

  Tools,

  WavePacker,

  WebAudioPlayer,

  WebAudioRecorder
};
