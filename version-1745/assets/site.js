(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            var open = menu.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === index);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === index);
            });
        }
        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var list = scope.querySelector("[data-card-list]") || scope;
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            if (!cards.length) {
                return;
            }
            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    card.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q");
                if (q) {
                    input.value = q;
                    apply();
                }
            }
        });
    }

    function setupSorting() {
        var selects = Array.prototype.slice.call(document.querySelectorAll("[data-sort-select]"));
        selects.forEach(function (select) {
            var scope = select.closest("[data-filter-scope]");
            var list = scope ? scope.querySelector("[data-card-list]") : null;
            if (!list) {
                return;
            }
            var original = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            select.addEventListener("change", function () {
                var value = select.value;
                var sorted = original.slice();
                if (value === "popular") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
                    });
                } else if (value === "rating") {
                    sorted.sort(function (a, b) {
                        return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
                    });
                } else if (value === "newest") {
                    sorted.sort(function (a, b) {
                        return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
                    });
                }
                sorted.forEach(function (card) {
                    list.appendChild(card);
                });
            });
        });
    }

    function startPlayer(source) {
        var video = document.querySelector(".video-player");
        var layer = document.querySelector(".player-layer");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }
        function play() {
            load();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            video.controls = true;
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }
        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSorting();
    });

    window.MovieSite = {
        startPlayer: startPlayer
    };
})();
