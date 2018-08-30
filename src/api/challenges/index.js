import * as choiceApi from './choice';
import * as recognition from './choice/recognition';
import * as feedbackApi from './feedback';
import * as speechFeedback from './feedback/speech';
import * as pronunciationApi from './pronunciation';
import * as analysis from './pronunciation/analysis';
import * as speechApi from './speech';
import * as recording from './speech/recordings';

export const choice = {
  choice: choiceApi,
  recognition,
};

export const feedback = {
  feedback: feedbackApi,
  speech: speechFeedback,
};

export const pronunciation = {
  pronunciation: pronunciationApi,
  analysis,
};

export const speech = {
  speech: speechApi,
  recording,
};
