(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobile = document.querySelector('.mobile-nav');

    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 4800);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(i);
                play();
            });
        });

        show(0);
        play();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('.catalog-grid'));

    grids.forEach(function (grid) {
        var scope = grid.closest('main') || document;
        var input = scope.querySelector('.catalog-search');
        var sort = scope.querySelector('.sort-select');
        var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var activeFilter = 'all';

        function normalized(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applyFilter() {
            var q = normalized(input ? input.value : '');
            cards.forEach(function (card) {
                var haystack = normalized([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category')
                ].join(' '));
                var category = card.getAttribute('data-category') || '';
                var matchText = !q || haystack.indexOf(q) !== -1;
                var matchFilter = activeFilter === 'all' || category === activeFilter;
                card.classList.toggle('is-filtered-out', !(matchText && matchFilter));
            });
        }

        function sortCards() {
            if (!sort) {
                return;
            }
            var value = sort.value;
            var sorted = cards.slice().sort(function (a, b) {
                if (value === 'rating') {
                    return parseFloat(b.getAttribute('data-rating') || '0') - parseFloat(a.getAttribute('data-rating') || '0');
                }
                if (value === 'views') {
                    return parseInt(b.getAttribute('data-views') || '0', 10) - parseInt(a.getAttribute('data-views') || '0', 10);
                }
                if (value === 'year') {
                    return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
                }
                return 0;
            });
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
            cards = sorted;
            applyFilter();
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (sort) {
            sort.addEventListener('change', sortCards);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                activeFilter = chip.getAttribute('data-filter') || 'all';
                chips.forEach(function (item) {
                    item.classList.toggle('active', item === chip);
                });
                applyFilter();
            });
        });
    });
}());
