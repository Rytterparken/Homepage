function renderOpgaverAccordion() {
  const USE_LIVE_DATA = true;

  const sheetName = "opgaver";
  const dataUrl = USE_LIVE_DATA
    ? `${window.GOOGLE_SHEETS_DATA}&ark=${sheetName}`
    : "data/opgaver.json";

  fetch(dataUrl)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("arbejdsopgaverEkstra");
      if (!container) return;

      container.innerHTML = "";

      const slugify = str => str.toLowerCase().replace(/[^\w]+/g, '-');

      data.forEach((person, index) => {
        const id = `flush-${slugify(person.navn || `person-${index}`)}`;

        const ikon = person.Ikon ? `${person.Ikon} ` : "";
        const navn = person.Navn || "Ukendt";
        const titel = person.Titel ? `– ${person.Titel}` : "";
        const opgaver = Array.isArray(person.Opgaver) ? person.Opgaver : [];

        const item = document.createElement("div");
        item.className = "accordion-item";
        item.innerHTML = `
          <h2 class="accordion-header" id="${id}-heading">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#${id}-collapse" aria-expanded="false" aria-controls="${id}-collapse">
              ${ikon}${navn} ${titel}
            </button>
          </h2>
          <div id="${id}-collapse" class="accordion-collapse collapse"
               aria-labelledby="${id}-heading" data-bs-parent="#arbejdsopgaverEkstra">
            <div class="accordion-body">
              <ul>
                ${opgaver.length > 0
                  ? opgaver.map(opg => `<li>${opg}</li>`).join("")
                  : `<li><em>Ingen opgaver registreret.</em></li>`}
              </ul>
            </div>
          </div>
        `;
        container.appendChild(item);
      });
    })
    .catch(err => {
      console.error("Kunne ikke hente arbejdsopgaver:", err);
    });
}
