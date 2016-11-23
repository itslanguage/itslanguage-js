/**
 * @class WordChunk domain model
 */
export default class WordChunk {
  /**
   * Create a word chunk domain model.
   *
   * @param {string} graphemes - The graphemes this chunk consists of.
   * @param {float} score - The audio is scored per grapheme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {string} verdict - Bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
   * good when the score is 0.6 or above.
   * @param {Phoneme[]} phonemes - The phonemes this chunk consists of.
   */
  constructor(graphemes, score, verdict, phonemes) {
    /**
     * The graphemes this chunk consists of.
     * @type {string}
     */
    this.graphemes = graphemes;

    /**
     * The audio is scored per grapheme and consists of several measurements. 0 would be bad,
     * 1 the perfect score.
     * @type {float}
     */
    this.score = score;

    /**
     * Bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
     * good when the score is 0.6 or above.
     * @type {string}
     */
    this.verdict = verdict;

    /**
     * The phonemes this chunk consists of.
     * @type {any}
     */
    this.phonemes = phonemes || [];
  }
}
