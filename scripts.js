// Load dokumenter.html into the container
fetch('dokumenter.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('dokumenter-container').innerHTML = data;
  })
  .catch(error => console.error('Error loading dokumenter:', error));

// Function to show sections and update navigation active state
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.textContent.toLowerCase().includes(id)) {
      link.classList.add('active');
    }
  });
}
