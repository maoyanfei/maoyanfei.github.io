// Avatar Preview Modal and Background Music Functionality
document.addEventListener('DOMContentLoaded', function() {
  const avatarTrigger = document.getElementById('avatar-preview-trigger');
  const avatarModal = document.getElementById('avatar-modal');
  const modalClose = document.querySelector('.avatar-modal-close');
  const avatarContainer = document.getElementById('avatar-container');
  const playButton = document.getElementById('avatar-play-button');
  const backgroundMusic = document.getElementById('background-music');
  
  // Background Music Auto Play
  if (backgroundMusic) {
    // Try to autoplay music
    const playPromise = backgroundMusic.play();
    
    if (playPromise !== undefined) {
      playPromise.then(_ => {
        // Autoplay started successfully
        console.log('Background music started playing');
      }).catch(error => {
        // Autoplay was prevented
        console.log('Autoplay prevented, waiting for user interaction');
        // Add a one-time click listener to start music
        document.addEventListener('click', function startMusic() {
          backgroundMusic.play().then(() => {
            console.log('Background music started after user interaction');
          }).catch(e => console.error('Failed to play music:', e));
          document.removeEventListener('click', startMusic);
        }, { once: true });
      });
    }
  }
  
  if (avatarTrigger && avatarModal) {
    // Open modal when avatar is clicked
    avatarTrigger.addEventListener('click', function() {
      avatarModal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    });
    
    // Close modal when close button is clicked
    modalClose.addEventListener('click', function() {
      avatarModal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close modal when clicking outside the image
    avatarModal.addEventListener('click', function(event) {
      if (event.target === avatarModal) {
        avatarModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && avatarModal.style.display === 'block') {
        avatarModal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  }
  
  // Avatar rotation and music control
  if (avatarContainer && playButton) {
    const avatarImage = avatarContainer.querySelector('.avatar-image');
    const playIcon = playButton.querySelector('.play-icon');
    const pauseIcon = playButton.querySelector('.pause-icon');
    let isPlaying = true;
    
    // 初始化：因为图片默认在旋转，音乐也在播放，所以显示暂停图标
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'inline';
    
    playButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      
      if (isPlaying) {
        // Pause rotation and music
        avatarImage.style.setProperty('animation-play-state', 'paused', 'important');
        if (backgroundMusic) {
          backgroundMusic.pause();
        }
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        isPlaying = false;
        console.log('Avatar rotation and music paused');
      } else {
        // Resume rotation and music
        avatarImage.style.setProperty('animation-play-state', 'running', 'important');
        if (backgroundMusic) {
          backgroundMusic.play().catch(e => console.error('Failed to play music:', e));
        }
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        isPlaying = true;
        console.log('Avatar rotation and music resumed');
      }
    });
  }
});
