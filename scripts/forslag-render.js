window.renderForslag = function () {
  const USE_LIVE_DATA = window.USE_LIVE_DATA ?? false;
  const baseUrl = window.GOOGLE_SHEETS_DATA;

  const fetchForslagsdata = USE_LIVE_DATA
    ? Promise.all([
        fetch(`${baseUrl}?ark=Forslag`).then(res => res.json()),
        fetch(`${baseUrl}?ark=Forslags Deadline`).then(res => res.json()),
        fetch(`${baseUrl}?ark=Forslagsskabelon`).then(res => res.json())
      ])
    : Promise.all([
        fetch("data/forslag.json").then(res => res.json()),
        fetch("data/forslags-deadline.json").then(res => res.json()),
        fetch("data/forslagsskabelon.json").then(res => res.json())
      ]);

  fetchForslagsdata
    .then(([forslagRaw, deadlineRaw, skabelonData]) => {
      // VIS SKABELON-LINKENE (PDF og DOCX)
      const skabelonLinkWrapper = document.getElementById("forslagsskabelonLink");
      if (skabelonLinkWrapper) {
        const data = USE_LIVE_DATA ? skabelonData[0] : skabelonData;
        const linkPdf = data["link-pdf"];
        const linkDocx = data["link-docx"];

        if (linkPdf || linkDocx) {
          skabelonLinkWrapper.innerHTML = `
            <div class="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2 text-center">
              ${linkPdf ? `
                <a class="btn btn-outline-primary mb-2" href="${linkPdf}" target="_blank">
                  📄 Vis forslagsskabelon (PDF)
                </a>` : ""}  
              ${linkDocx ? `
                <a class="btn btn-outline-secondary mb-2" href="${linkDocx}" target="_blank">
                  📝 Download forslagsskabelon (DOCX)
                </a>` : ""}
            </div>
          `;
        } else if (USE_LIVE_DATA) {
          skabelonLinkWrapper.innerHTML = `
            <div class="text-danger">⚠️ Kunne ikke hente skabelonen på nuværende tidspunkt.</div>
          `;
        }
      }

      const container = document.getElementById("forslagsAccordionGrid");
      if (!container) return;

      container.innerHTML = "";

      const resolvedDeadline = window.resolveYearlyDeadline(window.getForslagsDeadlineValue(deadlineRaw));

      const forslagData = forslagRaw.map(f => {
        if (USE_LIVE_DATA) {
          const rawLink = f["bilag-link"] || "";
          let link = rawLink;
          if (rawLink.includes("drive.google.com/file/d/") && rawLink.includes("/view")) {
            const id = rawLink.split("/d/")[1]?.split("/")[0];
            link = `https://drive.google.com/file/d/${id}/preview`;
          }
          return {
            "dato-fremsat": f["datofremsat"],
            "dato-genoptaget": f["datogenoptaget"],
            "titel": f["titel"],
            "baggrund": f["baggrund"],
            "forslag": f["forslag"],
            "status": f["status"],
            "status-beskrivelse": f["statusbeskrivelse"],
            bilag: rawLink ? {
              filnavn: f["bilag-filnavn"] || "Bilag",
              link
            } : null
          };
        } else {
          return f;
        }
      });

      const now = new Date();
      const deadlinePreviousEnd = resolvedDeadline ? resolvedDeadline.previousEnd : null;
      const deadlineNextEnd = resolvedDeadline ? resolvedDeadline.nextEnd : null;
      const erMellemDeadlines = !!(resolvedDeadline && now >= resolvedDeadline.previous && now < resolvedDeadline.next);

      if (resolvedDeadline) {
        const formattedDeadline = resolvedDeadline.next.toLocaleDateString("da-DK", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
        const deadlineTextEl = document.getElementById("forslagsDeadlineText");
        if (deadlineTextEl) {
          deadlineTextEl.textContent = `skal være modtaget senest ${formattedDeadline}`;
        }
      }

      const getDato = f => new Date(f["dato-genoptaget"] || f["dato-fremsat"] || f.dato);

      const aktuelle = resolvedDeadline
        ? forslagData.filter(f => {
            const d = getDato(f);
            return d > deadlinePreviousEnd && d <= deadlineNextEnd;
          })
        : forslagData;

      const tidligere = resolvedDeadline
        ? forslagData.filter(f => getDato(f) <= deadlinePreviousEnd)
        : [];
      const fremtidige = resolvedDeadline
        ? forslagData.filter(f => getDato(f) > deadlineNextEnd)
        : [];

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
                ${f.baggrund ? `
                  <p><strong>Baggrund:</strong></p>
                  <div>${formatTekst(f.baggrund)}</div>
                ` : ""}
                ${f.forslag ? `
                  <p class="mt-3"><strong>Forslag:</strong></p>
                  <div>${formatTekst(f.forslag)}</div>
                ` : ""}
                ${visStatusBeskrivelse ? `
                  <br/>
                  <p><strong>Konklusion:</strong></p>
                  ${visStatusBeskrivelse}
                ` : ""}
                ${f.bilag ? `
                  <p><strong>Bilag:</strong>
                    <a href="${f.bilag.link}" target="_blank">${f.bilag.filnavn}</a>
                    <br>
                    <iframe src="${f.bilag.link}" width="100%" height="400px" style="border: none;" class="mt-2 rounded shadow-sm"></iframe>
                  </p>` : ""}
              </div>
            </div>
          `;
          wrapper.appendChild(item);
        });
      };

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

    function formatTekst(tekst) {
      if (!tekst) return "";
      return tekst
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\n/g, '<br>')
        .replace(/<br>\s*•/g, '<br>&bull;')
        .replace(/^•/gm, '&bull;');
    }
};
