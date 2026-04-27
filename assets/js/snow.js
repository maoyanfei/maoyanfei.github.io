// Snow Effect - Interactive Implementation with Mouse/Touch Influence
// Creates falling snowflakes that respond to mouse and touch movements

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    snowflakeCount: 70,              // Number of snowflakes
    minSize: 2,                      // Minimum size in pixels
    maxSize: 8,                      // Maximum size in pixels
    fallSpeed: 1,                    // Base falling speed (pixels per frame)
    windForce: 0.03,                  // Horizontal wind force
    mouseRadius: 100,                // Mouse influence radius
    mouseForce: 10,                   // Mouse repulsion force
    friction: 0.98,                  // Velocity friction
    gravity: 0.01,                   // Gravity acceleration
    touchRadius: 200,                // Touch influence radius (larger for mobile)
    touchForce: 3                    // Touch repulsion force (stronger for mobile)
  };

  let snowContainer = null;
  let snowflakes = [];
  let isInitialized = false;
  let mouseX = -1000;
  let mouseY = -1000;
  let animationId = null;

  // Snowflake class
  class Snowflake {
    constructor() {
      this.element = document.createElement('div');
      this.element.classList.add('snowflake');
      
      // Random size
      this.size = getRandomNumber(CONFIG.minSize, CONFIG.maxSize);
      this.element.style.width = this.size + 'px';
      this.element.style.height = this.size + 'px';
      
      // Initial position
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight - window.innerHeight;
      
      // Velocity
      this.vx = getRandomNumber(-0.5, 0.5);
      this.vy = getRandomNumber(CONFIG.fallSpeed * 0.5, CONFIG.fallSpeed * 1.5);
      
      // Opacity
      this.opacity = getRandomNumber(0.3, 0.8);
      this.element.style.opacity = this.opacity;
      
      snowContainer.appendChild(this.element);
    }

    update() {
      // Apply gravity
      this.vy += CONFIG.gravity;
      
      // Apply wind
      this.vx += Math.sin(Date.now() * 0.001) * CONFIG.windForce * 0.1;
      
      // Mouse/touch interaction
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const radius = isMobileDevice() ? CONFIG.touchRadius : CONFIG.mouseRadius;
      const force = isMobileDevice() ? CONFIG.touchForce : CONFIG.mouseForce;
      
      if (distance < radius) {
        const angle = Math.atan2(dy, dx);
        const strength = (1 - distance / radius) * force;
        this.vx += Math.cos(angle) * strength;
        this.vy += Math.sin(angle) * strength;
      }
      
      // Apply friction
      this.vx *= CONFIG.friction;
      this.vy *= CONFIG.friction;
      
      // Update position
      this.x += this.vx;
      this.y += this.vy;
      
      // Boundary check - wrap around horizontally
      if (this.x < -this.size) {
        this.x = window.innerWidth + this.size;
      } else if (this.x > window.innerWidth + this.size) {
        this.x = -this.size;
      }
      
      // Reset when falls below screen
      if (this.y > window.innerHeight + this.size) {
        this.y = -this.size;
        this.x = Math.random() * window.innerWidth;
        this.vy = getRandomNumber(CONFIG.fallSpeed * 0.5, CONFIG.fallSpeed * 1.5);
        this.vx = getRandomNumber(-0.5, 0.5);
      }
      
      // Update DOM
      this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
  }

  // Initialize snow effect
  function init() {
    if (isInitialized) return;
    
    snowContainer = document.getElementById('snow-container');
    if (!snowContainer) {
      console.warn('❄️ Snow container not found');
      return;
    }

    // Check if device is mobile (reduce performance impact)
    if (isMobileDevice()) {
      console.log('📱 Mobile device detected, reducing snowflake count');
      CONFIG.snowflakeCount = 50; // Reduce for mobile
    }

    createSnowflakes();
    setupEventListeners();
    startAnimation();
    
    isInitialized = true;
    console.log('❄️ Interactive snow effect initialized with', snowflakes.length, 'snowflakes');
  }

  // Create snowflakes
  function createSnowflakes() {
    for (let i = 0; i < CONFIG.snowflakeCount; i++) {
      snowflakes.push(new Snowflake());
    }
  }

  // Setup event listeners for mouse and touch
  function setupEventListeners() {
    // Mouse move
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Touch move
    document.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    }, { passive: true });

    // Touch end - reset mouse position
    document.addEventListener('touchend', () => {
      mouseX = -1000;
      mouseY = -1000;
    });

    // Window resize
    window.addEventListener('resize', () => {
      // Snowflakes will automatically adjust on next frame
    });
  }

  // Animation loop
  function startAnimation() {
    function animate() {
      snowflakes.forEach(flake => flake.update());
      animationId = requestAnimationFrame(animate);
    }
    animate();
  }

  // Generate random number between min and max
  function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Detect mobile device
  function isMobileDevice() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    return width <= 768 || /android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) || hasTouch;
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Make it globally accessible if needed
  window.SnowEffect = { init };
})();
