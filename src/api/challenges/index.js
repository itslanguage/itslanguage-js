import * as choiceApi from './choice';
import * as recognition from './choice/recognition';
import * as feedbackApi from './feedback';
import * as speech from './feedback/speech';
import * as pronunciationApi from './pronunciation';
import * as analysis from './pronunciation/analysis';

export const choice = {
  choice: choiceApi,
  recognition,
};

export const feedback = {
  feedback: feedbackApi,
  speech,
};

export const pronunciation = {
  pronunciation: pronunciationApi,
  analysis,
};
