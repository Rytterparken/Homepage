function renderDokumenter() {
    const kategorier = [
      { key: "regnskaber", navn: "Regnskaber", ikon: "📊", prefix: "Regnskab" },
      { key: "budgetter", navn: "Budgetter", ikon: "💸", prefix: "Budget" },
      { key: "generalforsamlinger", navn: "Referater", ikon: "📚", prefix: "Generalforsamling" },
      { key: "bestyrelsesmoeder", navn: "Bestyrelsesmøder", ikon: "📝", prefix: "Bestyrelsesmøde" },
      { key: "arkiv", navn: "Arkiv", ikon: "🗄️", prefix: null }
    ];
  
    const container = document.getElementById("dokumenter");
    if (!container) return;
  
    // 🆕 Indsæt en .row som wrapper til kolonnerne
    container.innerHTML = '<div class="row" id="dokumenter-row"></div>';
    const row = document.getElementById("dokumenter-row");
  
    kategorier.forEach(({ key, navn, ikon, prefix }) => {
      fetch(`data/dokumenter/${key}.json`)
        .then(res => res.json())
        .then(dokumenter => {
          dokumenter.sort((a, b) => {
            const aYear = a.fil.match(/\d{4}/)?.[0] ?? 0;
            const bYear = b.fil.match(/\d{4}/)?.[0] ?? 0;
            return bYear - aYear;
          });
  
          const links = dokumenter.map(doc => {
            const år = doc.fil.match(/\d{4}/)?.[0] ?? "";
            const visning = doc.titel || (prefix ? `${prefix} ${år}` : doc.fil.split("/").pop());
            return `<a href="${doc.fil}" class="list-group-item list-group-item-action" download>
                      📄 ${visning}
                    </a>`;
          });
  
          const col = document.createElement("div");
          col.className = "col-lg-4 col-md-6 mb-4";
  
          col.innerHTML = `
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h4 class="card-title">${ikon} ${navn}</h4>
                <div class="list-group list-group-flush">
                  ${links.join("")}
                </div>
              </div>
            </div>
          `;
  
          // 🆕 Tilføj til .row i stedet for container
          row.appendChild(col);
        })
        .catch(err => {
          console.error(`Kunne ikke hente data for ${key}:`, err);
        });
    });
  }
  