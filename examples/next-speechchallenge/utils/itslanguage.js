/**
 * Get a recorder to record audio with.
 * Uses localstorage to get mimeType.
 *
 * @returns {Promise} - When successful it returns a recorder.
 */
async function getRecorder() {
  if (typeof window !== 'undefined') {
    const {
      createMediaStream,
      createRecorder,
      createAmplitudePlugin,
    } = await import('../../../packages/recorder');

    const stream = await createMediaStream();

    const localStorageSettings = JSON.parse(
      localStorage.getItem('recorderSettings'),
    );

    const recorderSettings = {
      mimeType: 'audio/wav',
      ...localStorageSettings,
    };

    return createRecorder(
      stream,
      [createAmplitudePlugin()],
      recorderSettings.mimeType,
    );
  }

  return null;
}

export default getRecorder;
