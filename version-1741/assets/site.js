(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const section = panel.closest('.listing-section') || document;
    const grid = section.querySelector('[data-card-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-card]')) : [];
    const searchInput = panel.querySelector('[data-search-input]');
    const yearFilter = panel.querySelector('[data-year-filter]');
    const regionFilter = panel.querySelector('[data-region-filter]');
    const typeFilter = panel.querySelector('[data-type-filter]');
    const sortFilter = panel.querySelector('[data-sort-filter]');
    const emptyState = section.querySelector('[data-empty-state]');

    function valueOf(input) {
      return input ? input.value.trim().toLowerCase() : '';
    }

    function apply() {
      const query = valueOf(searchInput);
      const year = valueOf(yearFilter);
      const region = valueOf(regionFilter);
      const type = valueOf(typeFilter);
      const sort = sortFilter ? sortFilter.value : 'default';
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const passQuery = !query || text.indexOf(query) !== -1;
        const passYear = !year || (card.getAttribute('data-year') || '').toLowerCase() === year;
        const passRegion = !region || (card.getAttribute('data-region') || '').toLowerCase() === region;
        const passType = !type || (card.getAttribute('data-type') || '').toLowerCase() === type;
        const pass = passQuery && passYear && passRegion && passType;
        card.hidden = !pass;
        if (pass) {
          visible += 1;
        }
      });

      const sorted = cards.slice().sort(function (a, b) {
        if (sort === 'rating') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        if (sort === 'views') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }
        if (sort === 'year') {
          return String(b.getAttribute('data-year')).localeCompare(String(a.getAttribute('data-year')), 'zh-Hans-CN', { numeric: true });
        }
        if (sort === 'title') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return 0;
      });

      if (sort !== 'default' && grid) {
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, yearFilter, regionFilter, typeFilter, sortFilter].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  });

  document.querySelectorAll('.player-card').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-overlay');
    const stream = player.getAttribute('data-stream');
    let ready = false;
    let hlsInstance = null;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ maxBufferLength: 90 });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        ready = true;
        return;
      }

      video.src = stream;
      ready = true;
    }

    function play() {
      attach();
      player.classList.add('is-playing');
      if (video) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
