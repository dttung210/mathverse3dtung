const AUTOPLAY_STORAGE_KEY = 'mathverse:r95:autoplay';

export function isReducedMotionPreferred() {
  return false;
}

export function isAutoPlayEnabled(instance = null) {
  if (instance && typeof instance.autoPlayEnabled === 'boolean') {
    return instance.autoPlayEnabled;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(AUTOPLAY_STORAGE_KEY);
      if (saved === 'off' || saved === 'false' || saved === '0') return false;
      if (saved === 'on' || saved === 'true' || saved === '1') return true;
    }
  } catch (_) {
    // ignore storage restriction
  }
  return true;
}

export function setAutoPlayEnabled(instance, enabled) {
  const next = Boolean(enabled);
  if (instance) {
    instance.autoPlayEnabled = next;
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, next ? 'on' : 'off');
    }
  } catch (_) {
    // ignore storage restriction
  }
  if (!next && instance) {
    cancelLabAutoplay(instance);
  }
  return next;
}

export function cancelLabAutoplay(instance) {
  if (!instance) return;
  if (instance.__labAutoPlayTimer) {
    clearTimeout(instance.__labAutoPlayTimer);
    instance.__labAutoPlayTimer = 0;
  }
  instance.__labAutoPlayToken = (instance.__labAutoPlayToken || 0) + 1;
}

export function resetLabToFrameZero(instance, options = {}) {
  if (!instance || instance.destroyed || instance.disposed) return;
  if (typeof options.applyZero === 'function') {
    options.applyZero();
    return;
  }
  if (typeof instance.setPlaying === 'function') {
    instance.setPlaying(false);
  } else {
    instance.playing = false;
  }
  if (typeof instance.setProgress === 'function') {
    instance.setProgress(0);
    return;
  }
  if ('time' in instance && instance.state && typeof instance.applyTime === 'function') {
    instance.time = 0;
    instance.state.time = 0;
    instance.applyTime(0);
    if (typeof instance.draw === 'function') instance.draw();
    return;
  }
  if ('t' in instance) {
    instance.t = 0;
    if (typeof instance._targetTrajectory === 'function' && instance.params) {
      const traj = instance._targetTrajectory();
      if (traj && Number.isFinite(traj.start)) {
        instance.params.d = traj.start;
      }
    }
    if ('revolutionAngle' in instance && instance.mode?.id?.startsWith?.('12-07')) {
      instance.revolutionAngle = 60;
    }
    if (typeof instance.sync === 'function') instance.sync();
    if (typeof instance.draw === 'function') instance.draw();
  }
}

export function scheduleLabAutoplay(instance, options = {}) {
  if (!instance || typeof setTimeout !== 'function') return false;
  const rawDelay = options.delayMs ?? options.delay;
  const delay = Number.isFinite(rawDelay) ? Math.max(0, rawDelay) : 90;
  const reset = options.reset !== false;
  cancelLabAutoplay(instance);
  const token = instance.__labAutoPlayToken || 1;

  if (reset) {
    resetLabToFrameZero(instance, options);
  }

  if (!isAutoPlayEnabled(instance)) {
    return false;
  }

  instance.__labAutoPlayTimer = setTimeout(() => {
    instance.__labAutoPlayTimer = 0;
    if (!instance || instance.destroyed || instance.disposed) return;
    if ((instance.__labAutoPlayToken || 0) !== token) return;
    if (!isAutoPlayEnabled(instance)) return;

    if (reset) {
      resetLabToFrameZero(instance, options);
    }

    if (typeof options.start === 'function') {
      options.start();
    } else if (typeof instance.setPlaying === 'function') {
      instance.setPlaying(true);
    } else if (typeof instance.play === 'function') {
      instance.play();
    } else if (typeof instance.togglePlay === 'function') {
      instance.togglePlay();
    }
  }, delay);
  return true;
}
