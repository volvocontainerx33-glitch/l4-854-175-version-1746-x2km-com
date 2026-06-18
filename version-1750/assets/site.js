(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (menuButton && mainNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var carousel = document.getElementById("heroCarousel");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var previous = carousel.querySelector(".hero-arrow.prev");
    var next = carousel.querySelector(".hero-arrow.next");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-slide")) || 0);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);
    startTimer();
  }

  var filterGrid = document.querySelector(".filter-grid");

  if (filterGrid) {
    var filterCards = Array.prototype.slice.call(filterGrid.querySelectorAll(".movie-card"));
    var filterInput = document.querySelector(".filter-input");
    var yearSelect = document.querySelector(".filter-year");
    var clearButton = document.querySelector(".clear-filter");
    var years = [];

    filterCards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
    });

    years.sort().reverse().forEach(function (year) {
      var option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    function applyFilter() {
      var keyword = (filterInput.value || "").trim().toLowerCase();
      var year = yearSelect.value;

      filterCards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.style.display = matchKeyword && matchYear ? "" : "none";
      });
    }

    filterInput.addEventListener("input", applyFilter);
    yearSelect.addEventListener("change", applyFilter);

    clearButton.addEventListener("click", function () {
      filterInput.value = "";
      yearSelect.value = "";
      applyFilter();
    });
  }

  var searchForm = document.getElementById("searchForm");

  if (searchForm && Array.isArray(window.SEARCH_MOVIES)) {
    var input = document.getElementById("searchInput");
    var categorySelect = document.getElementById("categorySelect");
    var results = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var hint = document.getElementById("searchHint");
    var params = new URLSearchParams(window.location.search);

    input.value = params.get("q") || "";

    function createCard(movie) {
      var article = document.createElement("article");
      article.className = "movie-card";
      article.innerHTML = [
        '<a class="poster-link" href="./' + movie.file + '" aria-label="观看' + escapeHtml(movie.title) + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
        '<span class="poster-mask"><span class="play-bubble">▶</span><span>' + escapeHtml(movie.category) + '</span></span>',
        '</a>',
        '<div class="movie-info">',
        '<h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.description) + '</p>',
        '<div class="movie-meta"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
        '</div>'
      ].join("");
      return article;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function runSearch() {
      var keyword = (input.value || "").trim().toLowerCase();
      var category = categorySelect.value;
      var found = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.description, movie.genre, movie.tags, movie.region, movie.year, movie.type].join(" ").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchCategory = !category || movie.category === category;
        return matchKeyword && matchCategory;
      }).slice(0, 160);

      results.innerHTML = "";
      found.forEach(function (movie) {
        results.appendChild(createCard(movie));
      });

      if (!found.length) {
        var empty = document.createElement("div");
        empty.className = "no-results";
        empty.textContent = "暂无匹配影片，可更换关键词继续浏览。";
        results.appendChild(empty);
      }

      title.textContent = keyword || category ? "搜索结果" : "热门浏览";
      hint.textContent = keyword || category ? "已根据当前条件筛选影片。" : "输入关键词或选择分类后开始浏览。";
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = new URLSearchParams();
      if (input.value.trim()) {
        query.set("q", input.value.trim());
      }
      history.replaceState(null, "", window.location.pathname + (query.toString() ? "?" + query.toString() : ""));
      runSearch();
    });

    categorySelect.addEventListener("change", runSearch);
    runSearch();
  }
})();

function initMoviePlayer(src) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playOverlay");
  var hls = null;
  var attached = false;

  if (!video || !overlay || !src) {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function playMovie() {
    attachMedia();
    overlay.hidden = true;
    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.hidden = false;
      });
    }
  }

  overlay.addEventListener("click", playMovie);

  video.addEventListener("click", function () {
    if (video.paused) {
      playMovie();
    }
  });

  video.addEventListener("play", function () {
    overlay.hidden = true;
  });

  video.addEventListener("ended", function () {
    overlay.hidden = false;
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
