function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var overlay = document.querySelector("[data-player-overlay]");
  var hls = null;
  var started = false;

  if (!video || !overlay || !streamUrl) {
    return;
  }

  function begin() {
    if (started) {
      if (video.paused) {
        video.play().catch(function () {});
      }
      return;
    }

    started = true;
    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {});
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = streamUrl;
      video.play().catch(function () {});
    }

    overlay.classList.add("is-hidden");
  }

  overlay.addEventListener("click", begin);
  video.addEventListener("click", function () {
    if (!started) {
      begin();
      return;
    }
    if (video.paused) {
      video.play().catch(function () {});
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
