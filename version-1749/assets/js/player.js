function initMoviePlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function attachSource() {
    if (video.getAttribute('data-loaded') === '1') {
      return;
    }
    video.setAttribute('data-loaded', '1');
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    hideOverlay();
    attachSource();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);
  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
