const administrativeSdk = require('./administrative-sdk');
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
  AudioPlayer: audioSdk.AudioPlayer,
  AudioRecorder: audioSdk.AudioRecorder,
  AudioTools: AudioTools,
  BasicAuth: administrativeSdk.BasicAuth,
  CordovaMediaPlayer: CordovaMediaPlayer,
  CordovaMediaRecorder: CordovaMediaRecorder,
  ChoiceChallenge: administrativeSdk.ChoiceChallenge,
  ChoiceRecognition: administrativeSdk.ChoiceRecognition,
  MediaRecorder: MediaRecorder,
  Organisation: administrativeSdk.Organisation,
  Phoneme: administrativeSdk.Phoneme,
  PronunciationAnalysis: administrativeSdk.PronunciationAnalysis,
  PronunciationChallenge: administrativeSdk.PronunciationChallenge,
  Sdk: administrativeSdk.Sdk,
  SpeechChallenge: administrativeSdk.SpeechChallenge,
  SpeechRecording: administrativeSdk.SpeechRecording,
  Student: administrativeSdk.Student,
  Tenant: administrativeSdk.Tenant,
  Tools: Tools,
  Word: administrativeSdk.Word,
  WordChunk: administrativeSdk.WordChunk,
  WavePacker: WavePacker,
  WebAudioPlayer: WebAudioPlayer,
  WebAudioRecorder: WebAudioRecorder
};
