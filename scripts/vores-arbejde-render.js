function renderOpgaverAccordion() {
  fetch("data/konkrete-opgaver.json")
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById("arbejdsopgaverEkstra");
      if (!container) return;

      container.innerHTML = "";

      const slugify = str => str.toLowerCase().replace(/[^\w]+/g, '-');

      data.forEach((person, index) => {
        const id = `flush-${slugify(person.navn)}`;

        const item = document.createElement("div");
        item.className = "accordion-item";
        item.innerHTML = `
          <h2 class="accordion-header" id="${id}-heading">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#${id}-collapse" aria-expanded="false" aria-controls="${id}-collapse">
              ${person.ikon} ${person.navn} – ${person.titel}
            </button>
          </h2>
          <div id="${id}-collapse" class="accordion-collapse collapse"
               aria-labelledby="${id}-heading" data-bs-parent="#arbejdsopgaverEkstra">
            <div class="accordion-body">
              <ul>
                ${person.opgaver.map(opg => `<li>${opg}</li>`).join("")}
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
