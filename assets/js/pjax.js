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
      this.bindEvents();
      console.log('✅ PJAX initialized - Music will continue playing across pages');
    },
    
    // Bind click events to internal links
    bindEvents: function() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href) return;
        
        // Skip external links, mailto, anchors, etc.
        if (href.startsWith('http') || 
            href.startsWith('mailto:') || 
            href.startsWith('#') ||
            href.startsWith('javascript:')) {
          return;
        }
        
        // Check if it's an internal link
        const currentHost = window.location.host;
        const linkHost = new URL(href, window.location.origin).host;
        
        if (currentHost === linkHost) {
          e.preventDefault();
          this.loadPage(href);
        }
      });
      
      // Handle browser back/forward buttons
      window.addEventListener('popstate', (e) => {
        if (e.state && e.state.pjax) {
          this.loadPage(window.location.href, false);
        }
      });
    },
    
    // Load page content via AJAX
    loadPage: function(url, updateHistory = true) {
      console.log('🔄 Loading page:', url);
      
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
          
          // Update main content
          const currentMain = document.querySelector('.content');
          if (currentMain) {
            currentMain.innerHTML = mainContent.innerHTML;
          }
          
          // Update right sidebar (TOC, etc.)
          const currentSidebar = document.querySelector('.sidebar-right');
          if (currentSidebar && sidebarRight) {
            currentSidebar.innerHTML = sidebarRight.innerHTML;
          }
          
          // Update browser history
          if (updateHistory) {
            window.history.pushState({ pjax: true }, '', url);
          }
          
          // Re-initialize scripts that need to run on new content
          this.reinitializeScripts(doc);
          
          // Scroll to top
          window.scrollTo(0, 0);
          
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
    
    // Re-initialize scripts for new content
    reinitializeScripts: function(doc) {
      // Re-run any initialization code needed for new content
      // For example, MathJax, syntax highlighting, etc.
      
      // Re-initialize avatar preview and music controls
      if (typeof initializeAvatarAndMusic === 'function') {
        initializeAvatarAndMusic();
      }
      
      // Re-initialize any other dynamic features
      this.initializeCopyButtons();
      this.initializeHintIcons();
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
