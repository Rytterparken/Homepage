function renderDokumenter() {
  const USE_LIVE_DATA = window.USE_LIVE_DATA;
  const BASE_URL = window.GOOGLE_SHEETS_DATA; // samme endpoint som FAQ

  const kategorier = [
    { key: "regnskaber", navn: "Regnskaber", ikon: "📊", prefix: "Regnskab" },
    { key: "budgetter", navn: "Budgetter", ikon: "💸", prefix: "Budget" },
    { key: "indkaldelser", navn: "Indkaldelser", ikon: "📅", prefix: "Indkaldelse" },
    { key: "referater", navn: "Referater", ikon: "📚", prefix: "Generalforsamling" },
    // { key: "bestyrelsesmoeder", navn: "Bestyrelsesmøder", ikon: "📝", prefix: "Bestyrelsesmøde" }, (Vi skal have lov af bestyrelsen)
    { key: "arkiv", navn: "Arkiv", ikon: "🗄️", prefix: null }
  ];

  const container = document.getElementById("dokumenter");
  if (!container) return;

  container.innerHTML = '<div class="row" id="dokumenter-row"></div>';
  const row = document.getElementById("dokumenter-row");

  kategorier.forEach(({ key, navn, ikon, prefix }) => {
    const dataUrl = USE_LIVE_DATA
      ? `${BASE_URL}?mappe=${key}`
      : `data/dokumenter/${key}.json`;

    fetch(dataUrl)
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

        row.appendChild(col);
      })
      .catch(err => {
        console.error(`Kunne ikke hente data for ${key}:`, err);
      });
  });
}