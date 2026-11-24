// Force browser to disable automatic scroll restoration so it always starts at the top on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

const html = document.documentElement;
const canvas = document.getElementById("hero-lightpass");

if (canvas) {
  const context = canvas.getContext("2d");

  const frameCount = 773;
  const currentFrame = index => (
    `dharshan-frames/frame_${(index + 1).toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  let targetFrame = 0;
  let currentFrameIndex = 0;
  let isFirstRenderDone = false;

  // Ultra-smooth draw routine (no canvas resizing inside render loop)
  function renderImage(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Cover scale
    const scale = Math.max(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight);
    const drawWidth = img.naturalWidth * scale;
    const drawHeight = img.naturalHeight * scale;
    const x = (canvasWidth - drawWidth) / 2;
    const y = (canvasHeight - drawHeight) / 2;

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(img, x, y, drawWidth, drawHeight);
  }

  // Preload all frames
  const preloadImages = () => {
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.onload = () => {
        if (i === 0 && !isFirstRenderDone) {
          isFirstRenderDone = true;
          renderImage(img);
        }
      };
      img.src = currentFrame(i);
      if (i === 0 && img.complete && !isFirstRenderDone) {
        isFirstRenderDone = true;
        renderImage(img);
      }
      images.push(img);
    }
  };

  // Resize canvas only when window size changes
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const activeImage = images[Math.round(currentFrameIndex)] || images[0];
    if (activeImage && activeImage.complete) {
      renderImage(activeImage);
    }
  }

  // Calculate target frame on scroll
  function onScroll() {
    const scrollTop = html.scrollTop || document.body.scrollTop;
    const maxScrollTop = html.scrollHeight - window.innerHeight;
    
    if (maxScrollTop <= 0) return;
    
    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
    targetFrame = scrollFraction * (frameCount - 1);
  }

  // Continuous requestAnimationFrame loop with Smooth Lerp (Linear Interpolation)
  function animationLoop() {
    currentFrameIndex += (targetFrame - currentFrameIndex) * 0.18;
    
    const frameToDraw = Math.max(0, Math.min(frameCount - 1, Math.round(currentFrameIndex)));
    let img = images[frameToDraw];
    
    // If target frame is still loading, draw the nearest available loaded frame
    if (!img || !img.complete) {
      for (let offset = 1; offset <= 30; offset++) {
        const prev = frameToDraw - offset;
        if (prev >= 0 && images[prev]?.complete) {
          img = images[prev];
          break;
        }
        const next = frameToDraw + offset;
        if (next < frameCount && images[next]?.complete) {
          img = images[next];
          break;
        }
      }
    }

    if (img && img.complete) {
      renderImage(img);
    }
    
    requestAnimationFrame(animationLoop);
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial setup
  resizeCanvas();
  preloadImages();
  requestAnimationFrame(animationLoop);
}

/* ===================================================
   Custom Developer Cursor: </> with Click Blinking
   =================================================== */
const customCursor = document.getElementById("custom-cursor");
const cursorBadge = document.getElementById("cursor-badge");
const cursorFollower = document.getElementById("custom-cursor-follower");

if (customCursor && cursorFollower && window.matchMedia("(pointer: fine)").matches) {
  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let followerX = -100;
  let followerY = -100;
  let isVisible = false;

  // Track Mouse Move
  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorX = mouseX;
      cursorY = mouseY;
      followerX = mouseX;
      followerY = mouseY;
      customCursor.style.opacity = "1";
      cursorFollower.style.opacity = "1";
    }
  });

  // Hide on mouseleave, show on mouseenter
  document.addEventListener("mouseleave", () => {
    isVisible = false;
    customCursor.style.opacity = "0";
    cursorFollower.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    isVisible = true;
    customCursor.style.opacity = "1";
    cursorFollower.style.opacity = "1";
  });

  // Handle Click / Mousedown: Blink Animation & Click Ripple
  window.addEventListener("mousedown", (e) => {
    // Trigger blink animation on </> badge
    if (cursorBadge) {
      cursorBadge.classList.remove("blinking");
      // Force reflow
      void cursorBadge.offsetWidth;
      cursorBadge.classList.add("blinking");
    }

    // Spawn animated ripple ring
    const ripple = document.createElement("div");
    ripple.className = "click-ripple";
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 550);
  });

  // Smooth Cursor & Follower Animation Loop with GPU transforms & silky interpolation
  function updateCursorLoop() {
    if (isVisible) {
      // Silky-smooth lerp tracking for main </> cursor (zero jitter)
      cursorX += (mouseX - cursorX) * 0.32;
      cursorY += (mouseY - cursorY) * 0.32;
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

      // Graceful trailing follower ring
      followerX += (mouseX - followerX) * 0.14;
      followerY += (mouseY - followerY) * 0.14;
      cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(updateCursorLoop);
  }
  requestAnimationFrame(updateCursorLoop);

  // Interactive Hover Effects on Links, Buttons, Cards, Inputs
  const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], .project-card, .video-card, .filter-btn, .creative-card, .creative-badge, .creative-icon-box, .ai-card, .ai-filter-btn, .ai-tag, .ai-icon-box, .stats-card, .testimonial-card, .badge, .tag, .section-badge-pill';
  
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      customCursor.classList.add("hovering");
      cursorFollower.classList.add("hovering");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelectors)) {
      customCursor.classList.remove("hovering");
      cursorFollower.classList.remove("hovering");
    }
  });
}

/* ===================================================
   GSAP & ScrollTrigger Animations & Category Filters
   =================================================== */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Sequential Appear & Disappear Scroll Animation for Creative Editing Toolkit (#skills)
    // As the user scrolls down, each tool card appears smoothly from bottom, stays visible in the center,
    // and then disappears completely as you scroll past it, leaving Dharshan's face 100% visible and unobstructed!
    const toolStepContainers = document.querySelectorAll(".tool-step-container");
    if (toolStepContainers.length > 0 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      toolStepContainers.forEach((step) => {
        const card = step.querySelector(".tool-step-card");
        if (!card) return;

        gsap.timeline({
          scrollTrigger: {
            trigger: step,
            start: "top 85%",
            end: "bottom 15%",
            scrub: 1,
          }
        })
        .fromTo(card, 
          { opacity: 0, y: 70, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 0.28 }
        )
        .to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.44 // stays completely visible and readable in focus zone
        })
        .to(card, {
          opacity: 0,
          y: -70,
          scale: 0.94,
          ease: "power2.in",
          duration: 0.28 // disappears completely!
        });
      });
    }

    // Skills Section Header Intro Fade-out
    const introPanel = document.querySelector(".skills-intro-panel");
    if (introPanel && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.to(introPanel, {
        scrollTrigger: {
          trigger: introPanel,
          start: "top 70%",
          end: "bottom 20%",
          scrub: 1
        },
        opacity: 0,
        y: -50,
        ease: "power1.in"
      });
    }

    // Specialized Portals Fade Animation
    if (document.querySelector("#specialized-portals") && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      gsap.fromTo("#specialized-portals .grid > div", 
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#specialized-portals",
            start: "top 85%",
            end: "center 50%",
            scrub: 1
          }
        }
      );
    }

    // 3. Subtle 3D Card Tilt Interaction for Creative & AI Cards
    if (window.matchMedia("(pointer: fine)").matches) {
      const tiltCards = document.querySelectorAll(".creative-card, .ai-card");
      tiltCards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const rotateX = -(y / (rect.height / 2)) * 4.5;
          const rotateY = (x / (rect.width / 2)) * 4.5;

          gsap.to(card, {
            rotateX: rotateX,
            rotateY: rotateY,
            transformPerspective: 1000,
            ease: "power1.out",
            duration: 0.25
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            ease: "power2.out",
            duration: 0.45
          });
        });
      });
    }
  }

  // 4. Interactive Category Filtering for AI Tools
  const filterButtons = document.querySelectorAll(".ai-filter-btn");
  const categoryGroups = document.querySelectorAll(".ai-category-group");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      categoryGroups.forEach(group => {
        const groupCategory = group.getAttribute("data-group");
        if (filterValue === "all" || filterValue === groupCategory) {
          group.style.display = "block";
          if (typeof gsap !== "undefined") {
            gsap.fromTo(group, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
          }
        } else {
          group.style.display = "none";
        }
      });

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  });

  window.addEventListener("load", () => {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
});



