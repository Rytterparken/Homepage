// Load external HTML files into the corresponding sections
function loadSection(sectionId, url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById(sectionId).innerHTML = data;
      if (typeof callback === "function") callback();
    })
    .catch(error => console.error(`Error loading ${sectionId}:`, error));
}

// Vis kun én sektion ad gangen og opdater navigation
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.classList.remove('active');
  });

  const matchingLink = document.querySelector(`.nav-link[data-section="${id}"]`);
  if (matchingLink) {
    matchingLink.classList.add('active');
  }
}

// Load sektioner
loadSection('faq', 'faq.html', renderFAQ);
loadSection('dokumenter', 'dokumenter.html', function () {
  if (typeof renderDokumenter === "function") {
    renderDokumenter();
  }
});
loadSection('hvem-er-vi', 'hvem-er-vi.html', function () {
  const base = window.GOOGLE_SHEETS_DATA;
  const isLive = window.USE_LIVE_DATA;

  const prefix = isLive ? base + "?ark=" : "data/roller/";
  const suffix = isLive ? "" : ".json";

  renderRolleListe("bestyrelse-render", `${prefix}Bestyrelse${suffix}`);
  renderRolleListe("suppleanter-render", `${prefix}Suppleanter${suffix}`);
  renderRolleListe("revisorer-render", `${prefix}Revisorer${suffix}`);
  renderRolleListe("legepladsudvalg-render", `${prefix}Legepladsudvalg${suffix}`);
});


loadSection('vores-arbejde', 'vores-arbejde.html', renderOpgaverAccordion);
loadSection('for-beboere', 'for-beboere.html', function () {
  renderHouses();
  initMailchimpForm();
  if (typeof renderCalendar === "function") {
    renderCalendar();
  }
  enableZoomPanOnMap();
});
loadSection('forslag', 'forslag.html', renderForslag);

// Når vedtægter er loadet, så initialiser tabs korrekt
loadSection('vedtaegter', 'vedtaegter.html', function () {
  // Vent lidt på DOM-render (nødvendigt i nogle browsere)
  setTimeout(() => {
    // Tilføj event listeners til tabs
    const triggerTabList = document.querySelectorAll('#bylawsTab button');
    triggerTabList.forEach(triggerEl => {
      triggerEl.addEventListener('click', event => {
        const tabTrigger = new bootstrap.Tab(triggerEl);
        tabTrigger.show();
      });
    });

    // Vælg aktiv tab (Digitaliseret)
    const digitalTabBtn = document.getElementById('digitaliseret-tab');
    if (digitalTabBtn) {
      const digitalTab = new bootstrap.Tab(digitalTabBtn);
      digitalTab.show();
    }
  }, 0); // Kører efter DOM er opdateret
});

// Vis forside som udgangspunkt
document.addEventListener("DOMContentLoaded", function () {
  showSection('forside');
  const navbarCollapse = document.getElementById("navbarNav");
  const navLinks = navbarCollapse.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      // Luk kun hvis burger-menuen er synlig (uanset skærmbredde)
      const toggler = document.querySelector('.navbar-toggler');
      const isVisible = window.getComputedStyle(toggler).display !== "none";

      if (isVisible) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
});
