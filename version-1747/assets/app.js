(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initSiteSearchForms() {
    var forms = document.querySelectorAll("[data-site-search]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        window.location.href = target + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function valuesFromCards(cards, key) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(key) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initLocalFilter() {
    var panel = document.querySelector("[data-local-filter]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var resetButton = panel.querySelector("[data-filter-reset]");

    fillSelect(yearSelect, valuesFromCards(cards, "data-year"));
    fillSelect(typeSelect, valuesFromCards(cards, "data-type"));

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          matched = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [keywordInput, yearSelect, typeSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener("input", apply);
      control.addEventListener("change", apply);
    });
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        apply();
      });
    }
  }

  ready(function () {
    initNavigation();
    initSiteSearchForms();
    initHero();
    initLocalFilter();
  });
})();
