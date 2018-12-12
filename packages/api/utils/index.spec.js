/**
 * The unit tests for the exported functions from `index.js`.
 */


import * as utils from '.';


describe('dataToBase64', () => {
  it('should base64 encode `ArrayBuffer`s you put in', () => {
    expect(utils.dataToBase64(new ArrayBuffer(16))).toEqual('AAAAAAAAAAAAAAAAAAAAAA==');
  });
});

describe('asyncBlobToArrayBuffer', () => {
  it('should return a Promise', () => {
    expect(utils.asyncBlobToArrayBuffer() instanceof Promise).toBeTruthy();
  });

  it('should resolve with an ArrayBuffer', (done) => {
    utils.asyncBlobToArrayBuffer(new Blob())
      .then((result) => {
        expect(result instanceof ArrayBuffer).toBeTruthy();
        done();
      })
      .catch(done.fail);
  });

  it('should reject when not passing a Blob', (done) => {
    // eslint-disable-next-line func-names
    spyOn(FileReader.prototype, 'readAsArrayBuffer').and.callFake(function () {
      this.dispatchEvent(new Event('error'));
    });
    spyOnProperty(FileReader.prototype, 'error').and.returnValue(new Error('some error'));

    utils.asyncBlobToArrayBuffer(new Blob())
      .then(() => done.fail(), (result) => {
        expect(result instanceof Error).toBeTruthy();
        done();
      })
      .catch(done.fail);
  });
});
