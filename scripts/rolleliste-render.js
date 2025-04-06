function renderRolleListe(containerId, jsonPath) {
    fetch(jsonPath)
      .then(response => response.json())
      .then(medlemmer => {
        const container = document.getElementById(containerId);
        if (!container) return;
  
        container.innerHTML = "";
  
        medlemmer.forEach(medlem => {
          const col = document.createElement("div");
          col.className = "col-sm-6 col-lg-4";
  
          const card = document.createElement("div");
          card.className = "card shadow-sm h-100";
  
          const email = medlem.email
            ? `<p class="mb-1">📧 <a href="mailto:${medlem.email}">${medlem.email}</a></p>` : "";
          const telefon = medlem.telefon
            ? `<p class="mb-0">📞 ${medlem.telefon}</p>` : "";
  
          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">${medlem.navn}</h5>
              <p class="card-subtitle mb-2 text-muted">${medlem.rolle}</p>
              <p class="mb-1">🏡 ${medlem.adresse}</p>
              ${email}
              ${telefon}
            </div>
          `;
  
          col.appendChild(card);
          container.appendChild(col);
        });
      })
      .catch(error => {
        console.error(`Kunne ikke hente data fra ${jsonPath}:`, error);
      });
  }
  