Promise.all([
  fetch("data/forslag.json").then(res => res.json()),
  fetch("data/forslags-deadline.json").then(res => res.json())
])
.then(([forslagData, deadlineData]) => {
  const container = document.getElementById("forslagsAccordionGrid");
  if (!container) return;

  container.innerHTML = "";

  // Parse deadlines
  const now = new Date();
  const deadlinePrevious = new Date(deadlineData["last-deadline"]);
  const deadlineNext = new Date(deadlineData["next-deadline"]);
  const erMellemDeadlines = now >= deadlinePrevious && now < deadlineNext;

  const day = deadlineNext.getDate();
  const month = deadlineNext.toLocaleString("da-DK", { month: "long" }).toLowerCase();
  const year = deadlineNext.getFullYear();
  const formattedDeadline = `${day}. ${month} ${year}`;

  // Update deadline text in intro section
  const deadlineTextEl = document.getElementById("forslagsDeadlineText");
  if (deadlineTextEl) {
    deadlineTextEl.textContent = `skal være modtaget senest ${formattedDeadline}`;
  }

  // --- Kategoriser forslag ---
  const aktuelle = forslagData.filter(f => {
    const forslagDato = new Date(f.dato);
    return forslagDato >= deadlinePrevious && forslagDato < deadlineNext;
  });

  const tidligere = forslagData.filter(f => {
    const forslagDato = new Date(f.dato);
    return forslagDato < deadlinePrevious;
  });

  const fremtidige = forslagData.filter(f => {
    const forslagDato = new Date(f.dato);
    return forslagDato >= deadlineNext;
  });

  // --- Aktuelle forslag ---
  if (aktuelle.length > 0) {
    const nyesteÅr = [...new Set(aktuelle.map(f => new Date(f.dato).getFullYear()))].sort((a, b) => b - a);
    const senesteÅr = nyesteÅr[0];

    const hrStart = document.createElement("hr");
    hrStart.className = "my-5";
    container.appendChild(hrStart);

    nyesteÅr.forEach(årstal => {
      const forslag = aktuelle.filter(f => new Date(f.dato).getFullYear() === årstal);
      const accordionId = `yearAccordion${årstal}`;

      const heading = document.createElement("h3");
      heading.className = "mb-3 mt-4";
      heading.textContent = årstal === senesteÅr && erMellemDeadlines
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
        const visningsdato = new Date(f.dato).toLocaleDateString("da-DK");

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
              <p><strong>Dato:</strong> ${visningsdato}</p>
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

  // --- Tidligere forslag ---
  if (tidligere.length > 0) {
    const hrOld = document.createElement("hr");
    hrOld.className = "my-5";
    container.appendChild(hrOld);

    const infobox = document.createElement("div");
    infobox.className = "alert alert-info text-center";
    infobox.innerHTML = `
      ℹ️ Tidligere forslag vises nedenfor. De bevares for at undgå gentagelser – og for at give mulighed for at genfremsætte dem, hvis behov eller forhold har ændret sig.`;
    container.appendChild(infobox);

    const årstalGrupper = [...new Set(tidligere.map(f => new Date(f.dato).getFullYear()))].sort((a, b) => b - a);
    årstalGrupper.forEach(årstal => {
      const forslag = tidligere.filter(f => new Date(f.dato).getFullYear() === årstal);
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
        const visningsdato = new Date(f.dato).toLocaleDateString("da-DK");

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
              <p><strong>Dato:</strong> ${visningsdato}</p>
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

  // --- Fremtidige forslag ---
  if (fremtidige.length > 0) {
    const hrFuture = document.createElement("hr");
    hrFuture.className = "my-5";
    container.appendChild(hrFuture);

    const heading = document.createElement("h3");
    heading.className = "mb-3 mt-4";
    heading.textContent = `📁 Forslag modtaget til fremtidige generalforsamlinger`;
    container.appendChild(heading);

    const wrapper = document.createElement("div");
    wrapper.className = "accordion mb-5";
    wrapper.id = "futureAccordion";
    container.appendChild(wrapper);

    fremtidige.forEach((f, i) => {
      const item = document.createElement("div");
      item.className = "accordion-item";
      const årstal = new Date(f.dato).getFullYear();
      const visningsdato = new Date(f.dato).toLocaleDateString("da-DK");

      item.innerHTML = `
        <h2 class="accordion-header" id="heading-future-${årstal}-${i}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  data-bs-target="#collapse-future-${årstal}-${i}" aria-expanded="false" aria-controls="collapse-future-${årstal}-${i}">
            📝 ${f.titel}
          </button>
        </h2>
        <div id="collapse-future-${årstal}-${i}" class="accordion-collapse collapse"
             aria-labelledby="heading-future-${årstal}-${i}" data-bs-parent="#futureAccordion">
          <div class="accordion-body">
            <p><strong>Dato:</strong> ${visningsdato}</p>
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
  }
})
.catch(error => {
  const container = document.getElementById("forslagsAccordionGrid");
  if (container) {
    container.innerHTML = `<div class="text-danger">Kunne ikke hente forslag: ${error}</div>`;
  }
});
