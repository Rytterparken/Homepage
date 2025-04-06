window.renderForslag = function () {
  const USE_LIVE_DATA = window.USE_LIVE_DATA ?? false; // Sæt globalt i config
  const baseUrl = window.GOOGLE_SHEETS_DATA;

  const fetchData = USE_LIVE_DATA
    ? Promise.all([
        fetch(`${baseUrl}?ark=Forslag`).then(res => res.json()),
        fetch(`${baseUrl}?ark=Forslags Deadline`).then(res => res.json())
      ])
    : Promise.all([
        fetch("data/forslag.json").then(res => res.json()),
        fetch("data/forslags-deadline.json").then(res => res.json())
      ]);

  fetchData
    .then(([forslagRaw, deadlineRaw]) => {
      const container = document.getElementById("forslagsAccordionGrid");
      if (!container) return;

      container.innerHTML = "";

      const deadlineData = USE_LIVE_DATA
        ? {
            "naeste-deadline": deadlineRaw[0]["næstedeadline"],
            "sidste-deadline": deadlineRaw[0]["sidstedeadline"]
          }
        : deadlineRaw;

      const forslagData = forslagRaw.map(f => {
        if (USE_LIVE_DATA) {
          const bilag = f["bilag-filnavn"] || f["bilag-link"]
            ? {
                filnavn: f["bilag-filnavn"] || "Bilag",
                link: `documents/forslag/${f["bilag-link"] || ""}`,
                type: f["bilag-type"] || ""
              }
            : null;
          return {
            "dato-fremsat": f["datofremsat"],
            "dato-genoptaget": f["datogenoptaget"],
            "titel": f["titel"],
            "beskrivelse": f["beskrivelse"],
            "status": f["status"],
            "status-beskrivelse": f["statusbeskrivelse"],
            bilag
          };
        } else {
          return f;
        }
      });

      const now = new Date();
      const deadlinePrevious = new Date(deadlineData["sidste-deadline"]);
      const deadlineNext = new Date(deadlineData["naeste-deadline"]);
      const erMellemDeadlines = now >= deadlinePrevious && now < deadlineNext;

      const formattedDeadline = deadlineNext.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });

      const deadlineTextEl = document.getElementById("forslagsDeadlineText");
      if (deadlineTextEl) {
        deadlineTextEl.textContent = `skal være modtaget senest ${formattedDeadline}`;
      }

      const getDato = f => new Date(f["dato-genoptaget"] || f["dato-fremsat"] || f.dato);

      const aktuelle = forslagData.filter(f => {
        const d = getDato(f);
        return d >= deadlinePrevious && d < deadlineNext;
      });

      const tidligere = forslagData.filter(f => getDato(f) < deadlinePrevious);
      const fremtidige = forslagData.filter(f => getDato(f) >= deadlineNext);

      const lavAccordionItems = (forslag, årstal, accordionId, parentIdPrefix) => {
        const wrapper = document.createElement("div");
        wrapper.className = "accordion mb-5";
        wrapper.id = accordionId;
        container.appendChild(wrapper);

        forslag.forEach((f, i) => {
          const item = document.createElement("div");
          item.className = "accordion-item";

          const fremsatDato = new Date(f["dato-fremsat"] || f.dato);
          const genoptagetDato = f["dato-genoptaget"] ? new Date(f["dato-genoptaget"]) : null;

          const visFremsat = `<p><strong>Fremsat:</strong> ${fremsatDato.toLocaleDateString("da-DK")}</p>`;
          const visGenoptaget = (genoptagetDato && genoptagetDato.getTime() !== fremsatDato.getTime())
            ? `<p><strong>Genoptaget:</strong> ${genoptagetDato.toLocaleDateString("da-DK")}</p>`
            : "";

          const visStatusBeskrivelse = f["status-beskrivelse"]?.trim()
            ? `<p class="fst-italic text-muted mt-1">${f["status-beskrivelse"]}</p>`
            : "";

          const statusLower = (f.status || "").toLowerCase();
          let badgeClass = "badge-outline-secondary";
          if (
            statusLower.includes("ikke vedtaget") ||
            statusLower.includes("afvist") ||
            statusLower.includes("henlagt")
          ) {
            badgeClass = "badge-outline-warning";
          } else if (
            statusLower.includes("vedtaget") ||
            statusLower.includes("godkendt")
          ) {
            badgeClass = "badge-outline-success";
          }

          item.innerHTML = `
            <h2 class="accordion-header" id="heading-${parentIdPrefix}-${årstal}-${i}">
              <button class="accordion-button collapsed" type="button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapse-${parentIdPrefix}-${årstal}-${i}"
                      aria-expanded="false" aria-controls="collapse-${parentIdPrefix}-${årstal}-${i}">
                <div class="w-100 d-flex justify-content-between align-items-center">
                  <span>📝 ${f.titel}</span>
                  <span class="badge ${badgeClass} forslag-status-badge me-3">${f.status}</span>
                </div>
              </button>
            </h2>
            <div id="collapse-${parentIdPrefix}-${årstal}-${i}" class="accordion-collapse collapse"
                 aria-labelledby="heading-${parentIdPrefix}-${årstal}-${i}" data-bs-parent="#${accordionId}">
              <div class="accordion-body">
                ${visFremsat}
                ${visGenoptaget}
                <p><strong>Forslag:</strong> ${f.beskrivelse}</p>
                ${visStatusBeskrivelse}
                ${f.bilag ? `
                  <p><strong>Bilag:</strong> 
                    <a href="${f.bilag.link}" target="_blank">${f.bilag.filnavn}</a>
                    ${f.bilag.type === "pdf"
                      ? `<br><embed src="${f.bilag.link}" type="application/pdf" width="100%" height="400px" class="mt-2 rounded shadow-sm" />`
                      : ""}
                  </p>` : ""}
              </div>
            </div>
          `;
          wrapper.appendChild(item);
        });
      };

      // Aktuelle
      if (aktuelle.length > 0) {
        const nyesteÅr = [...new Set(aktuelle.map(f => getDato(f).getFullYear()))].sort((a, b) => b - a);
        const senesteÅr = nyesteÅr[0];

        container.appendChild(document.createElement("hr"));

        nyesteÅr.forEach(årstal => {
          const forslag = aktuelle.filter(f => getDato(f).getFullYear() === årstal);
          const heading = document.createElement("h3");
          heading.className = "mb-3 mt-4";
          heading.textContent = årstal === senesteÅr && erMellemDeadlines
            ? "🗳️ Forslag til næste generalforsamling"
            : `📋 Forslag til ${årstal}`;
          container.appendChild(heading);

          lavAccordionItems(forslag, årstal, `yearAccordion${årstal}`, "current");
        });
      } else {
        container.innerHTML += `
          <div class="text-center text-muted mb-4">Der er endnu ingen forslag til næste generalforsamling.</div>
        `;
      }

      // Tidligere
      if (tidligere.length > 0) {
        container.appendChild(document.createElement("hr"));
        const infobox = document.createElement("div");
        infobox.className = "alert alert-info text-center";
        infobox.innerHTML = `ℹ️ Tidligere forslag vises nedenfor. De bevares for at undgå gentagelser – og for at give mulighed for at genfremsætte dem, hvis behov eller forhold har ændret sig.`;
        container.appendChild(infobox);

        const årstalGrupper = [...new Set(tidligere.map(f => getDato(f).getFullYear()))].sort((a, b) => b - a);
        årstalGrupper.forEach(årstal => {
          const forslag = tidligere.filter(f => getDato(f).getFullYear() === årstal);
          const heading = document.createElement("h3");
          heading.className = "mb-3 mt-4";
          heading.textContent = `📜 Tidligere forslag fra ${årstal}`;
          container.appendChild(heading);

          lavAccordionItems(forslag, årstal, `oldAccordion${årstal}`, "old");
        });
      }

      // Fremtidige
      if (fremtidige.length > 0) {
        container.appendChild(document.createElement("hr"));
        const heading = document.createElement("h3");
        heading.className = "mb-3 mt-4";
        heading.textContent = `📁 Forslag modtaget til fremtidige generalforsamlinger`;
        container.appendChild(heading);

        lavAccordionItems(fremtidige, "future", "futureAccordion", "future");
      }
    })
    .catch(error => {
      const container = document.getElementById("forslagsAccordionGrid");
      if (container) {
        container.innerHTML = `<div class="text-danger">Kunne ikke hente forslag: ${error}</div>`;
      }
    });
};