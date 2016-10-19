const BasicAuth = require('./administrative-sdk/models/basicAuth').BasicAuth;
const ChoiceChallenge = require('./administrative-sdk/models/choiceChallenge').ChoiceChallenge;
const ChoiceRecognition = require('./administrative-sdk/models/choiceRecognition').ChoiceRecognition;
const Connection = require('./administrative-sdk/controllers/connectionController').Connection;
const Organisation = require('./administrative-sdk/models/organisation').Organisation;
const Phoneme = require('./administrative-sdk/models/pronunciationAnalysis').Phoneme;
const PronunciationAnalysis = require('./administrative-sdk/models/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationChallenge = require('./administrative-sdk/models/pronunciationChallenge').PronunciationChallenge;
const SpeechChallenge = require('./administrative-sdk/models/speechChallenge').SpeechChallenge;
const SpeechRecording = require('./administrative-sdk/models/speechRecording').SpeechRecording;
const Student = require('./administrative-sdk/models/student').Student;
const Tenant = require('./administrative-sdk/models/tenant').Tenant;
const Word = require('./administrative-sdk/models/pronunciationAnalysis').Word;
const WordChunk = require('./administrative-sdk/models/pronunciationAnalysis').WordChunk;
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
