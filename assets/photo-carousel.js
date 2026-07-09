(function () {
  function initCarousel(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    var track = section.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(section.querySelectorAll("[data-carousel-slide]"));

    if (!track || !slides.length) {
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

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + currentIndex * 100 + "%)";

      if (dotsContainer) {
        Array.prototype.forEach.call(dotsContainer.children, function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === currentIndex);
        });
      }
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
      if (slides.length < 2) {
        return;
      }
      timer = setInterval(function () {
        if (!pauseOnHover || !isHovered) {
          nextSlide();
        }
      }, autoplaySpeed);
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map(function (_, index) {
        return '<button type="button" class="photo-carousel__dot' + (index === 0 ? " is-active" : "") + '" data-dot-index="' + index + '" aria-label="Ir a la imagen ' + (index + 1) + '"></button>';
      }).join("");

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
