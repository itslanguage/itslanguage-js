import * as choiceApi from './choice';
import * as recognition from './choice/recognition';
import * as feedbackApi from './feedback';
import * as speech from './feedback/speech';

export const choice = {
  choice: choiceApi,
  recognition,
};

export const feedback = {
  feedback: feedbackApi,
  speech,
};
