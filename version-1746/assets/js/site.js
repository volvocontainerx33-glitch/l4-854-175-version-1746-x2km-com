(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initLocalSearch() {
    var input = document.querySelector("[data-local-search]");
    var list = document.querySelector("[data-card-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var activeFilter = "all";

    function apply() {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" "));
        var genre = normalize(card.getAttribute("data-genre"));
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || genre.indexOf(normalize(activeFilter)) !== -1;
        card.classList.toggle("is-search-hidden", !(matchesText && matchesFilter));
      });
    }

    input.addEventListener("input", apply);

    var group = document.querySelector("[data-filter-group]");
    if (group) {
      group.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter-value]");
        if (!button) {
          return;
        }
        activeFilter = button.getAttribute("data-filter-value") || "all";
        Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]")).forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        apply();
      });
    }
  }

  function initGlobalSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-global-search]"));
    if (!inputs.length || !window.SiteSearch) {
      return;
    }
    inputs.forEach(function (input) {
      var container = input.closest(".search-box");
      var results = container ? container.querySelector("[data-search-results]") : null;
      if (!results) {
        return;
      }

      function close() {
        results.classList.remove("open");
        results.innerHTML = "";
      }

      input.addEventListener("input", function () {
        var query = normalize(input.value);
        if (!query) {
          close();
          return;
        }
        var matches = window.SiteSearch.filter(function (item) {
          return normalize([item.title, item.year, item.region, item.genre].join(" ")).indexOf(query) !== -1;
        }).slice(0, 8);
        if (!matches.length) {
          close();
          return;
        }
        results.innerHTML = matches.map(function (item) {
          return '<a class="search-result-item" href="' + item.url + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' +
            escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre + ' · ' + item.rating) +
            '</span></span></a>';
        }).join("");
        results.classList.add("open");
      });

      document.addEventListener("click", function (event) {
        if (!container.contains(event.target)) {
          close();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + url + '"]');
      if (existing) {
        if (window.Hls) {
          resolve();
        } else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }
      var script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function attachHls(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve();
    }
    function useHls() {
      if (window.Hls && window.Hls.isSupported()) {
        return new Promise(function (resolve) {
          var settled = false;
          var hls = new window.Hls({ enableWorker: true });
          function finish() {
            if (!settled) {
              settled = true;
              resolve();
            }
          }
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, finish);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              video.src = url;
              finish();
            }
          });
          window.setTimeout(finish, 2400);
          video._siteHls = hls;
        });
      }
      video.src = url;
      return Promise.resolve();
    }
    if (window.Hls) {
      return useHls();
    }
    return loadScript("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js").then(useHls).catch(function () {
      video.src = url;
    });
  }

  window.SitePlayer = {
    init: function (config) {
      var video = document.getElementById(config.videoId);
      var overlay = document.getElementById(config.overlayId);
      if (!video || !overlay || !config.url) {
        return;
      }
      var prepared = false;

      function start() {
        var promise = prepared ? Promise.resolve() : attachHls(video, config.url);
        prepared = true;
        promise.then(function () {
          overlay.classList.add("is-hidden");
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
          }
        });
      }

      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
    }
  };

  ready(function () {
    initMenu();
    initHero();
    initLocalSearch();
    initGlobalSearch();
  });
})();
