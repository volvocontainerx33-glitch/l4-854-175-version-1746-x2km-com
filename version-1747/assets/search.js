(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get("q") || "",
      category: params.get("category") || "",
      year: params.get("year") || ""
    };
  }

  function unique(values) {
    var result = [];
    values.forEach(function (value) {
      if (value && result.indexOf(value) === -1) {
        result.push(value);
      }
    });
    return result.sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[match];
    });
  }

  function card(movie) {
    var tags = String(movie.tags || movie.genre || "")
      .split(/[,，、/|；;\s]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      })
      .join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"./" + escapeHtml(movie.file) + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.summary) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function matches(movie, state) {
    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.summary,
      movie.category
    ].join(" ").toLowerCase();
    if (state.q && haystack.indexOf(state.q.toLowerCase()) === -1) {
      return false;
    }
    if (state.category && movie.category !== state.category) {
      return false;
    }
    if (state.year && movie.year !== state.year) {
      return false;
    }
    return true;
  }

  function run() {
    var form = document.querySelector("[data-search-page-form]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!form || !results || typeof MOVIE_INDEX === "undefined") {
      return;
    }

    var input = form.querySelector("input[name='q']");
    var category = form.querySelector("select[name='category']");
    var year = form.querySelector("select[name='year']");
    unique(MOVIE_INDEX.map(function (movie) { return movie.year; })).forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });

    function render(state) {
      if (input) {
        input.value = state.q;
      }
      if (category) {
        category.value = state.category;
      }
      if (year) {
        year.value = state.year;
      }
      var list = MOVIE_INDEX.filter(function (movie) {
        return matches(movie, state);
      }).slice(0, 240);
      title.textContent = state.q ? "搜索结果" : "精选影片";
      results.innerHTML = list.map(card).join("");
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片</div>";
      }
    }

    render(getQuery());

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var params = new URLSearchParams();
      var q = input ? input.value.trim() : "";
      if (q) {
        params.set("q", q);
      }
      if (category && category.value) {
        params.set("category", category.value);
      }
      if (year && year.value) {
        params.set("year", year.value);
      }
      var queryString = params.toString();
      history.replaceState(null, "", "./search.html" + (queryString ? "?" + queryString : ""));
      render(getQuery());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
