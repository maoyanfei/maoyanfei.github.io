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
