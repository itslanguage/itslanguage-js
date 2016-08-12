module.exports = class WavePacker {
  /**
   * Stop recording audio.
   */
  init(recordingSampleRate, sampleRate, channels) {
    this.recordingSampleRate = recordingSampleRate;
    if ([48000, 44100].indexOf(this.recordingSampleRate) === -1) {
      console.warn(
        '48000 or 44100 are the only supported recordingSampleRates');
    }

    this.sampleRate = sampleRate;
    if ([
      this.recordingSampleRate,
      this.recordingSampleRate / 2,
      this.recordingSampleRate / 4
    ].indexOf(this.sampleRate) === -1) {
      console.warn(
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
    console.debug('Recording bytes: ' + left.length);
    this.recBuffersL.push(left);
    this.recBuffersR.push(right);
    this.recLength += left.length;
  }

  recordStreaming(left, right, callback) {
    function convertFloat32ToInt16(buffer) {
      var l = buffer.length;
      var buf = new Int16Array(l);
      while (l--) {
        buf[l] = Math.min(1, buffer[l]) * 0x7FFF;
      }
      return buf.buffer;
    }
    // Both the left and right channel's data is a view (Float32Array)
    // on top of the buffer (ArrayBuffer). Each buffer's element should
    // have value between -1 and 1.
    // The audio to export are 16 bit PCM samples that are wrapped in
    // a WAVE file at the server. Therefore convert from float here.
    var converted = convertFloat32ToInt16(left);
    console.debug('Streaming bytes: ' + converted.byteLength);
    callback(converted);
  }

  exportWAV(callback) {
    var bufferL = this.mergeBuffers(this.recBuffersL, this.recLength);
    var bufferR = this.mergeBuffers(this.recBuffersR, this.recLength);
    var interleaved = this.interleave(bufferL, bufferR);
    var dataview = this.encodeWAV(interleaved);
    var audioBlob = new Blob([dataview], {
      type: 'audio/wav'
    });
    callback(audioBlob);
  }


  exportMonoWAV(callback) {
    var bufferL = this.mergeBuffers(this.recBuffersL, this.recLength);
    var dataview = this.encodeWAV(bufferL, true);
    var audioBlob = new Blob([dataview], {
      type: 'audio/wav'
    });
    callback(audioBlob);
  }

  /**
   * Wrap the raw audio in a header to make it a WAVE format.
   *
   * Specs: https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
   */
  encodeWAV(interleaved) {
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeUTFBytes(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 44 + interleaved.length * 2, true);
    // RIFF type
    this.writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    this.writeUTFBytes(view, 12, 'fmt ');
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
    this.writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);

    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
      index += 2;
    }

    // Wrap in HTML5 Blob for transport
    var blob = new Blob([view], {
      type: 'audio/wav'
    });
    console.log('Recorded audio/wav Blob size: ' + blob.size);
    return blob;
  }

  interleave(leftChannel, rightChannel) {
    var result = null;
    var length = null;
    var i = null;
    var inputIndex = null;
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
      var reduceBy = this.recordingSampleRate / this.sampleRate;
      var resampledResult = new Float32Array(length / reduceBy);

      inputIndex = 0;
      for (i = 0; i < length;) {
        var value = 0;
        for (var j = 0; j < reduceBy; j++) {
          value += result[inputIndex++];
        }
        resampledResult[i++] = 1 / reduceBy * value;
      }
      return resampledResult;
    }
    return result;
  }

  mergeBuffers(channelBuffer, recordingLength) {
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  writeUTFBytes(view, offset, string) {
    var lng = string.length;
    for (var i = 0; i < lng; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
};
