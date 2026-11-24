// Force browser to disable automatic scroll restoration so it always starts at the top on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

window.addEventListener('beforeunload', () => {
  window.scrollTo(0, 0);
});

// Initialize Lenis Butter-Smooth Inertial Scroller
let lenis = null;
if (typeof Lenis !== "undefined") {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.8,
    infinite: false,
  });
}

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
  let lastRenderedFrameIndex = -1;
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
          lastRenderedFrameIndex = 0;
        }
      };
      img.src = currentFrame(i);
      if (i === 0 && img.complete && !isFirstRenderDone) {
        isFirstRenderDone = true;
        renderImage(img);
        lastRenderedFrameIndex = 0;
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
      lastRenderedFrameIndex = Math.round(currentFrameIndex);
    }
  }

  // Calculate target frame on scroll
  function onScroll() {
    const scrollTop = window.pageYOffset || html.scrollTop || document.body.scrollTop;
    const maxScrollTop = html.scrollHeight - window.innerHeight;

    if (maxScrollTop <= 0) return;

    const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScrollTop));
    targetFrame = scrollFraction * (frameCount - 1);
  }

  // Continuous requestAnimationFrame loop with Smooth Lerp & Smart Frame Caching
  function animationLoop() {
    currentFrameIndex += (targetFrame - currentFrameIndex) * 0.16;

    const frameToDraw = Math.max(0, Math.min(frameCount - 1, Math.round(currentFrameIndex)));

    // Only repaint canvas when the frame has actually advanced (saves 90% GPU cycles!)
    if (frameToDraw !== lastRenderedFrameIndex) {
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
        lastRenderedFrameIndex = frameToDraw;
      }
    }

    requestAnimationFrame(animationLoop);
  }

  window.addEventListener('resize', resizeCanvas);

  if (lenis) {
    lenis.on('scroll', onScroll);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

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

    // Sync Lenis with GSAP ScrollTrigger ticker for seamless 60/120fps interpolation
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }

    // Smooth Anchor Scrolling via Lenis (glides like butter to #about, #skills, #contact)
    if (lenis) {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
          const targetId = this.getAttribute('href');
          if (targetId && targetId !== '#' && document.querySelector(targetId)) {
            e.preventDefault();
            lenis.scrollTo(targetId, { offset: 0, duration: 1.15 });
          }
        });
      });
    }

    // 1. Pinned Sequential Tool Cards HUD Showcase (#skills)
    // As the user scrolls through the pinned section:
    // Only ONE card is shown at a time on the right flank, stays readable, and seamlessly cross-fades to the next card.
    // Tool 01 (CapCut Specialist) is active immediately on arrival so there is ZERO blank gap!
    // Dharshan's face on the left is 100% visible and NEVER covered at any point!
    const hudCards = gsap.utils.toArray("#skills .tool-hud-card");
    if (hudCards.length > 0 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

      // Card 01 (CapCut Specialist) is immediately visible on arrival: ZERO empty screen!
      gsap.set(hudCards[0], { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" });
      // Subsequent cards start hidden below
      if (hudCards.length > 1) {
        gsap.set(hudCards.slice(1), { opacity: 0, y: 25, scale: 0.96, pointerEvents: "none" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#skills",
          start: "top top",
          end: "+=1800",
          pin: true,
          scrub: 0.35,
          anticipatePin: 0,
          fastScrollEnd: true,
          preventOverlaps: true
        }
      });

      // Seamless sequential cross-fade: zero blank gaps between cards!
      hudCards.forEach((card, index) => {
        // Dwell: card stays fully visible for comfortable reading
        tl.to(card, {
          opacity: 1,
          duration: 0.7
        });

        if (index < hudCards.length - 1) {
          const nextCard = hudCards[index + 1];
          // Outgoing card fades out & drifts slightly up
          tl.to(card, {
            opacity: 0,
            y: -20,
            scale: 0.96,
            pointerEvents: "none",
            duration: 0.35,
            ease: "power2.in"
          })
          // Incoming card simultaneously fades in & rises to center
          .to(nextCard, {
            opacity: 1,
            y: 0,
            scale: 1,
            pointerEvents: "auto",
            duration: 0.35,
            ease: "power2.out"
          }, "<0.08"); // overlaps so card slot is NEVER empty!
        } else {
          // Last card (Card 08): stays visible until section unpins, then exits cleanly
          tl.to(card, {
            opacity: 1,
            duration: 0.5
          })
          .to(card, {
            opacity: 0,
            y: -20,
            scale: 0.96,
            duration: 0.25,
            ease: "power2.in"
          });
        }
      });
    }

    // 2. Pinned Sequential Specialized Portals HUD Showcase (#specialized-portals)
    // As the user scrolls through the pinned section:
    // Only ONE card is shown at a time on the right flank, stays readable, and seamlessly cross-fades.
    // Portal 01 is active immediately on arrival so there is ZERO blank gap!
    // Dharshan's face on the left is 100% visible and NEVER covered at any point!
    const portalCards = gsap.utils.toArray("#specialized-portals .portal-hud-card");
    if (portalCards.length > 0 && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

      // Portal 01 is immediately visible on arrival: ZERO empty screen!
      gsap.set(portalCards[0], { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" });
      if (portalCards.length > 1) {
        gsap.set(portalCards.slice(1), { opacity: 0, y: 25, scale: 0.96, pointerEvents: "none" });
      }

      const portalTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#specialized-portals",
          start: "top top",
          end: "+=800",
          pin: true,
          scrub: 0.35,
          anticipatePin: 0,
          fastScrollEnd: true,
          preventOverlaps: true
        }
      });

      // Seamless sequential cross-fade for portals
      portalCards.forEach((card, index) => {
        portalTl.to(card, {
          opacity: 1,
          duration: 0.8
        });

        if (index < portalCards.length - 1) {
          const nextCard = portalCards[index + 1];
          portalTl.to(card, {
            opacity: 0,
            y: -20,
            scale: 0.96,
            pointerEvents: "none",
            duration: 0.35,
            ease: "power2.in"
          })
          .to(nextCard, {
            opacity: 1,
            y: 0,
            scale: 1,
            pointerEvents: "auto",
            duration: 0.35,
            ease: "power2.out"
          }, "<0.08");
        } else {
          // Last portal card: stays readable until section unpins
          portalTl.to(card, {
            opacity: 1,
            duration: 0.5
          })
          .to(card, {
            opacity: 0,
            y: -20,
            scale: 0.96,
            duration: 0.25,
            ease: "power2.in"
          });
        }
      });
    }

    // Refresh ScrollTrigger so all pin spacers and measurements are frame-perfect
    ScrollTrigger.refresh();

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



