const BasicAuth = require('./administrative-sdk/basicAuth').BasicAuth;
const ChoiceChallenge = require('./administrative-sdk/choiceChallenge').ChoiceChallenge;
const ChoiceRecognition = require('./administrative-sdk/choiceRecognition').ChoiceRecognition;
const Connection = require('./administrative-sdk/connection').Connection;
const Organisation = require('./administrative-sdk/organisation').Organisation;
const Phoneme = require('./administrative-sdk/pronunciationAnalysis').Phoneme;
const PronunciationAnalysis = require('./administrative-sdk/pronunciationAnalysis').PronunciationAnalysis;
const PronunciationChallenge = require('./administrative-sdk/pronunciationChallenge').PronunciationChallenge;
const SpeechChallenge = require('./administrative-sdk/speechChallenge').SpeechChallenge;
const SpeechRecording = require('./administrative-sdk/speechRecording').SpeechRecording;
const Student = require('./administrative-sdk/student').Student;
const Tenant = require('./administrative-sdk/tenant').Tenant;
const Word = require('./administrative-sdk/pronunciationAnalysis').Word;
const WordChunk = require('./administrative-sdk/pronunciationAnalysis').WordChunk;
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
  BasicAuth: BasicAuth,
  ChoiceChallenge: ChoiceChallenge,
  ChoiceRecognition: ChoiceRecognition,
  Connection: Connection,
  Organisation: Organisation,
  Phoneme: Phoneme,
  PronunciationAnalysis: PronunciationAnalysis,
  PronunciationChallenge: PronunciationChallenge,
  SpeechChallenge: SpeechChallenge,
  SpeechRecording: SpeechRecording,
  Student: Student,
  Tenant: Tenant,
  Word: Word,
  WordChunk: WordChunk,

  AudioPlayer: audioSdk.AudioPlayer,
  AudioRecorder: audioSdk.AudioRecorder,

  AudioTools: AudioTools,

  CordovaMediaPlayer: CordovaMediaPlayer,

  CordovaMediaRecorder: CordovaMediaRecorder,

  MediaRecorder: MediaRecorder,

  Tools: Tools,

  WavePacker: WavePacker,

  WebAudioPlayer: WebAudioPlayer,

  WebAudioRecorder: WebAudioRecorder
};
