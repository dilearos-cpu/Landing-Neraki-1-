(function () {
  var MOBILE_BREAKPOINT = 767;
  var MOBILE_SLIDES = 2;

  function getVisibleCount(section) {
    var desktopCount = Number(section.dataset.slidesPerView || 1);
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      return MOBILE_SLIDES;
    }
    return Math.max(1, Math.min(desktopCount, 4));
  }

  function initCarousel(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    var viewport = section.querySelector(".photo-carousel__viewport");
    var track = section.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(section.querySelectorAll("[data-carousel-slide]"));

    if (!viewport || !track || !slides.length) {
      return;
    }

    section.dataset.initialized = "true";

    var prevButton = section.querySelector("[data-carousel-prev]");
    var nextButton = section.querySelector("[data-carousel-next]");
    var dotsContainer = section.querySelector("[data-carousel-dots]");
    var autoplaySpeed = Number(section.dataset.autoplaySpeed || 4000);
    var pauseOnHover = section.dataset.pauseOnHover === "true";
    var currentIndex = 0;
    var timer = null;
    var isHovered = false;
    var resizeTimer = null;

    function applyVisibleCount() {
      var visibleCount = getVisibleCount(section);
      var effectiveCount = Math.min(visibleCount, slides.length);
      viewport.style.setProperty("--slides-per-view", String(effectiveCount));
      return effectiveCount;
    }

    function getMaxIndex(visibleCount) {
      return Math.max(0, slides.length - visibleCount);
    }

    function getPageCount(visibleCount) {
      return getMaxIndex(visibleCount) + 1;
    }

    function updateTransform() {
      var visibleCount = applyVisibleCount();
      var maxIndex = getMaxIndex(visibleCount);

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      var slideWidth = slides[0].offsetWidth;
      var gap = Number.parseFloat(getComputedStyle(track).gap || "0");
      track.style.transform = "translateX(-" + currentIndex * (slideWidth + gap) + "px)";

      if (dotsContainer) {
        Array.prototype.forEach.call(dotsContainer.children, function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === currentIndex);
        });
      }
    }

    function renderDots() {
      if (!dotsContainer) {
        return;
      }

      var visibleCount = applyVisibleCount();
      var pageCount = getPageCount(visibleCount);

      dotsContainer.innerHTML = Array.from({ length: pageCount }, function (_, index) {
        return (
          '<button type="button" class="photo-carousel__dot' +
          (index === currentIndex ? " is-active" : "") +
          '" data-dot-index="' +
          index +
          '" aria-label="Ir a la pagina ' +
          (index + 1) +
          '"></button>'
        );
      }).join("");
    }

    function goTo(index) {
      var visibleCount = applyVisibleCount();
      var maxIndex = getMaxIndex(visibleCount);

      if (index > maxIndex) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = maxIndex;
      } else {
        currentIndex = index;
      }

      updateTransform();
    }

    function nextSlide() {
      goTo(currentIndex + 1);
    }

    function prevSlide() {
      goTo(currentIndex - 1);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();

      var visibleCount = applyVisibleCount();
      if (slides.length <= visibleCount) {
        return;
      }

      timer = setInterval(function () {
        if (!pauseOnHover || !isHovered) {
          nextSlide();
        }
      }, autoplaySpeed);
    }

    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        renderDots();
        updateTransform();
        startAutoplay();
      }, 150);
    }

    if (dotsContainer) {
      dotsContainer.addEventListener("click", function (event) {
        var dot = event.target.closest("[data-dot-index]");
        if (!dot) {
          return;
        }
        goTo(Number(dot.dataset.dotIndex));
        startAutoplay();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        prevSlide();
        startAutoplay();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        nextSlide();
        startAutoplay();
      });
    }

    if (pauseOnHover) {
      section.addEventListener("mouseenter", function () {
        isHovered = true;
      });
      section.addEventListener("mouseleave", function () {
        isHovered = false;
      });
    }

    window.addEventListener("resize", handleResize);

    renderDots();
    goTo(0);
    startAutoplay();
  }

  function initAllCarousels() {
    document.querySelectorAll(".photo-carousel").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllCarousels);
  } else {
    initAllCarousels();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initCarousel(event.target.querySelector(".photo-carousel"));
  });
})();
