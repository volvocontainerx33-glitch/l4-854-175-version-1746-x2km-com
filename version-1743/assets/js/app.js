(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === active);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var next = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
      showSlide(next);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterSelect = document.querySelector('[data-filter-select]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function filterCards() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var category = normalize(filterSelect ? filterSelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardCategory = normalize(card.getAttribute('data-category'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var categoryMatch = !category || cardCategory === category;
      var yearMatch = !year || cardYear === year;
      card.style.display = keywordMatch && categoryMatch && yearMatch ? '' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (filterSelect) {
    filterSelect.addEventListener('change', filterCards);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
})();
