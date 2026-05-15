// Avatar Preview Modal and Background Music Functionality
// This function can be called multiple times for PJAX navigation
function initializeAvatarAndMusic() {
  const avatarTrigger = document.getElementById('avatar-preview-trigger');
  const avatarModal = document.getElementById('avatar-modal');
  const modalClose = document.querySelector('.avatar-modal-close');
  const avatarContainer = document.getElementById('avatar-container');
  const playButton = document.getElementById('avatar-play-button');
  const backgroundMusic = document.getElementById('background-music');
  
  // If music element doesn't exist, skip initialization
  if (!backgroundMusic) {
    console.log('⚠️ Background music element not found');
    return;
  }
  
  // Only initialize once - check if already initialized
  if (backgroundMusic.dataset.initialized === 'true') {
    console.log('ℹ️ Music player already initialized');
    return;
  }
  
  // Mark as initialized
  backgroundMusic.dataset.initialized = 'true';
  
  // Background Music Setup
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.5;
  
  console.log('🎵 Background music initialized');
  
  // Helper function to update play button state
  function updatePlayButtonState(isPlaying) {
    if (playButton) {
      const playIcon = playButton.querySelector('.play-icon');
      const pauseIcon = playButton.querySelector('.pause-icon');
      
      if (isPlaying) {
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'inline';
      } else {
        if (playIcon) playIcon.style.display = 'inline';
        if (pauseIcon) pauseIcon.style.display = 'none';
      }
    }
  }
  
  // Avatar Modal Functionality
  if (avatarTrigger && avatarModal) {
    avatarTrigger.addEventListener('click', function() {
      avatarModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });
    
    if (modalClose) {
      modalClose.addEventListener('click', function() {
        avatarModal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    
    avatarModal.addEventListener('click', function(event) {
      if (event.target === avatarModal) {
        avatarModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && avatarModal.style.display === 'block') {
        avatarModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
  
  // Music Control
  if (avatarContainer && playButton) {
    const avatarImage = avatarContainer.querySelector('.avatar-image');
    let isPlaying = false;
    
    // Hide play button initially
    playButton.style.display = 'none';
    
    // Show play button when audio is ready
    if (backgroundMusic.readyState >= 2) {
      playButton.style.display = 'flex';
      avatarImage.style.setProperty('animation-play-state', 'running', 'important');
      console.log('✅ Audio ready, controls enabled');
    } else {
      backgroundMusic.addEventListener('canplaythrough', function() {
        playButton.style.display = 'flex';
        avatarImage.style.setProperty('animation-play-state', 'running', 'important');
        console.log('✅ Audio loaded, controls enabled');
      }, { once: true });
      
      backgroundMusic.addEventListener('error', function(e) {
        console.error('❌ Audio load error:', backgroundMusic.error?.code || 'unknown');
        playButton.style.display = 'none';
        avatarImage.style.setProperty('animation-play-state', 'paused', 'important');
      }, { once: true });
    }
    
    // Play/Pause button click handler
    playButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      
      if (isPlaying) {
        // Pause music
        backgroundMusic.pause();
        updatePlayButtonState(false);
        isPlaying = false;
        console.log('⏸️ Music paused');
      } else {
        // Play music
        backgroundMusic.play().then(() => {
          updatePlayButtonState(true);
          isPlaying = true;
          console.log('▶️ Music playing');
        }).catch(e => {
          console.error('❌ Play failed:', e.message);
        });
      }
    });
  }
}

// Initialize on first page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAvatarAndMusic);
} else {
  initializeAvatarAndMusic();
}

// QR Code Modal Functionality
// Handle social links with qr_code attribute to show modal instead of navigating

function initializeQRCodeModal() {
  const qrModal = document.getElementById('qr-modal');
  const qrModalImage = document.querySelector('.qr-modal-image');
  const qrModalTitle = document.querySelector('.qr-modal-title');
  const qrModalClose = document.querySelector('.qr-modal-close');
  
  if (!qrModal) {
    console.log('⚠️ QR modal element not found');
    return;
  }
  
  // Remove old event listeners by removing and re-adding the data attribute
  const oldQrLinks = document.querySelectorAll('a[data-qr-code-initialized="true"]');
  oldQrLinks.forEach(link => {
    link.removeAttribute('data-qr-code-initialized');
  });
  
  // Find all social links with data-qr-code attribute
  const qrLinks = document.querySelectorAll('a[data-qr-code="true"]');
  
  console.log('🔍 Found', qrLinks.length, 'QR code links');
  
  qrLinks.forEach(link => {
    // Mark as initialized to prevent duplicate bindings
    link.setAttribute('data-qr-code-initialized', 'true');
    
    // Use capture phase to ensure this handler runs before browser navigation
    link.addEventListener('click', function(event) {
      console.log('🎯 QR link clicked:', this.getAttribute('href'));
      event.preventDefault();
      event.stopPropagation();
      
      const imageUrl = this.getAttribute('href');
      const iconElement = this.querySelector('i');
      const title = iconElement ? iconElement.getAttribute('title') : 'QR Code';
      
      // Set modal content
      qrModalImage.src = imageUrl;
      qrModalTitle.textContent = title;
      
      // Show modal
      qrModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
      
      console.log('📱 QR code modal opened for:', title);
    }, { capture: true, passive: false });
  });
  
  // Close modal when clicking the close button
  if (qrModalClose) {
    qrModalClose.addEventListener('click', function() {
      qrModal.style.display = 'none';
      document.body.style.overflow = '';
    });
  }
  
  // Close modal when clicking outside the content
  qrModal.addEventListener('click', function(event) {
    if (event.target === qrModal) {
      qrModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && qrModal.style.display === 'block') {
      qrModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeQRCodeModal);
} else {
  initializeQRCodeModal();
}
