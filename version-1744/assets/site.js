(function() {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    var filter = document.querySelector('.page-filter');
    var list = document.querySelector('[data-filter-list]');
    if (filter && list) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            filter.value = initial;
        }

        function applyFilter() {
            var keyword = filter.value.trim().toLowerCase();
            var cards = list.querySelectorAll('.movie-card');
            cards.forEach(function(card) {
                var text = card.textContent.toLowerCase() + ' ' + Array.prototype.map.call(card.attributes, function(attr) {
                    return attr.value.toLowerCase();
                }).join(' ');
                card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
            });
        }

        filter.addEventListener('input', applyFilter);
        applyFilter();
    }
})();
