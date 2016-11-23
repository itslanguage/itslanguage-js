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
export default class WordChunk {
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
