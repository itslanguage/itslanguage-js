import socketIOClient from 'socket.io-client';

/**
 * Keep hold of the currently open socketio connection.
 *
 * @type {Promise<socketio.WebSocket>}
 */
let socket = null;
let recorder = null;

let canStop = false;

export function stop() {
  try {
    recorder.stop();
  } catch (error) {
    console.error(error);
  }
  canStop = true;
}

export function cleanup() {
  stop();
}

function connect(apiUrl, auth) {
  if (!socket) {
    try {
      socket = socketIOClient(apiUrl, {
        extraHeaders: {
          Authorization: `Bearer ${auth}`,
        },
      });
      socket.on('error', (error) => {
        console.error(error);
      });
      socket.on('connect_error', (error) => {
        console.error(error);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }
}

function linkSocketRecorder(feedbackFunc, endFunc) {
  socket.on('feedback', feedbackFunc);
  socket.on('end_recording', (recordingId) => {
    endFunc(recordingId);
  });
  recorder.addEventListener('dataavailable', (e) => {
    socket.emit('write_audio', new Blob([e.data], { type: 'audio/wav' }));
    if (canStop) {
      socket.emit('end_recording');
    }
  });
}

/**
 *
 * @return {socketio.WebSocket} - The socket.
 */
export function establishConnection(token, apiUrl, rec, feedbackFunc, endFunc) {
  connect(apiUrl, token);
  if (!recorder) {
    recorder = rec;
    linkSocketRecorder(feedbackFunc, endFunc);
  }
  return socket;
}

/**
  * Request to start the recording. Returns a promise which is fulfilled once the
  * backend confirms that it is able to receive audio.
  */
export function start(challenge, age) {
  let promise;

  canStop = false;
  if (challenge) {
    promise = new Promise((resolve, reject) => socket.emit('start_recording', {
      text: challenge.srt,
      language: challenge.language,
      age_group: age,
      prompt_id: challenge.id,
    }, () => {
      if (!canStop) {
        recorder.start(1000);
        resolve();
      } else {
        // Stop was called early
        socket.emit('end_recording');
        reject();
      }
    }));
  } else {
    promise = new Promise((resolve, reject) => socket.emit('start_recording', () => {
      if (!canStop) {
        recorder.start(1000);
        resolve();
      } else {
        // Stop was called early
        socket.emit('end_recording');
        reject();
      }
    }));
  }
  return promise;
}
