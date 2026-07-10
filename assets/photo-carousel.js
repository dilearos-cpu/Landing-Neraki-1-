(function () {
  var MOBILE_BREAKPOINT = 767;
  var MOBILE_SLIDES = 2;
  var SLIDE_GAP = 10;

  function getVisibleCount(section, slideCount) {
    var desktopCount = Number(section.dataset.slidesPerView || 1);
    var requested = window.innerWidth <= MOBILE_BREAKPOINT ? MOBILE_SLIDES : desktopCount;
    return Math.max(1, Math.min(requested, 4, slideCount));
  }

  function getGap(track) {
    var gapValue = window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || SLIDE_GAP + "px";
    var parsed = parseFloat(gapValue);
    return Number.isFinite(parsed) ? parsed : SLIDE_GAP;
  }

  function destroyCarousel(section) {
    if (section && typeof section._photoCarouselDestroy === "function") {
      section._photoCarouselDestroy();
      section._photoCarouselDestroy = null;
    }
  }

  function whenViewportReady(viewport, callback) {
    var attempts = 0;

    function check() {
      attempts += 1;
      if (viewport.getBoundingClientRect().width > 0 || attempts > 30) {
        callback();
        return;
      }
      requestAnimationFrame(check);
    }

    check();
  }

  function initCarousel(section) {
    if (!section) {
      return;
    }

    destroyCarousel(section);

    var viewport = section.querySelector(".photo-carousel__viewport");
    var track = section.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(section.querySelectorAll("[data-carousel-slide]"));

    if (!viewport || !track || !slides.length) {
      return;
    }

    var dotsContainer = section.querySelector("[data-carousel-dots]");
    var autoplaySpeed = Number(section.dataset.autoplaySpeed || 4000);
    var pauseOnHover = section.dataset.pauseOnHover === "true";
    var currentIndex = 0;
    var timer = null;
    var isHovered = false;
    var resizeObserver = null;

    function applyVisibleCount() {
      var visibleCount = getVisibleCount(section, slides.length);
      viewport.style.setProperty("--slides-per-view", String(visibleCount));
      return visibleCount;
    }

    function getMaxIndex(visibleCount) {
      return Math.max(0, slides.length - visibleCount);
    }

    function getPageCount(visibleCount) {
      return getMaxIndex(visibleCount) + 1;
    }

    function getStepSize() {
      var visibleCount = applyVisibleCount();
      var viewportWidth = viewport.getBoundingClientRect().width;
      var gap = getGap(track);
      var slideWidth = (viewportWidth - gap * (visibleCount - 1)) / visibleCount;
      return slideWidth + gap;
    }

    function updateTransform() {
      var visibleCount = applyVisibleCount();
      var maxIndex = getMaxIndex(visibleCount);

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      var offset = currentIndex * getStepSize();
      track.style.transform = "translate3d(-" + offset + "px, 0, 0)";

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
      var html = "";

      for (var index = 0; index < pageCount; index += 1) {
        html +=
          '<button type="button" class="photo-carousel__dot' +
          (index === currentIndex ? " is-active" : "") +
          '" data-dot-index="' +
          index +
          '" aria-label="Ir a la pagina ' +
          (index + 1) +
          '"></button>';
      }

      dotsContainer.innerHTML = html;
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

    function refreshCarousel() {
      renderDots();
      updateTransform();
      startAutoplay();
    }

    function onSectionClick(event) {
      if (event.target.closest("[data-carousel-prev]")) {
        event.preventDefault();
        prevSlide();
        startAutoplay();
        return;
      }

      if (event.target.closest("[data-carousel-next]")) {
        event.preventDefault();
        nextSlide();
        startAutoplay();
        return;
      }

      var dot = event.target.closest("[data-dot-index]");
      if (dot) {
        event.preventDefault();
        goTo(Number(dot.dataset.dotIndex));
        startAutoplay();
      }
    }

    function onResize() {
      refreshCarousel();
    }

    section.addEventListener("click", onSectionClick);

    if (pauseOnHover) {
      section.addEventListener("mouseenter", function () {
        isHovered = true;
      });
      section.addEventListener("mouseleave", function () {
        isHovered = false;
      });
    }

    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(viewport);
    } else {
      window.addEventListener("resize", onResize);
    }

    section._photoCarouselDestroy = function () {
      stopAutoplay();
      section.removeEventListener("click", onSectionClick);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", onResize);
      }
    };

    whenViewportReady(viewport, refreshCarousel);
  }

  function initAllCarousels(root) {
    var scope = root || document;
    scope.querySelectorAll(".photo-carousel").forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initAllCarousels();
    });
  } else {
    initAllCarousels();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initAllCarousels(event.target);
  });

  document.addEventListener("shopify:section:unload", function (event) {
    var carousel = event.target.querySelector(".photo-carousel");
    destroyCarousel(carousel);
  });
})();
