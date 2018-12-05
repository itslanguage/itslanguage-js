import { settings } from '@itslanguage/api/communication';
import * as audioPlayer from './index';

// Some handy consts for re-usability
const fakeToken = 'fake-token';
const fakeTokenUrl = `?access_token=${fakeToken}`;
const fakeUrl = 'https://fake.news/live.wav';
const secureLoad = true;

describe('player', () => {
  describe('createPlayer', () => {
    it('should return an instance of HTMLAudioElement', () => {
      const player = audioPlayer.createPlayer();
      expect(player instanceof HTMLAudioElement).toBeTruthy();
    });

    it('should throw an error if there is no Audio available', () => {
      /* eslint-disable no-global-assign */
      // remove window.audio temporary
      const OrgAudio = Audio;
      Audio = null;
      expect(audioPlayer.createPlayer).toThrowError('Your browser is not capable of playing audio.');

      // now restore it!
      Audio = OrgAudio;
      /* eslint-enable no-global-assign */
    });

    it('should have set crossOrigin to "use-credentials"', () => {
      const player = audioPlayer.createPlayer();
      expect(player.crossOrigin).toBe('use-credentials');
    });

    it('should NOT set HTMLAudioElement.src if we don\'t pass an audioUrl', () => {
      const player = audioPlayer.createPlayer();
      expect(player.src).toBeFalsy();
    });

    it('should set HTMLAudioElement.src if we pass an audioUrl', () => {
      const player = audioPlayer.createPlayer(fakeUrl);
      expect(player.src).toEqual(fakeUrl);
    });

    it('should not add "access_token" if we do not pass audioUrl and secureLoad', () => {
      const player = audioPlayer.createPlayer();
      expect(player.src.includes(fakeTokenUrl)).toBeFalsy();
    });

    it('should not add "access_token" if we do not pass secureLoad', () => {
      const player = audioPlayer.createPlayer(fakeUrl);
      expect(player.src.includes(fakeTokenUrl)).toBeFalsy();
    });

    it('should not add "access_token" if we pass secureLoad but have no token', () => {
      settings.authorizationToken = null;
      const player = audioPlayer.createPlayer(fakeUrl, secureLoad);
      expect(player.src.includes(fakeTokenUrl)).toBeFalsy();
    });

    it('should add "access_token" if we pass secureLoad', () => {
      settings.authorizationToken = fakeToken;
      const player = audioPlayer.createPlayer(fakeUrl, secureLoad);
      expect(player.src.includes(fakeTokenUrl)).toBeTruthy();
      settings.authorizationToken = null;
    });
  });

  describe('loadAudioUrl', () => {
    it('should return false when player is not passed', () => {
      expect(audioPlayer.loadAudioUrl()).toBeFalsy();
    });

    it('should return false when player is passed but audioUrl not', () => {
      const player = audioPlayer.createPlayer();
      expect(audioPlayer.loadAudioUrl(player)).toBeFalsy();
    });

    it('should return false when player is passed but not as instanceof HTMLAudioElement', () => {
      const player = 'someString';
      expect(audioPlayer.loadAudioUrl(player)).toBeFalsy();
    });

    it('should return false when player is not passed but audioUrl is', () => {
      expect(audioPlayer.loadAudioUrl(undefined, fakeUrl)).toBeFalsy();
    });

    it('should change the src when we provide a new one', () => {
      const player = audioPlayer.createPlayer('somefakeseomthing');
      audioPlayer.loadAudioUrl(player, fakeUrl);
      expect(player.src).toEqual(fakeUrl);
    });

    it('should add "access_token" to src if we pass secureLoad', () => {
      settings.authorizationToken = fakeToken;
      const player = audioPlayer.createPlayer('somefakeseomthing');
      audioPlayer.loadAudioUrl(player, fakeUrl, secureLoad);
      expect(player.src.includes(fakeTokenUrl)).toBeTruthy();
      settings.authorizationToken = null;
    });
  });
});
