// Avatar Preview Modal and Background Music Functionality
document.addEventListener('DOMContentLoaded', function() {
  const avatarTrigger = document.getElementById('avatar-preview-trigger');
  const avatarModal = document.getElementById('avatar-modal');
  const modalClose = document.querySelector('.avatar-modal-close');
  const avatarContainer = document.getElementById('avatar-container');
  const playButton = document.getElementById('avatar-play-button');
  const backgroundMusic = document.getElementById('background-music');
  
  // Background Music - Initial state is paused
  if (backgroundMusic) {
    // Ensure loop is set
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5; // Set volume to 50%
    
    // Add event listeners for debugging
    backgroundMusic.addEventListener('ended', function() {
      console.log('Music ended - this should not happen with loop enabled');
      // Restart music if it ended unexpectedly
      backgroundMusic.play().catch(e => console.error('Failed to restart music:', e));
    });
    
    backgroundMusic.addEventListener('error', function(e) {
      console.error('Audio error:', e);
      console.error('Error code:', backgroundMusic.error ? backgroundMusic.error.code : 'unknown');
    });
    
    backgroundMusic.addEventListener('pause', function() {
      console.log('Music paused');
    });
    
    backgroundMusic.addEventListener('play', function() {
      console.log('Music playing');
    });
    
    // Initial state: music is paused, show play icon
    console.log('Background music initialized in paused state');
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
    let isPlaying = false; // Initial state: music is paused
    
    // 初始化：隐藏播放按钮，等待音频加载完成
    playButton.style.display = 'none';
    
    // 监听音频加载完成事件
    if (backgroundMusic) {
      // 如果音频已经加载完成（可能已缓存）
      if (backgroundMusic.readyState >= 2) {
        playButton.style.display = 'flex';
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        // 音频已加载，开始旋转头像
        avatarImage.style.setProperty('animation-play-state', 'running', 'important');
        console.log('Background music already loaded, avatar rotation started');
      } else {
        // 监听 canplaythrough 事件，表示音频已完全加载可以流畅播放
        backgroundMusic.addEventListener('canplaythrough', function() {
          playButton.style.display = 'flex';
          playIcon.style.display = 'inline';
          pauseIcon.style.display = 'none';
          // 音频加载成功，开始旋转头像
          avatarImage.style.setProperty('animation-play-state', 'running', 'important');
          console.log('Background music loaded successfully, avatar rotation started');
        }, { once: true });
        
        // 监听错误事件，如果加载失败则不显示按钮
        backgroundMusic.addEventListener('error', function(e) {
          console.error('Background music failed to load, button will not be shown');
          console.error('Error code:', backgroundMusic.error ? backgroundMusic.error.code : 'unknown');
          // 保持按钮隐藏状态，头像也不旋转
          playButton.style.display = 'none';
          avatarImage.style.setProperty('animation-play-state', 'paused', 'important');
          console.log('Avatar rotation remains paused due to music load failure');
        }, { once: true });
      }
    }
    
    playButton.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      
      if (isPlaying) {
        // Pause music only (keep avatar rotating)
        if (backgroundMusic) {
          backgroundMusic.pause();
        }
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
        isPlaying = false;
        console.log('Music paused, avatar keeps rotating');
      } else {
        // Play music only (don't affect avatar rotation)
        if (backgroundMusic) {
          backgroundMusic.play().catch(e => console.error('Failed to play music:', e));
        }
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
        isPlaying = true;
        console.log('Music playing, avatar keeps rotating');
      }
    });
  }
});
