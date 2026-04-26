// Lightweight PJAX implementation for seamless page transitions
// This keeps the audio player alive across page navigations

(function() {
  'use strict';
  
  // Check if browser supports required APIs
  if (!window.history || !window.history.pushState || !window.fetch) {
    console.log('PJAX not supported, using normal navigation');
    return;
  }
  
  const pjax = {
    // Initialize PJAX
    init: function() {
      this.disableAutoScrollRestoration();
      this.bindEvents();
      this.bindGlobalEvents();
      console.log('✅ PJAX initialized - Music will continue playing across pages');
    },
    
    // Disable browser's automatic scroll restoration
    disableAutoScrollRestoration: function() {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
        console.log('🔒 Disabled automatic scroll restoration');
      }
    },
    
    // Bind global events that should persist across page loads
    bindGlobalEvents: function() {
      // Event delegation for hint icons
      document.addEventListener('click', (e) => {
        const hintIcon = e.target.closest('.hint-icon');
        if (hintIcon) {
          e.stopPropagation();
          const hintText = hintIcon.nextElementSibling;
          if (hintText && hintText.classList.contains('hint-text')) {
            hintText.classList.toggle('show');
          }
        }
      });
      
      // Close hints when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.hint-icon')) {
          const allHints = document.querySelectorAll('.hint-text.show');
          allHints.forEach(hint => {
            hint.classList.remove('show');
          });
        }
      });
    },
    
    // Bind click events to internal links
    bindEvents: function() {
      // Use both click and touchend for better mobile support
      const handleLinkClick = (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        console.log('🔗 Link clicked:', href, 'Event type:', e.type);
        
        // Skip QR code links (handled by qr-code-modal.js)
        if (link.hasAttribute('data-qr-code')) {
          console.log('⏭️ Skipping QR code link');
          return;
        }
        
        // Skip external links, mailto, anchors, etc.
        if (href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('#') ||
            href.startsWith('javascript:')) {
          console.log('⏭️ Skipping non-internal link');
          return;
        }
        
        // Check if it's an internal link
        try {
          const currentHost = window.location.host;
          const linkUrl = new URL(href, window.location.origin);
          const linkHost = linkUrl.host;
          
          if (currentHost === linkHost) {
            e.preventDefault();
            console.log('✅ PJAX loading:', href);
            this.loadPage(href);
          } else {
            console.log('⏭️ Different host, normal navigation');
          }
        } catch (error) {
          console.error('❌ URL parsing error:', error);
        }
      };
      
      // Bind to document for event delegation with capture phase
      document.addEventListener('click', handleLinkClick, { capture: true });
      
      // Also bind touchend for better mobile responsiveness
      document.addEventListener('touchend', (e) => {
        const touchTarget = e.target.closest('a');
        if (touchTarget) {
          const href = touchTarget.getAttribute('href');
          
          // Skip QR code links
          if (touchTarget.hasAttribute('data-qr-code')) {
            console.log('⏭️ Skipping QR code link on touch');
            return;
          }
          
          // Check if it's an internal link before preventing default
          if (href && !href.startsWith('http') && !href.startsWith('mailto:') && 
              !href.startsWith('#') && !href.startsWith('javascript:')) {
            // Prevent the default navigation for internal links
            e.preventDefault();
            console.log('👆 Touch event intercepted for:', href);
            
            // Create a synthetic click event
            const clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            touchTarget.dispatchEvent(clickEvent);
          }
        }
      }, { passive: false, capture: true });
      
      console.log('✅ PJAX link handlers bound successfully');
      
      // Handle browser back/forward buttons
      window.addEventListener('popstate', (e) => {
        if (e.state && e.state.pjax) {
          const scrollPosition = e.state.scrollPosition || 0;
          const isMobile = this.isMobileDevice();
          
          console.log('⬅️ Popstate triggered, saved position:', scrollPosition, 'Is mobile:', isMobile);
          
          this.loadPage(window.location.href, false);
          
          // Only restore scroll on desktop for back/forward navigation
          if (!isMobile) {
            setTimeout(() => {
              window.scrollTo(0, scrollPosition);
              console.log('💻 Restored scroll position from history:', scrollPosition);
            }, 100);
          } else {
            console.log('📱 Mobile: Letting browser handle scroll naturally');
          }
        }
      });
    },
    
    // Load page content via AJAX
    loadPage: function(url, updateHistory = true) {
      console.log('🔄 Loading page:', url);
      
      // Save current scroll position before loading new content
      const savedScrollPosition = window.scrollY || window.pageYOffset;
      const isMobile = this.isMobileDevice();
      
      console.log('📍 Current scroll position:', savedScrollPosition, 'Is mobile:', isMobile);
      
      // Show loading indicator (optional)
      this.showLoading();
      
      fetch(url, {
        headers: {
          'X-PJAX': 'true',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(html => {
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Extract content
        const title = doc.querySelector('title');
        const mainContent = doc.querySelector('.content');
        const sidebarRight = doc.querySelector('.sidebar-right');
        
        if (mainContent) {
          // Update page title
          if (title) {
            document.title = title.textContent;
          }
          
          // For mobile devices, preserve scroll position by updating content differently
          if (isMobile) {
            // Mobile: Use a gentler update method to preserve scroll
            this.updateContentPreservingScroll(document.querySelector('.content'), mainContent);
            
            // Update right sidebar
            const currentSidebar = document.querySelector('.sidebar-right');
            if (currentSidebar && sidebarRight) {
              currentSidebar.innerHTML = sidebarRight.innerHTML;
            }
          } else {
            // Desktop: Normal update
            const currentMain = document.querySelector('.content');
            if (currentMain) {
              currentMain.innerHTML = mainContent.innerHTML;
            }
            
            // Update right sidebar (TOC, etc.)
            const currentSidebar = document.querySelector('.sidebar-right');
            if (currentSidebar && sidebarRight) {
              currentSidebar.innerHTML = sidebarRight.innerHTML;
            }
          }
          
          // Update browser history
          if (updateHistory) {
            window.history.pushState({ pjax: true, scrollPosition: savedScrollPosition }, '', url);
          }
          
          // Re-initialize scripts that need to run on new content
          this.reinitializeScripts(doc);
          
          // Handle scroll position - only scroll to top on desktop
          if (!isMobile) {
            // On desktop, scroll to top for better UX
            window.scrollTo(0, 0);
            console.log('💻 Desktop: Scrolled to top');
          } else {
            // On mobile, do NOT scroll at all - keep current position
            console.log('📱 Mobile: Keeping scroll position at', savedScrollPosition);
          }
          
          console.log('✅ Page loaded successfully');
        } else {
          throw new Error('Could not find main content');
        }
      })
      .catch(error => {
        console.error('❌ PJAX error:', error);
        // Fallback to normal navigation
        window.location.href = url;
      })
      .finally(() => {
        this.hideLoading();
      });
    },
    
    // Detect if device is mobile
    isMobileDevice: function() {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      let isMobile = false;
      let reason = '';
      
      // Check by screen width
      if (width <= 768) {
        isMobile = true;
        reason = `Width: ${width}px`;
      }
      
      // Check by user agent
      if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent)) {
        isMobile = true;
        reason = reason ? reason + ', UserAgent' : 'UserAgent';
      }
      
      // Check for touch capability
      if (hasTouch) {
        isMobile = true;
        reason = reason ? reason + ', Touch' : 'Touch';
      }
      
      console.log('🔍 Device detection:', {
        width: width,
        userAgent: userAgent.substring(0, 50),
        hasTouch: hasTouch,
        isMobile: isMobile,
        reason: reason || 'Desktop'
      });
      
      return isMobile;
    },

    // Update content while preserving scroll position on mobile
    updateContentPreservingScroll: function(currentContainer, newContent) {
      if (!currentContainer) return;
      
      // Save current scroll position
      const scrollPos = window.scrollY || window.pageYOffset;
      
      // Clear existing content
      while (currentContainer.firstChild) {
        currentContainer.removeChild(currentContainer.firstChild);
      }
      
      // Clone and append new content nodes
      const fragment = document.createDocumentFragment();
      Array.from(newContent.childNodes).forEach(node => {
        fragment.appendChild(node.cloneNode(true));
      });
      currentContainer.appendChild(fragment);
      
      // Restore scroll position immediately
      window.scrollTo(0, scrollPos);
      
      console.log('📱 Content updated with scroll preservation at:', scrollPos);
    },
    
    // Re-initialize scripts for new content
    reinitializeScripts: function(doc) {
      // Re-run any initialization code needed for new content
      // For example, MathJax, syntax highlighting, etc.
      
      // Re-initialize avatar preview and music controls
      if (typeof initializeAvatarAndMusic === 'function') {
        initializeAvatarAndMusic();
      }
      
      // Re-initialize QR code modal
      if (typeof initializeQRCodeModal === 'function') {
        initializeQRCodeModal();
      }
      
      // Re-initialize any other dynamic features
      this.initializeCopyButtons();
      // Note: Hint icons use event delegation, no need to re-initialize
    },
    
    // Re-initialize copy buttons
    initializeCopyButtons: function() {
      const copyableTexts = document.querySelectorAll('.copyable-text');
      copyableTexts.forEach(element => {
        // Remove old event listeners by cloning
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        newElement.addEventListener('click', function(e) {
          const text = this.getAttribute('data-value');
          const hintId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
              showHint(hintId);
            }).catch(err => {
              console.error('Copy failed:', err);
            });
          }
        });
      });
    },

    // Re-initialize hint icons
    initializeHintIcons: function() {
      const hintIcons = document.querySelectorAll('.hint-icon');
      hintIcons.forEach(icon => {
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        newIcon.addEventListener('click', function(event) {
          event.stopPropagation();
          const hintText = this.nextElementSibling;
          if (hintText) {
            hintText.classList.toggle('show');
          }
        });
      });
    },
    
    // Show loading indicator
    showLoading: function() {
      // Optional: Add a loading spinner
      document.body.style.cursor = 'wait';
    },
    
    // Hide loading indicator
    hideLoading: function() {
      document.body.style.cursor = '';
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => pjax.init());
  } else {
    pjax.init();
  }
  
  // Make it globally accessible if needed
  window.PJAX = pjax;
})();
