// scripts/vedtaegter-render.js
function renderVedtaegter() {  
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
    }, 0);
}
  