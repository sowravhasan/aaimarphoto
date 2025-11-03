// Enhanced Full Screen Vertical Slider with improved animations
(function ($) {
  "use strict";

  // Configuration
  const config = {
    autoSlide: true,
    autoSlideDelay: 4000,
    transitionDuration: 1000,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    touchSensitivity: 50,
    keyboardNavigation: true,
    wheelSensitivity: 1,
  };

  // State management
  let state = {
    currentSlide: 0,
    totalSlides: 0,
    isAnimating: false,
    autoSlideTimer: null,
    lastWheelTime: 0,
    wheelTimeout: null,
    touchStartY: 0,
    touchEndY: 0,
    isTouch: false,
  };

  // DOM elements
  let elements = {
    slides: null,
    pagination: null,
    paginationItems: null,
    body: null,
    wrapper: null,
  };

  // Initialize the slider
  function init() {
    cacheElements();
    if (elements.slides.length === 0) return;

    setupSlider();
    setupPagination();
    setupEventListeners();
    startAutoSlide();

    // Mark as loaded with smooth transition
    setTimeout(() => {
      elements.wrapper.addClass("loaded");
    }, 100);

    console.log("FSVS Enhanced: Initialized with", state.totalSlides, "slides");
  }

  // Cache DOM elements
  function cacheElements() {
    elements.slides = $("#fsvs-body .slide");
    elements.pagination = $("#fsvs-pagination");
    elements.paginationItems = $("#fsvs-pagination li");
    elements.body = $("body");
    elements.wrapper = $(".fusion-wrapper");

    state.totalSlides = elements.slides.length;
  }

  // Setup slider initial state
  function setupSlider() {
    elements.slides.each(function (index) {
      const $slide = $(this);

      if (index === 0) {
        $slide.addClass("active").css({
          opacity: 1,
          "z-index": 2,
          transform: "translateY(0)",
        });
      } else {
        $slide.css({
          opacity: 0,
          "z-index": 1,
          transform: "translateY(100%)",
        });
      }

      // Preload background images for smoother transitions
      const bgImage = $slide.css("background-image");
      if (bgImage && bgImage !== "none") {
        const imageUrl = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/, "$1");
        const img = new Image();
        img.src = imageUrl;
      }
    });
  }

  // Setup pagination
  function setupPagination() {
    // Check if pagination exists, if not, skip pagination setup
    if (
      elements.pagination.length === 0 ||
      elements.paginationItems.length === 0
    ) {
      console.log(
        "FSVS Enhanced: No pagination found, running without pagination dots"
      );
      return;
    }

    if (elements.paginationItems.length !== state.totalSlides) {
      console.warn("FSVS Enhanced: Pagination items count mismatch");
      return;
    }

    elements.paginationItems.each(function (index) {
      $(this)
        .off("click")
        .on("click", function (e) {
          e.preventDefault();
          if (!state.isAnimating && index !== state.currentSlide) {
            goToSlide(index);
          }
        });
    });

    updatePagination();
  }

  // Enhanced slide transition with improved easing
  function goToSlide(targetIndex, direction = null) {
    if (state.isAnimating || targetIndex === state.currentSlide) return;

    state.isAnimating = true;
    stopAutoSlide();

    const $currentSlide = elements.slides.eq(state.currentSlide);
    const $targetSlide = elements.slides.eq(targetIndex);

    // Determine direction if not specified
    if (direction === null) {
      direction = targetIndex > state.currentSlide ? "down" : "up";
    }

    // Set initial position for target slide
    const initialTransform =
      direction === "down" ? "translateY(100%)" : "translateY(-100%)";
    const exitTransform =
      direction === "down" ? "translateY(-100%)" : "translateY(100%)";

    $targetSlide.css({
      transform: initialTransform,
      opacity: 1,
      "z-index": 3,
    });

    // Force reflow
    $targetSlide[0].offsetHeight;

    // Animate transitions with improved timing
    $currentSlide.css({
      transition: `all ${config.transitionDuration}ms ${config.easing}`,
      transform: exitTransform,
      opacity: 0.3,
    });

    $targetSlide.css({
      transition: `all ${config.transitionDuration}ms ${config.easing}`,
      transform: "translateY(0)",
      opacity: 1,
    });

    // Update state and UI
    state.currentSlide = targetIndex;
    updatePagination();

    // Clean up after animation
    setTimeout(() => {
      elements.slides.removeClass("active").css({
        "z-index": 1,
        transition: "none",
      });

      $targetSlide.addClass("active").css({
        "z-index": 2,
        transition: "none",
      });

      // Reset non-active slides
      elements.slides.not($targetSlide).css({
        opacity: 0,
        transform:
          direction === "down" ? "translateY(100%)" : "translateY(-100%)",
      });

      state.isAnimating = false;
      startAutoSlide();
    }, config.transitionDuration);
  }

  // Update pagination state
  function updatePagination() {
    // Only update pagination if it exists
    if (elements.paginationItems.length > 0) {
      elements.paginationItems.removeClass("active");
      elements.paginationItems.eq(state.currentSlide).addClass("active");
    }
  }

  // Navigation functions
  function nextSlide() {
    const nextIndex = (state.currentSlide + 1) % state.totalSlides;
    goToSlide(nextIndex, "down");
  }

  function prevSlide() {
    const prevIndex =
      state.currentSlide === 0 ? state.totalSlides - 1 : state.currentSlide - 1;
    goToSlide(prevIndex, "up");
  }

  // Auto-slide functionality
  function startAutoSlide() {
    if (!config.autoSlide) return;

    stopAutoSlide();
    state.autoSlideTimer = setTimeout(() => {
      if (!state.isAnimating) {
        nextSlide();
      }
    }, config.autoSlideDelay);
  }

  function stopAutoSlide() {
    if (state.autoSlideTimer) {
      clearTimeout(state.autoSlideTimer);
      state.autoSlideTimer = null;
    }
  }

  // Enhanced event listeners
  function setupEventListeners() {
    // Mouse wheel with improved throttling
    $(window).on("wheel", function (e) {
      e.preventDefault();

      const now = Date.now();
      if (now - state.lastWheelTime < 100) return; // Throttle

      state.lastWheelTime = now;

      clearTimeout(state.wheelTimeout);
      state.wheelTimeout = setTimeout(() => {
        if (state.isAnimating) return;

        const delta = e.originalEvent.deltaY * config.wheelSensitivity;

        if (delta > 0) {
          nextSlide();
        } else if (delta < 0) {
          prevSlide();
        }
      }, 50);
    });

    // Enhanced keyboard navigation
    if (config.keyboardNavigation) {
      $(document).on("keydown", function (e) {
        if (state.isAnimating) return;

        switch (e.which) {
          case 38: // Up arrow
          case 33: // Page Up
            e.preventDefault();
            prevSlide();
            break;
          case 40: // Down arrow
          case 34: // Page Down
            e.preventDefault();
            nextSlide();
            break;
          case 36: // Home
            e.preventDefault();
            goToSlide(0);
            break;
          case 35: // End
            e.preventDefault();
            goToSlide(state.totalSlides - 1);
            break;
        }
      });
    }

    // Enhanced touch support
    let touchStartTime = 0;

    $(document).on("touchstart", function (e) {
      state.isTouch = true;
      state.touchStartY = e.originalEvent.touches[0].clientY;
      touchStartTime = Date.now();
      stopAutoSlide();
    });

    $(document).on("touchmove", function (e) {
      if (!state.isTouch) return;
      e.preventDefault(); // Prevent scrolling
    });

    $(document).on("touchend", function (e) {
      if (!state.isTouch) return;

      state.isTouch = false;
      state.touchEndY = e.originalEvent.changedTouches[0].clientY;

      const touchDuration = Date.now() - touchStartTime;
      const touchDistance = Math.abs(state.touchStartY - state.touchEndY);

      // Only trigger if touch was quick and had sufficient distance
      if (touchDuration < 500 && touchDistance > config.touchSensitivity) {
        if (state.touchStartY > state.touchEndY) {
          nextSlide();
        } else {
          prevSlide();
        }
      } else {
        startAutoSlide();
      }
    });

    // Pause auto-slide on hover (only if pagination exists)
    if (elements.pagination.length > 0) {
      elements.pagination.on("mouseenter", stopAutoSlide);
      elements.pagination.on("mouseleave", startAutoSlide);
    }

    // Resume auto-slide when window gains focus
    $(window).on("focus", startAutoSlide);
    $(window).on("blur", stopAutoSlide);

    // Handle visibility change
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoSlide();
      } else {
        startAutoSlide();
      }
    });

    // Responsive handling
    $(window).on(
      "resize",
      debounce(function () {
        // Recalculate positions if needed
        setupSlider();
      }, 250)
    );
  }

  // Mobile menu functionality
  function initMobileMenu() {
    // Handle custom hamburger menu toggle
    $("#mobile-menu-toggle").on("click", function (e) {
      e.preventDefault();

      const $toggle = $(this);
      const $menu = $("#main-menu");
      const isOpen = $toggle.hasClass("active");

      $toggle.toggleClass("active");
      $menu.toggleClass("mobile-open");

      // Prevent body scroll when menu is open
      if (!isOpen) {
        $("body").addClass("menu-open");

        // Close menu when clicking outside
        setTimeout(() => {
          $(document).one("click", function (e) {
            if (!$(e.target).closest(".fusion-header-wrapper").length) {
              $toggle.removeClass("active");
              $menu.removeClass("mobile-open");
              $("body").removeClass("menu-open");
            }
          });
        }, 100);
      } else {
        $("body").removeClass("menu-open");
      }
    });

    // Handle WordPress theme mobile toggle as fallback
    $(".awb-menu__m-toggle").on("click", function (e) {
      e.preventDefault();

      const $toggle = $(this);
      const $menu = $(".awb-menu__main-ul");
      const isOpen = $toggle.attr("aria-expanded") === "true";

      $toggle.attr("aria-expanded", !isOpen);
      $menu.toggleClass("mobile-open");

      // Close menu when clicking outside
      if (!isOpen) {
        $(document).one("click", function (e) {
          if (!$(e.target).closest(".awb-menu").length) {
            $toggle.attr("aria-expanded", "false");
            $menu.removeClass("mobile-open");
          }
        });
      }
    });

    // Close mobile menu on window resize
    $(window).on("resize", function () {
      if ($(window).width() > 768) {
        $("#mobile-menu-toggle").removeClass("active");
        $("#main-menu").removeClass("mobile-open");
        $(".awb-menu__m-toggle").attr("aria-expanded", "false");
        $(".awb-menu__main-ul").removeClass("mobile-open");
        $("body").removeClass("menu-open");
      }
    });

    // Close menu when clicking on menu items (for mobile)
    $(".awb-menu__main-a").on("click", function () {
      if ($(window).width() <= 768) {
        $("#mobile-menu-toggle").removeClass("active");
        $("#main-menu").removeClass("mobile-open");
        $("body").removeClass("menu-open");
      }
    });
  }

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Preload images for better performance
  function preloadImages() {
    elements.slides.each(function () {
      const bgImage = $(this).css("background-image");
      if (bgImage && bgImage !== "none") {
        const imageUrl = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/, "$1");
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = imageUrl;
        document.head.appendChild(link);
      }
    });
  }

  // Public API
  window.FSVS = {
    goToSlide: goToSlide,
    nextSlide: nextSlide,
    prevSlide: prevSlide,
    getCurrentSlide: () => state.currentSlide,
    getTotalSlides: () => state.totalSlides,
    pause: stopAutoSlide,
    resume: startAutoSlide,
    isAnimating: () => state.isAnimating,
  };

  // Initialize when DOM is ready
  $(document).ready(function () {
    // Add loaded class to body for CSS transitions
    setTimeout(() => {
      $("body").addClass("loaded");
    }, 100);

    init();
    initMobileMenu();
    preloadImages();

    // Initialize with smooth fade-in
    elements.wrapper.css("opacity", 0);
    setTimeout(() => {
      elements.wrapper.css("transition", "opacity 0.8s ease");
      elements.wrapper.css("opacity", 1);
    }, 200);
  });
})(jQuery);
