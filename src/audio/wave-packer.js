/**
 * Packer class for audio packing
 *
 * @private
 */
export default class WavePacker {
  /**
   * Stop recording audio.
   *
   * @param {number} recordingSampleRate - Sample rate of recording. Must be either 48000 or 44100.
   * @param {number} sampleRate - Sample rate. Must be half or a quarter of the recording sample rate.
   * @param {number} channels - Amount of audio channels. 1 or 2.
   */
  init(recordingSampleRate, sampleRate, channels) {
    this.recordingSampleRate = recordingSampleRate;
    if ([48000, 44100].indexOf(this.recordingSampleRate) === -1) {
      throw new Error(
        '48000 or 44100 are the only supported recordingSampleRates');
    }

    this.sampleRate = sampleRate;
    if ([
      this.recordingSampleRate,
      this.recordingSampleRate / 2,
      this.recordingSampleRate / 4
    ].indexOf(this.sampleRate) === -1) {
      throw new Error(
        'sampleRate must be equal, half or a quarter of the ' +
        'recording sample rate');
    }

    this.channels = channels;
    this.recording = false;
  }

  clear() {
    this.recLength = 0;
    this.recBuffersL = [];
    this.recBuffersR = [];
  }

  record(left, right) {
    this.recBuffersL.push(left);
    this.recBuffersR.push(right);
    this.recLength += left.length;
  }

  recordStreaming(left, right, callback) {
    function convertFloat32ToInt16(buffer) {
      let l = buffer.length;
      const buf = new Int16Array(l);
      while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
      }
      return buf.buffer;
    }
    // Both the left and right channel's data is a view (Float32Array)
    // on top of the buffer (ArrayBuffer). Each buffer's element should
    // have _value between -1 and 1.
    // The audio to export are 16 bit PCM samples that are wrapped in
    // a WAVE file at the server. Therefore convert from float here.
    const converted = convertFloat32ToInt16(left);
    callback(converted);
  }

  exportWAV(callback) {
    const bufferL = WavePacker.mergeBuffers(this.recBuffersL, this.recLength);
    const bufferR = WavePacker.mergeBuffers(this.recBuffersR, this.recLength);
    const interleaved = this.interleave(bufferL, bufferR);
    const dataview = this.encodeWAV(interleaved);
    const audioBlob = new Blob([dataview], {
      type: 'audio/wav'
    });
    callback(audioBlob);
  }


  exportMonoWAV(callback) {
    const bufferL = WavePacker.mergeBuffers(this.recBuffersL, this.recLength);
    const dataview = this.encodeWAV(bufferL, true);
    const audioBlob = new Blob([dataview], {
      type: 'audio/wav'
    });
    callback(audioBlob);
  }

  /**
   * Wrap the raw audio in a header to make it a WAVE format.
   *
   * @see {@link https://ccrma.stanford.edu/courses/422/projects/WaveFormat/}.
   *
   * @todo This function should use the {@link createWAVEHeader} function for creating the header.
   * @param {Array} interleaved - Array of interleaved audio.
   */
  encodeWAV(interleaved) {
    const buffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    WavePacker.writeUTFBytes(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 44 + interleaved.length * 2, true);
    // RIFF type
    WavePacker.writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    WavePacker.writeUTFBytes(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true);
    // channel count. mono=1, stereo=2
    view.setUint16(22, this.channels, true);
    // sample rate
    view.setUint32(24, this.sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, this.sampleRate * 2 * this.channels, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, this.channels * 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data sub-chunk
    WavePacker.writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    const lng = interleaved.length;
    let index = 44;
    const volume = 1;
    for (let i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
      index += 2;
    }

    // Wrap in HTML5 Blob for transport
    const blob = new Blob([view], {
      type: 'audio/wav'
    });
    console.log('Recorded audio/wav Blob size: ' + blob.size);
    return blob;
  }

  interleave(leftChannel, rightChannel) {
    let result = null;
    let length = null;
    let i = null;
    let inputIndex = null;
    if (this.channels === 1) {
      // Keep both right and left input channels, but "pan" them both
      // in the center (to the single mono channel)
      length = leftChannel.length;
      result = new Float32Array(length);
      for (i = 0; i < leftChannel.length; ++i) {
        result[i] = 0.5 * (leftChannel[i] + rightChannel[i]);
      }
    } else {
      length = leftChannel.length + rightChannel.length;
      result = new Float32Array(length);

      inputIndex = 0;
      for (i = 0; i < length;) {
        result[i++] = leftChannel[inputIndex];
        result[i++] = rightChannel[inputIndex];
        inputIndex++;
      }
    }

    // Also downsample if needed.
    if (this.recordingSampleRate !== this.sampleRate) {
      // E.g. 44100/11025 = 4
      const reduceBy = this.recordingSampleRate / this.sampleRate;
      const resampledResult = new Float32Array(length / reduceBy);

      inputIndex = 0;
      for (i = 0; i < length;) {
        let value = 0;
        for (let j = 0; j < reduceBy; j++) {
          value += result[inputIndex++];
        }
        resampledResult[i++] = 1 / reduceBy * value;
      }
      return resampledResult;
    }
    return result;
  }

  static mergeBuffers(channelBuffer, recordingLength) {
    const result = new Float32Array(recordingLength);
    let offset = 0;
    const lng = channelBuffer.length;
    for (let i = 0; i < lng; i++) {
      const buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  /**
   * Deprecated function, will be removed in favor of the pure
   * {@link wordToUTF8ByteArray} function.
   *
   * @deprecated
   * @param {DataView} view - DataView to write the bytes to.
   * @param {number} offset - Position in the DataView to start writing from.
   * @param {string} string - String to write to the DataView.
   * @returns {void} - Nothing will be returned.
   */
  static writeUTFBytes(view, offset, string) {
    const lng = string.length;
    for (let i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

/**
 * Composes a PCM WAVE file header.
 * This header will lack any size information, so in effect
 * timing information will most probably be incorrect.
 *
 * More information on the WAVE file specification can be found below.
 * For the SDK and our backend services we use the WAVE PCM format.
 *
 * @see http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/WAVE/WAVE.html
 * @param {number} channels - Channels in the audio.
 * @param {number} sampleRate - SampleRate of the audio.
 * @returns {ArrayBuffer} - The header as ArrayBuffer.
 */
export function createWAVEHeader(channels, sampleRate) {
  // Default WAVE header length is 44 bytes long.
  const buffer = new ArrayBuffer(44);
  const header = new DataView(buffer);

  // Set RIFF chunk descriptor
  wordToUTF8ByteArray('RIFF').forEach((ui8Int, index) => {
    header.setUint8(index, ui8Int);
  });

  // Set RIFF type
  wordToUTF8ByteArray('WAVE').forEach((ui8Int, index) => {
    header.setUint8(index + 8, ui8Int);
  });

  // Set FMT sub-chunk
  wordToUTF8ByteArray('fmt ').forEach((ui8Int, index) => {
    header.setUint8(index + 12, ui8Int);
  });

  // Set format chunk length
  header.setUint32(16, 16, true);

  // Set sample format (raw)
  header.setUint16(20, 1, true);

  // Set channel count. mono=1, stereo=2
  header.setUint16(22, channels, true);

  // Set sample rate
  header.setUint32(24, sampleRate, true);

  // Set byte rate (sample rate * block align)
  header.setUint32(28, sampleRate * 2 * channels, true);

  // Set block align (channel count * bytes per sample)
  header.setUint16(32, channels * 2, true);

  // Set bits per sample
  header.setUint16(34, 16, true);

  // Set data sub-chunk
  wordToUTF8ByteArray('data').forEach((ui8Int, index) => {
    header.setUint8(index + 36, ui8Int);
  });

  // Return the ArrayBuffer of the header.
  return header.buffer;
}

/**
 * Get an TypedArray (an Uint8Array to be more precise) that
 * represents a string.
 *
 * @param {string} word - The word to convert.
 * @returns {Uint8Array} - The converted word as Uint8Array.
 */
export function wordToUTF8ByteArray(word) {
  const buffer = new ArrayBuffer(word.length);
  const bufferView = new Uint8Array(buffer);
  bufferView.map((item, index, array) => {
    array[index] = word.charCodeAt(index);
  });
  return bufferView;
}
