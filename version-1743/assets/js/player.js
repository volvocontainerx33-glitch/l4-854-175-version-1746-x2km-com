(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('.play-overlay');
    var stream = wrap.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video || !stream) {
        return;
      }
      if (button) {
        button.classList.add('hidden');
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          start();
        } else {
          video.pause();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
