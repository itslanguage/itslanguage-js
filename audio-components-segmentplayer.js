/* eslint-disable
 max-len
 */

const guid = require('guid');
const Player = require('./audio-components').Player;


class BaseSegmentPlayer {
  /**
   * ITSLanguage BaseSegmentPlayer capable of working with segments.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    this.settings = Object.assign({
      // Start loading the next segment when the current segment has
      // only x seconds or less of play time remaining.
      loadNextSegment: 5,
      // For smoother playback position indication, poll for position updates
      // faster than the browser default (which is often ~250ms).
      pollFreq: 75
    }, options);

    this.players = this.settings.players;
    this.durations = this.settings.durations;
    this.origins = this.settings.origins;

    if (this.players.length === 0) {
      throw new Error(
        'Please define at least one player in list players');
    }

    // No segment selected as active.
    this.currentSegment = null;

    this.events = {};

    var self = this;
    this.addEventListener = function (name, handler) {
      if (self.events.hasOwnProperty(name)) {
        self.events[name].push(handler);
      } else {
        self.events[name] = [handler];
      }
    };
    this.removeEventListener = function (name, handler) {
      /* This is a bit tricky, because how would you identify functions?
       This simple solution should work if you pass THE SAME handler. */
      if (!self.events.hasOwnProperty(name)) {
        return;
      }

      var index = self.events[name].indexOf(handler);
      if (index !== -1) {
        self.events[name].splice(index, 1);
      }
    };

    this._fireEvent = function (name, args) {
      if (!self.events.hasOwnProperty(name)) {
        return;
      }
      if (!args || !args.length) {
        args = [];
      }

      var evs = self.events[name];
      evs.forEach(function (ev) {
        ev.apply(null, args);
      });
    };
  }

  /**
   * Set the next segment active.
   *
   * @param {number} index The segment index to activate.
   */
  _nextSegment(index) {
    if (this.currentSegment === null) {
      // By default, the first segment (0) becomes the selected
      // one to be played.
      this.currentSegment = 0;
    } else if (index === undefined) {
      this.currentSegment++;
    } else {
      this.currentSegment = index;
    }

    if (this.player) {
      // Unbind all attached handlers on the current player.
      this.player.resetEventListeners();
    }

    this.player = this.players[this.currentSegment];
    if (this.player === undefined) {
      throw new Error(
        'There are no more players, index out of bounds');
    }
    var self = this;

    this.player.addEventListener('playing', function () {
      self._setPlaying();
      self._startPollingForPosition(self.settings.pollFreq);
      self._fireEvent('playing', []);
    });
    this.player.addEventListener('timeupdate', function () {
      self._getNextSegmentReady();
    });
    this.player.addEventListener('canplay', function () {
      self._setPlayable();
    });
    // The `canplay` event may have been fired already when the audio
    // player was already initialised. Call _setPlayable() in that case.
    if (this.player.canPlay()) {
      self._setPlayable();
    }
    this.player.addEventListener('ended', function () {
      if (self.players.length === (self.currentSegment + 1)) {
        // This is the last of all segments.
        self._setNotPlaying();
        self._stopPollingForPosition();
        self.currentSegment = null;
        self._nextSegment();
        self._fireEvent('ended', []);
      } else {
        // Advance into the next segment.
        self._nextSegment();
        self.player.play(0);
      }
    });
    this.player.addEventListener('pause', function () {
      self._setNotPlaying();
      self._stopPollingForPosition();
      self._fireEvent('pause', []);
    });
    // this.player.addEventListener('progress', function() {
    // self._loadingUpdate();
    // });
    // // In case the event was already fired, try to update audio stats.
    // self._loadingUpdate();
    this.player.addEventListener('error', function () {
      self._setError();
    });
  }

  /**
   * Start pre-loading the next segment when the currently playing segment has
   * only x seconds or less of play time remaining.
   */
  _getNextSegmentReady() {
    var remainingSeconds = this.player.getDuration() -
      this.player.getCurrentTime();
    if (remainingSeconds <= this.settings.loadNextSegment) {
      var nextSegment = this.players[this.currentSegment + 1];
      if (nextSegment !== undefined) {
        nextSegment.preload();
      }
    }
  }

  _setPlaying() {
    console.log('Playbutton set to playing state');
    this.playtoggle.classList.add('playing');
  }

  _setNotPlaying() {
    console.log('Playbutton set to non-playing state');
    this.playtoggle.classList.remove('playing');
  }

  _setPlayable() {
    console.log('Playbutton set to a playable state');
    this.playtoggle.removeAttribute('disabled');
    if (this.dragger) {
      this.dragger.removeAttribute('disabled');
    }
  }

  _setError() {
    this._setNotPlaying();
    this.playtoggle.classList.add('error');
  }
}


class SegmentPlayer extends BaseSegmentPlayer {
  /**
   * ITSLanguage SegmentPlayer capable of working with segments.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    // Call super constructor
    super(options);

    if (this.players.length !== this.durations.length) {
      throw new Error(
        'Lists players and durations need to be of equal length');
    }
    if (this.players.length !== this.origins.length) {
      throw new Error(
        'Lists players and origins need to be of equal length');
    }

    var self = this;
    this.players.forEach(function (player, i) {
      var duration = player.getDuration();
      if (duration) {
        self.durations[i] = duration;
      }
    });

    this.totalDuration = 0;
    this.durations.forEach(function (duration, i) {
      if (typeof duration !== 'number') {
        throw new Error(
          'All durations need to be known in advance. Segment index ' + i +
          ' has no duration specified. Either specify or make sure at ' +
          'least the metadata of the audio has been loaded already.');
      }
      self.totalDuration += duration;
      console.log('Player ' + i +
        'duration: ' + duration + '. Total so far: ' + self.totalDuration);
    });

    this._writeUI(this.settings.element);

    this._nextSegment();
  }

  /**
   * Set the next segment active.
   *
   * @param {number} index The segment index to activate.
   */
  _nextSegment(index) {
    // Call super
    super._nextSegment(index);

    var self = this;
    this.player.addEventListener('timeupdate', function () {
      self._getTimeUpdate();
    });
    this.player.addEventListener('progress', function () {
      self._loadingUpdate();
    });
    // In case the event was already fired, try to update audio stats.
    self._loadingUpdate();
  }

  /**
   * Get the current playing time for the audio.
   */
  _getTimeUpdate() {
    // Don't update time and position from audio when position
    // dragger is being used.
    if (!this.draggerDown) {
      this._timeUpdate();
      this._positionUpdate();
    }
  }

  _setPlayable() {
    // Call super
    super._setPlayable();

    this.dragger.removeAttribute('disabled');
  }

  /**
   * Appends the player GUI to the DOM.
   *
   * @param {ui} ui The DOM element to append GUI to.
   */
  _writeUI(ui) {
    ui.innerHTML = this._getUI();

    var id = this.playerId;
    this.playtoggle = document.getElementById(id + 'playtoggle');
    this.range = document.getElementById(id + 'range');
    this.loading = document.getElementById(id + 'loading');
    this.dragger = document.getElementById(id + 'dragger');
    this.timeindication = document.getElementById(id + 'timeindication');

    var self = this;
    this.playtoggle.onclick = function () {
      self.player.togglePlayback();
    };

    function onDrag(globalPct) {
      // Update the playing time as it would be playing once the user
      // would release the dragger.
      self._timeUpdate(globalPct);
      self._updatePositionIndication(globalPct);
    }

    function onDragEnd(globalPct) {
      // Start playing audio at the new position now the dragger has
      // been released.
      var object = self._fromGlobalPercentage(globalPct);
      var pct = object[0];
      var segmentIndex = object[1];
      var wasPlaying = self.player.isPlaying();
      if (segmentIndex !== self.currentSegment) {
        // Scrubbed to another segment.
        // Stop playing (if we were).
        self.player.stop();
        // Load new segment.
        self._nextSegment(segmentIndex);
      }
      self.player.scrub(pct);
      // Start playback in the new segment if audio was playing in the
      // previous segment.
      if (wasPlaying) {
        self.player.play();
      }
    }

    this._applyRangeSlider(this.range, this.dragger, onDrag, onDragEnd);
  }

  /**
   * Calculate local Audio completion percentage from global segments percentage.
   *
   * @param {number} pct The completion percentage (1..100) of all audio stream segments combined.
   * @returns {Array} The completion percentage (1..100) in an audio stream segment as first element in the array. When the position stays within the currently loaded segment, this Audio segment index is provided as second element.
   */
  _fromGlobalPercentage(pct) {
    var secondsInGlobal = (this.totalDuration * pct) / 100;
    var localPct = null;
    var segmentIndex = null;
    this.durations.some(function (duration, i) {
      if (secondsInGlobal > duration) {
        // Not scrubbed in this segment.
        secondsInGlobal -= duration;
      } else {
        // Scrubbing within this segment.
        segmentIndex = i;
        localPct = (secondsInGlobal / duration) * 100;
        // Exit the loop
        return true;
      }
    });
    console.log('Scrubbing to ' + localPct + '% of segment index: ' +
      segmentIndex);
    return ([localPct, segmentIndex]);
  }

  /**
   * Update the loading bar to reflect the actual buffer fill.
   */
  _loadingUpdate() {
    var loaded = this.player.getBufferFill();
    this.loading.style.width = loaded + '%';
  }

  /**
   * Defines the player GUI.
   * Hint: ideal for overriding in a subclass.
   *
   */
  _getUI() {
    var id = this.playerId = guid.create();

    var segments = '';
    var self = this;
    this.durations.forEach(function (duration, i) {
      var pct = (duration * 100) / self.totalDuration;
      segments += '<span id="' + id + 'segment" class="segment ' + self.origins[i] +
        '" style="width: ' + pct + '%">' +
        '<span id="' + id + 'loading" class="loading ' + self.origins[i] +
        '" style="width: 0%"></span>' +
        '</span>';
    });

    return '<p class="player">' +
      // Play button container class
      '<button id="' + id + 'playtoggle" class="playToggle"' +
      ' disabled>' +
      // Play icon
      '<div class="icon"></div>' +
      '</button>' +
      '<span id="' + id + 'range" class="gutter">' +
      segments +
      '<button id="' + id + 'dragger" class="handle"' +
      ' disabled></button>' +
      '</span>' +
      '<span id="' + id + 'timeindication" class="timeindication">' +
      '</span>' +
      '</p>';
  }

  /**
   * Calculate global time position from a segments' position.
   *
   * @param {number} seconds An amount of seconds related to one audio stream segment.
   * @returns {number} The position in seconds on the whole duration of all audio stream segments combined.
   */
  _toGlobalSeconds(seconds) {
    var secondsInGlobal = seconds;
    var self = this;
    for (var i = 0; i < this.currentSegment; i++) {
      secondsInGlobal += self.durations[i];
    }
    return secondsInGlobal;
  }

  /**
   * Calculates the new time indication relative to the duration of all segments, based on the current audio position.
   *
   * Also update the GUI with this new time indication.
   *
   * @param {number} [pct] Audio completion percentage to use for time indication, overriding the actual audio playing time.
   */
  _timeUpdate(pct) {
    var past = null;
    if (pct !== undefined) {
      // Display time while seeking, not currentTime in audio.
      past = (this.totalDuration * pct) / 100;
    } else {
      past = this._toGlobalSeconds(this.player.getCurrentTime());
    }
    var text = this._timerText(past) + ' / ' +
      this._timerText(this.totalDuration);
    this._updateTimeIndication(text);
  }

  /**
   * Calculates the new position indication based on the current audio
   * position.
   * Also update the GUI with this new position indication.
   */
  _positionUpdate() {
    var pct = (this.player.getCurrentTime() * 100) / this.player.getDuration();

    var globalPct = this._toGlobalPercentage(pct);
    console.debug('Updating positionIndication to: ' + globalPct +
      '% (In segment: ' + pct + '%)');

    this._updatePositionIndication(globalPct);
  }

  /**
   * Update the time indication
   *
   * @param {string} text The time to show.
   */
  _updateTimeIndication(text) {
    this.timeindication.innerHTML = text;
  }

  /**
   * Calculate global percentage from a segments percentage.
   *
   * @param {number} pct The completion percentage (1..100) of one audio stream segment.
   * @returns {number} The completion percentage (1..100) of all audio stream segments combined.
   */
  _toGlobalPercentage(pct) {
    var secondsInGlobal = (this.player.getDuration() * pct) / 100;
    var self = this;
    for (var i = 0; i < this.currentSegment; i++) {
      secondsInGlobal += self.durations[i];
    }
    return (secondsInGlobal / this.totalDuration) * 100;
  }
}

/**
 * Handle user interaction with dragger element.
 *
 * @param {object} range The range element over which the dragger is dragged.
 * @param {object} dragger The dragger element which the user can grab.
 * @param {callback} onDrag Called while dragging.
 * @param {callback} onDragEnd Called when dragging action completed.
 */
SegmentPlayer.prototype._applyRangeSlider =
  Player.prototype._applyRangeSlider;

/**
 * Return a formatted time given a high precision second count.
 *
 * @param {number} [seconds] Any number of seconds. Use float for high accuracy output.
 * @returns A duration in the form of mm:ss.nn (minutes, seconds, milliseconds).
 */
SegmentPlayer.prototype._timerText =
  Player.prototype._timerText;

/**
 * Update the dragger position.
 *
 * @param {number} pct The completed percentage (1..100) of all audio stream segments combined.
 */
SegmentPlayer.prototype._updatePositionIndication =
  Player.prototype._updatePositionIndication;

/**
 * Start polling frequently for the current playing time of the audio.
 * By default, browsers use resources very conservative and don't provide
 * time updates frequently enough for the GUI to have a smooth slider.
 *
 * @param {number} pollFreq The polling frequency in milliseconds.
 */
SegmentPlayer.prototype._startPollingForPosition = Player.prototype._startPollingForPosition;

/**
 * Stop polling for the current playing time of the audio.
 */
SegmentPlayer.prototype._stopPollingForPosition = Player.prototype._stopPollingForPosition;


class MiniSegmentPlayer extends BaseSegmentPlayer {
  /**
   * ITSLanguage MiniSegmentPlayer capable of working with segments without showing the scrubber.
   *
   * @constructor
   * @param {object} [options] Override any of the default settings.
   *
   */
  constructor(options) {
    // Call super constructor
    super(options);

    this._writeUI(this.settings.element);
    this._nextSegment();
  }

  /**
   * Defines the miniplayer GUI.
   *
   */
  _getUI() {
    var id = this.playerId = guid.create();
    var player =
      // Container as play area.
      '<p class="player">' +
      // Play button container class
      '<button id="' + id + 'playtoggle" class="playToggle"' +
      ' disabled>' +
      // Play icon
      '<div class="icon"></div>' +
      '</button>' +
      '</p>';
    return player;
  }

  /**
   * Appends the player GUI to the DOM.
   *
   * @param {ui} ui The DOM element to append GUI to.
   */
  _writeUI(ui) {
    ui.innerHTML = this._getUI();

    var id = this.playerId;
    this.playtoggle = document.getElementById(id + 'playtoggle');

    var self = this;
    this.playtoggle.onclick = function () {
      self.player.togglePlayback();
    };
  }
}


module.exports = {
  BaseSegmentPlayer: BaseSegmentPlayer,
  MiniSegmentPlayer: MiniSegmentPlayer,
  SegmentPlayer: SegmentPlayer
};
