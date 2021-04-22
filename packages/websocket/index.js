import socketIOClient from 'socket.io-client';

/**
 * Keep hold of the currently open socketio connection.
 *
 * @type {Promise<socketio.WebSocket>}
 */
let socket = null;
let recorder = null;

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
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
  recorder = rec;
  socket.on('start_recording', (e) => {
    if (e === 'OK') {
      recorder.start(1000);
      canStop = false;
    }
  });
  socket.on('feedback', feedbackFunc);
  // Execute the users function and the cleanup function
  socket.on('end_recording', (recordingId) => {
    endFunc(recordingId);
    cleanup();
  });

  recorder.addEventListener('dataavailable', (e) => {
    if (e.data === undefined) {
      canStop = true;
      return;
    }
    const chunks = [];
    if (e.data.size > 44) {
      console.log(e.data.size);
      chunks.push(e.data);
      const blob = new Blob(chunks, { type: 'audio/wav' });
      socket.emit('write_audio', blob);
      if (canStop) {
        socket.emit('end_recording');
      }
    }
  });
}

export function start(challenge, age) {
  if (challenge) {
    socket.emit('start_recording', {
      text: challenge.srt,
      language: challenge.language,
      age_group: age,
      prompt_id: challenge.id,
    });
  } else {
    socket.emit('start_recording');
  }
}

export function stop() {
  recorder.stop();
  recorder.dispatchEvent(new Event('dataavailable'));
}
