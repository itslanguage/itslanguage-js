/* eslint-disable
 camelcase
 */

/**
 * @class WordChunk
 *
 * @member {string} graphemes The graphemes this chunk consists of.
 * @member {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad,
 * 1 the perfect score.
 * @member {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6.
 * `good` when the score is 0.6 or above.
 * @member {its.Phoneme[]} phonemes The phonemes this chunk consists of.
 */
class WordChunk {
  /**
   * Create a word chunk domain model.
   *
   * @constructor
   * @param {string} graphemes The graphemes this chunk consists of.
   * @param {float} score The audio is scored per grapheme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {string} verdict `bad` when the score is below 0.4, `moderate` when equal to 0.4 or between 0.4 and 0.6.
   * `good` when the score is 0.6 or above.
   * @param {its.Phoneme[]} phonemes The phonemes this chunk consists of.
   * @return {WordChunk}
   */
  constructor(graphemes, score, verdict, phonemes) {
    this.graphemes = graphemes;
    this.score = score;
    this.verdict = verdict;
    this.phonemes = phonemes || [];
  }
}

/**
 * @class Word
 *
 * @member {its.WordChunk[]} chunks The spoken sentence, split in graphemes per word.
 */
class Word {
  /**
   * Create a word domain model.
   *
   * @constructor
   * @param {its.WordChunk[][]} chunks The spoken sentence, split in graphemes per word.
   * @return {Word}
   */
  constructor(chunks) {
    this.chunks = chunks;
  }
}

/**
 * @class Phoneme
 *
 * @member {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
 * @member {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad,
 * 1 the perfect score.
 * @member {string} bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
 * good when the score is 0.6 or above.
 */
class Phoneme {
  /**
   * Create a phoneme domain model.
   *
   * @constructor
   * @param {string} ipa The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
   * @param {float} score The audio is scored per phoneme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {float} confidenceScore This value provides a reliable prediction that the pronounced phoneme is
   * actually the phoneme that is supposed to be pronounced. There is no absolute scale defined yet.
   * @param {string} verdict bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
   * good when the score is 0.6 or above.
   * @return {Phoneme}
   */
  constructor(ipa, score, confidenceScore, verdict) {
    this.ipa = ipa;
    this.score = score;
    this.confidenceScore = confidenceScore;
    this.verdict = verdict;
  }
}

/**
 * @class PronunciationAnalysis
 *
 * @member {PronunciationChallenge} challenge The challenge identifier.
 * @member {Student} student The student identifier on whose behalve this audio is uploaded.
 * @member {string} id The pronunciation analysis identifier.
 * @member {date} created The creation date of the entity.
 * @member {date} updated The most recent update date of the entity.
 * @member {blob} audio The recorded audio fragment.
 * @member {string} audioUrl The audio fragment as streaming audio link.
 * @member {number} score The average score of all phonemes grading the entire attempt.
 * @member {float} confidenceScore This value provides a reliable prediction that the pronounced phonemes are
 * actually the phonemes that are supposed to be pronounced. There is no absolute scale defined yet.
 * @member {its.Word[][]} words The spoken sentence, split in graphemes per word.
 */
class PronunciationAnalysis {
  /**
   * Create a pronunciation analysis domain model.
   *
   * @constructor
   * @param {PronunciationChallenge} challenge The challenge identifier.
   * @param {Student} student The student identifier on whose behalve this audio is uploaded.
   * @param {string} id The pronunciation analysis identifier.
   * @param {date} created The creation date of the entity.
   * @param {date} updated The most recent update date of the entity.
   * @param {string} audioUrl The audio fragment as streaming audio link.
   */
  constructor(challenge, student, id, created, updated, audioUrl) {
    this.id = id;
    this.challenge = challenge;
    this.student = student;
    this.created = created;
    this.updated = updated;
    this.audioUrl = audioUrl;
  }
}
module.exports = {
  Phoneme: Phoneme,
  PronunciationAnalysis: PronunciationAnalysis,
  Word: Word,
  WordChunk: WordChunk
};
