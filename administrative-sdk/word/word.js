/**
 * @class Word
 *
 * @member {its.WordChunk[]} chunks The spoken sentence, split in graphemes per word.
 */
  module.exports = class Word {
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
};
