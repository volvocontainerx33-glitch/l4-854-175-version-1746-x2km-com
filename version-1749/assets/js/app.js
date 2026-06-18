(function() {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var navPanel = document.querySelector('[data-nav-panel]');
  var navSearch = document.querySelector('.nav-search');

  if (menuButton && navPanel) {
    menuButton.addEventListener('click', function() {
      navPanel.classList.toggle('is-open');
      if (navSearch) {
        navSearch.classList.toggle('is-open');
      }
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = carousel.querySelectorAll('[data-hero-slide]');
    var dots = carousel.querySelectorAll('[data-hero-dot]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      each(slides, function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      each(dots, function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(next, 5600);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = carousel.querySelector('[data-hero-prev]');
    var nextButton = carousel.querySelector('[data-hero-next]');

    if (prevButton) {
      prevButton.addEventListener('click', function() {
        show(current - 1);
        startTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function() {
        show(current + 1);
        startTimer();
      });
    }

    each(dots, function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);
    show(0);
    startTimer();
  }

  var forms = document.querySelectorAll('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var cards = document.querySelectorAll('[data-movie-card]');
  var chips = document.querySelectorAll('[data-filter]');
  var empty = document.querySelector('[data-empty-state]');
  var activeCategory = '';

  function normalized(value) {
    return String(value || '').toLowerCase().trim();
  }

  function cardText(card) {
    return normalized([
      card.getAttribute('data-title'),
      card.getAttribute('data-category'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-region'),
      card.getAttribute('data-year'),
      card.textContent
    ].join(' '));
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var query = normalized(input ? input.value : '');
    var visible = 0;
    each(cards, function(card) {
      var text = cardText(card);
      var category = normalized(card.getAttribute('data-category'));
      var categoryMatch = !activeCategory || category === normalized(activeCategory);
      var queryMatch = !query || text.indexOf(query) !== -1;
      var show = categoryMatch && queryMatch;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  each(forms, function(form) {
    form.addEventListener('submit', function(event) {
      if (cards.length) {
        event.preventDefault();
        filterCards();
      }
    });
  });

  if (input) {
    input.addEventListener('input', filterCards);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
      filterCards();
    }
  }

  each(chips, function(chip) {
    chip.addEventListener('click', function() {
      activeCategory = chip.getAttribute('data-filter') || '';
      each(chips, function(item) {
        item.classList.toggle('is-active', item === chip);
      });
      filterCards();
    });
  });
})();
