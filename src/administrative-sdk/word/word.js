/**
 * @class Word
 */
export default class Word {
  /**
   * Create a word domain model.
   *
   * @param {WordChunk[]} chunks - The spoken sentence, split in graphemes per word.
   */
  constructor(chunks) {
    /**
     * The spoken sentence, split in graphemes per word.
     * @type {WordChunk[]}
     */
    this.chunks = chunks;
  }
}
