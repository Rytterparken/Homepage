Promise.all([
  fetch("data/forslag.json").then(res => res.json()),
  fetch("data/forslags-deadline.json").then(res => res.json())
])
.then(([forslagData, deadlineData]) => {
  const container = document.getElementById("forslagsAccordionGrid");
  if (!container) return;

  container.innerHTML = "";

  // Parse deadline
  const deadline = new Date(deadlineData.deadline);
  const day = deadline.getDate();
  const month = deadline.toLocaleString("da-DK", { month: "long" }).toLowerCase();
  const year = deadline.getFullYear();
  const formattedDeadline = `${day}. ${month} ${year}`;

  // Update deadline text in intro section
  const deadlineTextEl = document.getElementById("forslagsDeadlineText");
  if (deadlineTextEl) {
    deadlineTextEl.textContent = `skal være modtaget senest ${formattedDeadline}`;
  }

  // Categorize proposals
  const aktuelle = forslagData.filter(f => new Date(`${f.år}-01-01`) >= deadline);
  const tidligere = forslagData.filter(f => new Date(`${f.år}-01-01`) < deadline);

  // --- Aktuelle forslag ---
  if (aktuelle.length > 0) {
    const nyesteÅr = [...new Set(aktuelle.map(f => f.år))].sort((a, b) => b - a);
    const senesteÅr = nyesteÅr[0];

    const hrStart = document.createElement("hr");
    hrStart.className = "my-5";
    container.appendChild(hrStart);

    nyesteÅr.forEach(årstal => {
      const forslag = aktuelle.filter(f => f.år === årstal);
      const accordionId = `yearAccordion${årstal}`;

      const heading = document.createElement("h3");
      heading.className = "mb-3 mt-4";
      heading.textContent = årstal === senesteÅr
        ? "🗳️ Forslag til næste generalforsamling"
        : `📋 Forslag til ${årstal}`;
      container.appendChild(heading);

      const wrapper = document.createElement("div");
      wrapper.className = "accordion mb-5";
      wrapper.id = accordionId;
      container.appendChild(wrapper);

      forslag.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "accordion-item";

        item.innerHTML = `
          <h2 class="accordion-header" id="heading-${årstal}-${i}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapse-${årstal}-${i}" aria-expanded="false" aria-controls="collapse-${årstal}-${i}">
              📝 ${f.titel}
            </button>
          </h2>
          <div id="collapse-${årstal}-${i}" class="accordion-collapse collapse"
               aria-labelledby="heading-${årstal}-${i}" data-bs-parent="#${accordionId}">
            <div class="accordion-body">
              <p><strong>Forslag:</strong> ${f.beskrivelse}</p>
              <p><strong>Status:</strong> ${f.status}</p>
              ${f.bilag ? `
                <p><strong>Bilag:</strong> 
                  <a href="${f.bilag.link}" target="_blank">${f.bilag.filnavn}</a>
                  ${f.bilag.type === "pdf" ? `<br><embed src="${f.bilag.link}" type="application/pdf" width="100%" height="400px" class="mt-2 rounded shadow-sm" />` : ""}
                </p>
              ` : ""}
            </div>
          </div>
        `;
        wrapper.appendChild(item);
      });
    });
  } else {
    container.innerHTML += `
      <div class="text-center text-muted mb-4">Der er endnu ingen forslag til næste generalforsamling.</div>
    `;
  }

  // --- Info-boks før gamle forslag ---
  if (tidligere.length > 0) {
    const hrOld = document.createElement("hr");
    hrOld.className = "my-5";
    container.appendChild(hrOld);

    const infobox = document.createElement("div");
    infobox.className = "alert alert-info text-center";
    infobox.innerHTML = `
      ℹ️ Tidligere forslag vises nedenfor. De bevares for at undgå gentagelser – og for at give mulighed for at genfremsætte dem, hvis behov eller forhold har ændret sig.
    `;
    container.appendChild(infobox);
  }

  // --- Tidligere forslag ---
  if (tidligere.length > 0) {
    const årstalGrupper = [...new Set(tidligere.map(f => f.år))].sort((a, b) => b - a);

    årstalGrupper.forEach(årstal => {
      const forslag = tidligere.filter(f => f.år === årstal);
      const accordionId = `oldAccordion${årstal}`;

      const heading = document.createElement("h3");
      heading.className = "mb-3 mt-4";
      heading.textContent = `📜 Tidligere forslag fra ${årstal}`;
      container.appendChild(heading);

      const wrapper = document.createElement("div");
      wrapper.className = "accordion mb-5";
      wrapper.id = accordionId;
      container.appendChild(wrapper);

      forslag.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "accordion-item";

        item.innerHTML = `
          <h2 class="accordion-header" id="heading-old-${årstal}-${i}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    data-bs-target="#collapse-old-${årstal}-${i}" aria-expanded="false" aria-controls="collapse-old-${årstal}-${i}">
              📝 ${f.titel}
            </button>
          </h2>
          <div id="collapse-old-${årstal}-${i}" class="accordion-collapse collapse"
               aria-labelledby="heading-old-${årstal}-${i}" data-bs-parent="#${accordionId}">
            <div class="accordion-body">
              <p><strong>Forslag:</strong> ${f.beskrivelse}</p>
              <p><strong>Status:</strong> ${f.status}</p>
              ${f.bilag ? `
                <p><strong>Bilag:</strong> 
                  <a href="${f.bilag.link}" target="_blank">${f.bilag.filnavn}</a>
                  ${f.bilag.type === "pdf" ? `<br><embed src="${f.bilag.link}" type="application/pdf" width="100%" height="400px" class="mt-2 rounded shadow-sm" />` : ""}
                </p>
              ` : ""}
            </div>
          </div>
        `;
        wrapper.appendChild(item);
      });
    });
  }
})
.catch(error => {
  const container = document.getElementById("forslagsAccordionGrid");
  if (container) {
    container.innerHTML = `<div class="text-danger">Kunne ikke hente forslag: ${error}</div>`;
  }
});