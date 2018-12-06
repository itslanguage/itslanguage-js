import * as itslApi from './index';

describe('api', () => {
  describe('createItslApi', () => {
    it('should create an Itslangauge instance without passing options', () => {
      const api = itslApi.createItslApi();
      expect(api instanceof itslApi.Itslanguage).toBeTruthy();
    });

    it('should create an Itslangauge instance when passing an object', () => {
      const api = itslApi.createItslApi({});
      expect(api instanceof itslApi.Itslanguage).toBeTruthy();
    });

    it('should throw an error when passing something different than an object', () => {
      expect(() => itslApi.createItslApi('wubaluba'))
        .toThrowError(Error, 'Please, only provide objects as settings.');
    });
  });
});
