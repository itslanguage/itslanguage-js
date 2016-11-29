export default class Phoneme {
  /**
   * Create a phoneme domain model.
   *
   * @param {string} ipa - The pronunciation of the grapheme(s) indicated as International Phonetic Alphabet (IPA).
   * @param {float} score - The audio is scored per phoneme and consists of several measurements. 0 would be bad,
   * 1 the perfect score.
   * @param {float} confidenceScore - This value provides a reliable prediction that the pronounced phoneme is
   * actually the phoneme that is supposed to be pronounced. There is no absolute scale defined yet.
   * @param {string} verdict - Bad when the score is below 0.4, moderate when equal to 0.4 or between 0.4 and 0.6.
   * good when the score is 0.6 or above.
   */
  constructor(ipa, score, confidenceScore, verdict) {
    /**
     * @type {string}
     */
    this.ipa = ipa;

    /**
     * @type {float}
     */
    this.score = score;

    /**
     * @type {float}
     */
    this.confidenceScore = confidenceScore;

    /**
     * @type {string}
     */
    this.verdict = verdict;
  }
}
