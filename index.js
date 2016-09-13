const administrativeSdk = require('./administrative-sdk');
const audioSdk = require('./audio-sdk');
const AudioTools = require('./audio-tools');
const CordovaMediaPlayer = require('./cordova-media-player');
const CordovaMediaRecorder = require('./cordova-media-recorder');
const MediaRecorder = require('./media-recorder');
const TextualComponents = require('./textual-components');
const Tools = require('./tools');
const WavePacker = require('./wave-packer');
const WebAudioPlayer = require('./web-audio-player');
const WebAudioRecorder = require('./web-audio-recorder');
const audioComponents = require('./audio-components');
const segmentPlayer = require('./audio-components-segmentplayer');


module.exports = {
  AudioPlayer: audioSdk.AudioPlayer,
  AudioRecorder: audioSdk.AudioRecorder,
  AudioTools: AudioTools,
  BaseSegmentPlayer: segmentPlayer.BaseSegmentPlayer,
  CordovaMediaPlayer: CordovaMediaPlayer,
  CordovaMediaRecorder: CordovaMediaRecorder,
  BasicAuth: administrativeSdk.BasicAuth,
  ChoiceChallenge: administrativeSdk.ChoiceChallenge,
  ChoiceRecognition: administrativeSdk.ChoiceRecognition,
  MediaRecorder: MediaRecorder,
  MiniPlayer: audioComponents.MiniPlayer,
  MiniSegmentPlayer: segmentPlayer.MiniSegmentPlayer,
  Organisation: administrativeSdk.Organisation,
  Player: audioComponents.Player,
  Phoneme: administrativeSdk.Phoneme,
  PronunciationAnalysis: administrativeSdk.PronunciationAnalysis,
  PronunciationChallenge: administrativeSdk.PronunciationChallenge,
  Recorder: audioComponents.Recorder,
  Sdk: administrativeSdk.Sdk,
  SegmentPlayer: segmentPlayer.SegmentPlayer,
  SpeechChallenge: administrativeSdk.SpeechChallenge,
  SpeechRecording: administrativeSdk.SpeechRecording,
  Student: administrativeSdk.Student,
  Tenant: administrativeSdk.Tenant,
  TextualComponents: TextualComponents,
  Tools: Tools,
  VolumeCanvas: audioComponents.VolumeCanvas,
  WavePacker: WavePacker,
  WebAudioPlayer: WebAudioPlayer,
  WebAudioRecorder: WebAudioRecorder,
  Word: administrativeSdk.Word,
  WordChunk: administrativeSdk.WordChunk
};
