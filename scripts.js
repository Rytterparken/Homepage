// Load external HTML files into the corresponding sections
function loadSection(sectionId, url) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(sectionId).innerHTML = data;
      })
      .catch(error => console.error(`Error loading ${sectionId}:`, error));
  }
  
  // Load "vedtaegter.html" osv.
  loadSection('vedtaegter', 'vedtaegter.html');
  loadSection('dokumenter', 'dokumenter.html');
  loadSection('om-os', 'om-os.html');

  // Function to show sections and update navigation active state
  function showSection(id) {
    // Skjul alle sektioner
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(id).classList.add('active');
  
    // Fjern 'active' fra alle nav-links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
  
    // Tilføj 'active' til det rigtige link
    const matchingLink = document.querySelector(`.nav-link[data-section="${id}"]`);
    if (matchingLink) {
      matchingLink.classList.add('active');
    }
  }  
  