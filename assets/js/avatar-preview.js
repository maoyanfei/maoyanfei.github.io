// Avatar Preview Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
  const avatarTrigger = document.getElementById('avatar-preview-trigger');
  const avatarModal = document.getElementById('avatar-modal');
  const modalClose = document.querySelector('.avatar-modal-close');
  
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
});
