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

function sendRecorderData({ data }) {
  socket.emit('write_audio', new Blob([data], { type: 'audio/wav' }));
  if (canStop) {
    socket.emit('end_recording');
  }
}

export function cleanup() {
  recorder.removeEventListener('dataavailable', sendRecorderData);
  if (socket) {
    socket.disconnect();
    socket.off();
    socket = null;
  }
}

function connect(apiUrl, auth) {
  if (!socket) {
    try {
      socket = socketIOClient(apiUrl, {
        extraHeaders: {
          Authorization: `Bearer ${auth}`,
        },
        reconnection: false,
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

/**
 *
 * @return {socketio.WebSocket} - The socket.
 */
export function establishConnection(
  token,
  apiUrl,
  rec,
  feedbackFunc,
  endFunc,
  overrideRecorder = false,
) {
  connect(apiUrl, token);
  if (!recorder || overrideRecorder) {
    recorder = rec;
  }
  socket.on('feedback', feedbackFunc);
  socket.on('end_recording', (recordingId) => {
    endFunc(recordingId);
  });
  recorder.addEventListener('dataavailable', sendRecorderData);
  return socket;
}

/**
  * Request to start the recording. Returns a promise which is fulfilled once the
  * backend confirms that it is able to receive audio.
  */
export function start(challenge, age, textIndex = 0) {
  let promise;

  canStop = false;
  if (challenge) {
    promise = new Promise((resolve, reject) => socket.emit('start_recording', {
      text: challenge.srt,
      language: challenge.language,
      age_group: age,
      prompt_id: challenge.id,
      text_index: textIndex,
    }, () => {
      if (!canStop) {
        // Start the recorder and send audio every 1000 milliseconds
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
        // Start the recorder and send audio every 1000 milliseconds
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

export function startASR(language) {
  canStop = false;
  const promise = new Promise((resolve, reject) => socket.emit('start_recording', {
    language,
  }, () => {
    if (!canStop) {
      // Start the recorder and send audio every 1000 milliseconds
      recorder.start(1000);
      resolve();
    } else {
      // Stop was called early
      socket.emit('end_recording');
      reject();
    }
  }));
  return promise;
}
