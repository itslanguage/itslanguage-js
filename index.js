const BasicAuth = require('./administrative-sdk/basicAuth');
const ChoiceChallenge = require('./administrative-sdk/choiceChallenge');
const ChoiceRecognition = require('./administrative-sdk/choiceRecognition');
const Organisation = require('./administrative-sdk/organisation');
const Phoneme = require('./administrative-sdk/pronunciationAnalysis');
const PronunciationAnalysis = require('./administrative-sdk/pronunciationAnalysis');
const PronunciationChallenge = require('./administrative-sdk/pronunciationChallenge');
const SpeechChallenge = require('./administrative-sdk/speechChallenge');
const SpeechRecording = require('./administrative-sdk/speechRecording');
const Student = require('./administrative-sdk/student');
const Tenant = require('./administrative-sdk/tenant');
const Word = require('./administrative-sdk/pronunciationAnalysis');
const WordChunk = require('./administrative-sdk/pronunciationAnalysis');
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
