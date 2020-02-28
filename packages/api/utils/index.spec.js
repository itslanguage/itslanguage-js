/**
 * The unit tests for the exported functions from `index.js`.
 */

import * as utils from '.';

describe('dataToBase64', () => {
  it('should base64 encode `ArrayBuffer`s you put in', () => {
    expect(utils.dataToBase64(new ArrayBuffer(16))).toEqual(
      'AAAAAAAAAAAAAAAAAAAAAA==',
    );
  });
});

describe('asyncBlobToArrayBuffer', () => {
  it('should return a Promise', () => {
    expect(utils.asyncBlobToArrayBuffer() instanceof Promise).toBeTruthy();
  });

  it('should resolve with an ArrayBuffer', done => {
    utils
      .asyncBlobToArrayBuffer(new Blob())
      .then(result => {
        expect(result instanceof ArrayBuffer).toBeTruthy();
        done();
      })
      .catch(done.fail);
  });

  it('should reject when not passing a Blob', done => {
    // eslint-disable-next-line func-names
    spyOn(FileReader.prototype, 'readAsArrayBuffer').and.callFake(function() {
      this.dispatchEvent(new Event('error'));
    });
    spyOnProperty(FileReader.prototype, 'error').and.returnValue(
      new Error('some error'),
    );

    utils
      .asyncBlobToArrayBuffer(new Blob())
      .then(
        () => done.fail(),
        result => {
          expect(result instanceof Error).toBeTruthy();
          done();
        },
      )
      .catch(done.fail);
  });
});

describe('checkAudioIsNotEmpty', () => {
  it('should return false if size is 0', () => {
    expect(utils.checkAudioIsNotEmpty(0, '')).toBe(false);
  });

  it('should return true if size is > 0', () => {
    expect(utils.checkAudioIsNotEmpty(1, '')).toBe(true);
  });

  it('should return false if size is 0 and mimetype is audio/wav', () => {
    expect(utils.checkAudioIsNotEmpty(0, 'audio/wav')).toBe(false);
  });

  it('should return false if size is 44 and mimetype is audio/wav', () => {
    expect(utils.checkAudioIsNotEmpty(44, 'audio/wav')).toBe(false);
  });

  it('should return true if size is > 44 and mimetype is audio/wav', () => {
    expect(utils.checkAudioIsNotEmpty(45, 'audio/wav')).toBe(true);
  });
});
