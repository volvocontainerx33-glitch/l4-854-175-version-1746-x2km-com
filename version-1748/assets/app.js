(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('#mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slider = document.querySelector('.hero-slider');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-control.prev');
    var next = slider.querySelector('.hero-control.next');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
        dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  }

  var keywordInput = document.querySelector('.js-filter-input');
  var yearSelect = document.querySelector('.js-filter-year');
  var categorySelect = document.querySelector('.js-filter-category');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-item'));
  var emptyState = document.querySelector('.no-results');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyQueryFromUrl() {
    if (!keywordInput) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      keywordInput.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(keywordInput ? keywordInput.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var okYear = !year || cardYear === year;
      var okCategory = !category || cardCategory === category;
      var ok = okKeyword && okYear && okCategory;

      card.style.display = ok ? '' : 'none';

      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  applyQueryFromUrl();

  [keywordInput, yearSelect, categorySelect].forEach(function (field) {
    if (field) {
      field.addEventListener('input', filterCards);
      field.addEventListener('change', filterCards);
    }
  });

  filterCards();

  function bindPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');

    if (!video || !cover) {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function loadVideo() {
      if (started || !streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      started = true;
    }

    function playVideo() {
      loadVideo();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    cover.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(bindPlayer);
})();
