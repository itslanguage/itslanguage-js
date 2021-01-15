import socketIOClient from 'socket.io-client';

/**
 * Keep hold of the currently open socketio connection.
 *
 * @type {Promise<socketio.WebSocket>}
 */
let socket = null;
let recorder = null;

let first = true;
let canStop = false;

export function cleanup() {
  socket.close();
  socket = null;
}

/**
 *
 * @return {socketio.WebSocket} - The socket.
 */
export function establishConnection(token, apiUrl, rec, feedbackFunc, endFunc) {
  if (socket !== null) {
    return;
  }
  try {
    socket = socketIOClient(apiUrl, {
      transportOptions: {
        polling: {
          extraHeaders: {
            authorization: `Bearer ${token}`,
          },
        },
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  recorder = rec;
  socket.on('start-recording', (e) => {
    if (e === 'OK') {
      recorder.start(1000);
      canStop = false;
    }
  });
  socket.on('feedback', feedbackFunc);
  // Execute the users function and the cleanup function
  socket.on('end-recording', (recordingId) => {
    endFunc(recordingId);
    cleanup();
  });

  recorder.addEventListener('dataavailable', (e) => {
    const chunks = [];
    if (e.data.size > 44) {
      chunks.push(e.data);
      const blob = new Blob(chunks, { type: 'audio/wav' });
      if (first === true) {
        socket.emit('write-audio', blob);
        first = false;
      } else {
        socket.emit('write-audio', blob.slice(44));
      }
    }
    if (canStop) {
      socket.emit('end-recording');
      canStop = false;
      first = true;
    }
  });
}

export function start(challenge, age) {
  socket.emit('start-recording', {
    text: challenge.srt,
    language: challenge.language,
    age_group: age,
    prompt_id: challenge.id,
  });
}

export function stop() {
  recorder.requestData();
  recorder.stop();
  canStop = true;
}
