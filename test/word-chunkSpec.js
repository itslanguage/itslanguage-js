const WordChunk = require('../administrative-sdk/word-chunk/word-chunk');
describe('Word chunk', () => {
  it('should construct with phonemes', () => {
    const chunk = new WordChunk('graphemes', 42, 'verdict', [{phoneme: 0}]);
    expect(chunk.graphemes).toEqual('graphemes');
    expect(chunk.score).toEqual(42);
    expect(chunk.verdict).toEqual('verdict');
    expect(chunk.phonemes).toEqual([{phoneme: 0}]);
  });

  it('should construct without phonemes', () => {
    const chunk = new WordChunk('graphemes', 42, 'verdict');
    expect(chunk.graphemes).toEqual('graphemes');
    expect(chunk.score).toEqual(42);
    expect(chunk.verdict).toEqual('verdict');
    expect(chunk.phonemes).toEqual([]);
  });
});
