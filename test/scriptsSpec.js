/* eslint-disable
 camelcase,
 new-cap
 */

/* global
 afterEach,
 beforeEach,
 describe,
 expect,
 it,
 jasmine,
 spyOn,
 window,
 FormData
 */

require('jasmine-ajax');
require('jasmine-as-promised')();
const autobahn = require('autobahn');
var nock = require('nock');
var Promise = require('es6-promise').Promise;
var mock = require('xhr-mock');
const its = require('../src');

/*
 Non streaming, move to streaming
 describe('PronunciationAnalyses API interaction test', function() {
 beforeEach(function() {
 jasmine.Ajax.install();

 // XXX: jasmine-ajax doesn't support asserting FormData yet.
 // Workaround by attaching a spy while appending to FormData.
 // https://github.com/pivotal/jasmine-ajax/issues/51
 spyOn(FormData.prototype, 'append');
 });

 afterEach(function() {
 jasmine.Ajax.uninstall();
 });

 it('should create a new pronunciation analysis', function() {
 var blob = new Blob(['1234567890']);
 var challenge = new its.SpeechChallenge('fb', '4');
 var student = new its.Student('fb', '6');
 var recording = new its.SpeechRecording(challenge, student, '1', blob);
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');

 var output = api.createPronunciationAnalysis(recording, false, cb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses';
 expect(request.url).toBe(url);
 expect(request.method).toBe('POST');
 expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
 expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
 expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
 expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
 expect(FormData.prototype.append.calls.count()).toEqual(4);

 var audioUrl = 'https://api-dot-itsl-pilot.itsapi.com/download/Ysjd7bUGseu8-bsJ';
 var content = {
 id: '34',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '24',
 score: 7.5,
 words: [
 [
 {
 graphemes: 'B',
 score: 0.9,
 verdict: 'good'
 },
 {
 graphemes: 'o',
 score: 0.4,
 verdict: 'bad'
 },
 {
 graphemes: 'b',
 score: 0.6,
 verdict: 'moderate'
 },
 {
 graphemes: '\''
 },
 {
 graphemes: 's',
 score: 0.6,
 verdict: 'moderate'
 }
 ],
 [
 {
 graphemes: 'y',
 score: 0.9,
 verdict: 'good'
 },
 {
 graphemes: 'ou',
 score: 0.4,
 verdict: 'bad'
 },
 {
 graphemes: 'r',
 score: 0.6,
 verdict: 'moderate'
 }
 ]
 ]
 };
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 201,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });
 var chunk = [
 new its.WordChunk('B', 0.9, 'good', []),
 new its.WordChunk('o', 0.4, 'bad', []),
 new its.WordChunk('b', 0.6, 'moderate', []),
 new its.WordChunk('\''),
 new its.WordChunk('s', 0.6, 'moderate', [])
 ];
 var chunk2 = [
 new its.WordChunk('y', 0.9, 'good', []),
 new its.WordChunk('ou', 0.4, 'bad', []),
 new its.WordChunk('r', 0.6, 'moderate', []),
 ];
 var word = new its.Word(chunk);
 var word2 = new its.Word(chunk2);
 var words = [word, word2];

 var stringDate = '2014-12-31T23:59:59Z';
 var analysis = new its.PronunciationAnalysis(
 '4', '24', '34', new Date(stringDate), new Date(stringDate), audioUrl);
 analysis.audio = recording.audio;
 analysis.audioUrl = audioUrl + '?access_token=cHJpbmNpcGFsOm51bGw%3D';
 analysis.score = 7.5;
 analysis.words = words;
 expect(cb).toHaveBeenCalledWith(analysis);
 });

 it('should handle alignment failure', function() {
 var blob = new Blob(['1234567890']);
 var challenge = new its.SpeechChallenge('fb', '4');
 var student = new its.Student('fb', '6');
 var recording = new its.SpeechRecording(challenge, student, '1', blob);
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');
 var ecb = jasmine.createSpy('callback');

 var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses';
 expect(request.url).toBe(url);
 expect(request.method).toBe('POST');
 expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
 expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
 expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
 expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
 expect(FormData.prototype.append.calls.count()).toEqual(4);

 var audioUrl = 'https://api-dot-itsl-pilot.itsapi.com/download/Ysjd7bUGseu8-bsJ';
 var content = {
 id: '34',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '24'
 };
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 422,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var stringDate = '2014-12-31T23:59:59Z';
 var outRecording = new its.SpeechRecording(challenge, student, '1', blob);
 outRecording.created = new Date(stringDate);
 outRecording.updated = new Date(stringDate);
 outRecording.audio = recording.audio;
 outRecording.audioUrl = audioUrl;
 outRecording.audioUrl += '?access_token=cHJpbmNpcGFsOm51bGw%3D';
 var errors = {status: 422};
 expect(ecb).toHaveBeenCalledWith(errors, outRecording);
 expect(cb).not.toHaveBeenCalled();
 });

 it('should handle a locked challenge', function() {
 var blob = new Blob(['1234567890']);
 var challenge = new its.SpeechChallenge('fb', '4');
 var student = new its.Student('fb', '6');
 var recording = new its.SpeechRecording(challenge, student, '1', blob);
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');
 var ecb = jasmine.createSpy('callback');

 var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
 expect(output).toBeUndefined();

 var content = {};
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 423,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var errors = {status: 423};
 expect(ecb).toHaveBeenCalledWith(errors, recording);
 expect(cb).not.toHaveBeenCalled();
 });

 it('should handle an unprepared challenge', function() {
 var blob = new Blob(['1234567890']);
 var challenge = new its.SpeechChallenge('fb', '4');
 var student = new its.Student('fb', '6');
 var recording = new its.SpeechRecording(challenge, student, '1', blob);
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');
 var ecb = jasmine.createSpy('callback');

 var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
 expect(output).toBeUndefined();

 var content = {};
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 523,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var errors = {status: 523};
 expect(ecb).toHaveBeenCalledWith(errors, recording);
 expect(cb).not.toHaveBeenCalled();
 });

 it('should handle errors creating a pronunciation analysis', function() {
 var blob = new Blob(['1234567890']);
 var challenge = new its.SpeechChallenge('fb', '4');
 var student = new its.Student('fb', '6');
 var recording = new its.SpeechRecording(challenge, student, '1', blob);
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');
 var ecb = jasmine.createSpy('callback');

 var output = api.createPronunciationAnalysis(recording, false, cb, ecb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses';
 expect(request.url).toBe(url);
 expect(request.method).toBe('POST');
 expect(FormData.prototype.append).toHaveBeenCalledWith('id', '1');
 expect(FormData.prototype.append).toHaveBeenCalledWith('detailed', false);
 expect(FormData.prototype.append).toHaveBeenCalledWith('audio', blob);
 expect(FormData.prototype.append).toHaveBeenCalledWith('studentId', '6');
 expect(FormData.prototype.append.calls.count()).toEqual(4);

 var content = {
 message: 'Validation failed',
 errors: [
 {
 resource: 'PronunciationAnalysis',
 field: 'studentId',
 code: 'missing'
 }
 ]
 };
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 422,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 expect(cb).not.toHaveBeenCalled();
 var errors = [{resource: 'PronunciationAnalysis',
 field: 'studentId',
 code: 'missing'}];
 expect(ecb).toHaveBeenCalledWith(errors, recording);
 expect(output).toBeUndefined();
 });

 it('should get an existing pronunciation analysis', function() {
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');

 var challenge = new its.SpeechChallenge('fb', '4');
 var output = api.getPronunciationAnalysis(challenge, '5', cb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses/5';
 expect(request.url).toBe(url);
 expect(request.method).toBe('GET');

 var audioUrl = 'https://api-dot-itsl-pilot.itsapi.com/download/Ysjd7bUGseu8-bsJ';
 var content = {
 id: '5',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '6'
 };
 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 200,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var stringDate = '2014-12-31T23:59:59Z';
 var student = new its.Student('fb', '6');
 var analysis = new its.PronunciationAnalysis(challenge, student,
 '5', new Date(stringDate), new Date(stringDate));
 analysis.audioUrl = audioUrl;
 expect(cb).toHaveBeenCalledWith(analysis);
 });

 it('should get a list of existing pronunciation analyses', function() {
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');

 var challenge = new its.SpeechChallenge('fb', '4');
 var output = api.listPronunciationAnalyses(challenge, false, cb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses';
 expect(request.url).toBe(url);
 expect(request.method).toBe('GET');

 var audioUrl = 'https://api-dot-itsl-pilot.itsapi.com/download/Ysjd7bUGseu8-bsJ';
 var content = [{
 id: '5',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '6'
 }, {
 id: '6',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '24',
 score: 7.5,
 words: [
 [
 {
 graphemes: 'b',
 score: 0.9,
 verdict: 'good'
 },
 {
 graphemes: 'o',
 score: 0.4,
 verdict: 'bad'
 },
 {
 graphemes: 'x',
 score: 0.5,
 verdict: 'moderate'
 }
 ]
 ]
 }];

 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 200,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var stringDate = '2014-12-31T23:59:59Z';
 var student = new its.Student('fb', '6');
 var analysis = new its.PronunciationAnalysis(challenge, student,
 '5', new Date(stringDate), new Date(stringDate));
 analysis.audioUrl = audioUrl;

 var student2 = new its.Student('fb', '24');
 var analysis2 = new its.PronunciationAnalysis(challenge, student2,
 '6', new Date(stringDate), new Date(stringDate));
 analysis2.audioUrl = audioUrl;
 analysis2.score = 7.5;
 var chunk = [
 new its.WordChunk('b', 0.9, 'good', []),
 new its.WordChunk('o', 0.4, 'bad', []),
 new its.WordChunk('x', 0.5, 'moderate', []),
 ];
 var word = new its.Word(chunk);
 var words = [word];
 analysis2.words = words;
 expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
 });

 it('should get a detailed list of pronunciation analyses', function() {
 var api = new its.Sdk({
 authPrincipal: 'principal',
 authPassword: 'secret'
 });
 var cb = jasmine.createSpy('callback');

 var challenge = new its.SpeechChallenge('fb', '4');
 var output = api.listPronunciationAnalyses(challenge, true, cb);
 expect(output).toBeUndefined();

 var request = jasmine.Ajax.requests.mostRecent();
 var url = 'https://api-dot-itsl-pilot.itsapi.com/organisations/fb' +
 '/challenges/pronunciation/4/analyses?detailed=true';
 expect(request.url).toBe(url);
 expect(request.method).toBe('GET');

 var audioUrl = 'https://api-dot-itsl-pilot.itsapi.com/download/Ysjd7bUGseu8-bsJ';
 var content = [{
 id: '5',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '6'
 }, {
 id: '6',
 created: '2014-12-31T23:59:59Z',
 updated: '2014-12-31T23:59:59Z',
 audioUrl: audioUrl,
 studentId: '24',
 score: 7.5,
 words: [
 [
 {
 graphemes: 'b',
 phonemes: [
 {
 ipa: 'b',
 score: 0.9,
 verdict: 'good',
 start: 0.11,
 end: 0.22
 }
 ],
 score: 0.9,
 verdict: 'good'
 },
 {
 graphemes: 'o',
 phonemes: [
 {
 ipa: '\u0251',
 score: 0.4,
 verdict: 'bad'
 }
 ],
 score: 0.4,
 verdict: 'bad'
 },
 {
 graphemes: 'x',
 phonemes: [
 {
 ipa: 'k',
 score: 0.4,
 verdict: 'bad'
 },
 {
 ipa: 's',
 score: 0.6,
 verdict: 'moderate'
 }
 ],
 score: 0.5,
 verdict: 'moderate'
 }
 ]
 ]
 }];

 jasmine.Ajax.requests.mostRecent().respondWith({
 status: 200,
 contentType: 'application/json',
 responseText: JSON.stringify(content)
 });

 var stringDate = '2014-12-31T23:59:59Z';
 var student = new its.Student('fb', '6');
 var analysis = new its.PronunciationAnalysis(challenge, student,
 '5', new Date(stringDate), new Date(stringDate));
 analysis.audioUrl = audioUrl;

 var student2 = new its.Student('fb', '24');
 var analysis2 = new its.PronunciationAnalysis(challenge, student2,
 '6', new Date(stringDate), new Date(stringDate));
 analysis2.audioUrl = audioUrl;
 analysis2.score = 7.5;
 var phoneme1 = new its.Phoneme('b', 0.9, 'good');
 phoneme1.start = 0.11;
 phoneme1.end = 0.22;
 var phonemes1 = [phoneme1];
 var phonemes2 = [
 new its.Phoneme('\u0251', 0.4, 'bad')
 ];
 var phonemes3 = [
 new its.Phoneme('k', 0.4, 'bad'),
 new its.Phoneme('s', 0.6, 'moderate')
 ];
 var chunk = [
 new its.WordChunk('b', 0.9, 'good', phonemes1),
 new its.WordChunk('o', 0.4, 'bad', phonemes2),
 new its.WordChunk('x', 0.5, 'moderate', phonemes3),
 ];
 var word = new its.Word(chunk);
 var words = [word];
 analysis2.words = words;
 expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
 });
 });
 */

/*
 describe('SDK is created without WebSocket browser support', function() {
 beforeEach(function() {
 // Browser has no support for WebSocket
 spyOn(window, 'WebSocket').and.returnValue(undefined);
 });

 it('should fail when no WebSocket object exists', function() {
 expect(function() {
 its.Sdk();
 }).toThrowError('No WebSocket capabilities');
 });
 });
 */
