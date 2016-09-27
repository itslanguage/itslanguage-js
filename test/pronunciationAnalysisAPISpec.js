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
 window,
 FormData
 */

require('jasmine-ajax');

const its = require('../');
describe('PronunciationAnalyses API interaction test', function() {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
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
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses/5';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
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
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
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
        {
          chunks: [
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
        }
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
      new its.WordChunk('x', 0.5, 'moderate', [])
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
    var url = 'https://api.itslanguage.nl/organisations/fb' +
      '/challenges/pronunciation/4/analyses?detailed=true';
    expect(request.url).toBe(url);
    expect(request.method).toBe('GET');

    var audioUrl = 'https://api.itslanguage.nl/download/Ysjd7bUGseu8-bsJ';
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
        {
          chunks: [
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
        }
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
    var phoneme1 = new its.Phoneme('b', 0.9);
    phoneme1.verdict = 'good';
    phoneme1.start = 0.11;
    phoneme1.end = 0.22;
    var phonemes1 = [phoneme1];
    var phoneme2 = new its.Phoneme('\u0251', 0.4);
    phoneme2.verdict = 'bad';
    var phonemes2 = [phoneme2];
    var phoneme3 = new its.Phoneme('k', 0.4);
    phoneme3.verdict = 'bad';
    var phoneme4 = new its.Phoneme('s', 0.6);
    phoneme4.verdict = 'moderate';
    var phonemes3 = [
      phoneme3, phoneme4
    ];
    var chunk = [
      new its.WordChunk('b', 0.9, 'good', phonemes1),
      new its.WordChunk('o', 0.4, 'bad', phonemes2),
      new its.WordChunk('x', 0.5, 'moderate', phonemes3)
    ];
    var word = new its.Word(chunk);
    var words = [word];
    analysis2.words = words;
    expect(cb).toHaveBeenCalledWith([analysis, analysis2]);
  });
});
