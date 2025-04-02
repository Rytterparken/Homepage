// Load external HTML files into the corresponding sections
function loadSection(sectionId, url) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(sectionId).innerHTML = data;
      })
      .catch(error => console.error(`Error loading ${sectionId}:`, error));
  }
  
  // Load "vedtaegter.html" into the vedtaegter section
  loadSection('vedtaegter', 'vedtaegter.html');
  // Load "dokumenter.html" into the dokumenter section
  loadSection('dokumenter', 'dokumenter.html');
  
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
  