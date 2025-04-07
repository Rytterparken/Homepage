function renderVedtaegter() {
    fetch("data/vedtaegter.json")
      .then(response => response.json())
      .then(data => {
        const tabsContainer = document.getElementById("bylawsTab");
        const contentContainer = document.getElementById("bylawsTabContent");
        const cardsContainer = document.getElementById("bylawsCards");
  
        let firstTab = true;
  
        data.forEach(item => {
          // Opret faneblad
          const tabBtn = document.createElement("button");
          tabBtn.className = "nav-link" + (firstTab ? " active" : "");
          tabBtn.id = `${item.id}-tab`;
          tabBtn.dataset.bsToggle = "tab";
          tabBtn.dataset.bsTarget = `#${item.id}`;
          tabBtn.type = "button";
          tabBtn.role = "tab";
          tabBtn.textContent = item.titel;
  
          const tabLi = document.createElement("li");
          tabLi.className = "nav-item";
          tabLi.role = "presentation";
          tabLi.appendChild(tabBtn);
          tabsContainer.appendChild(tabLi);
  
          // Opret indhold (iframe)
          const tabPane = document.createElement("div");
          tabPane.className = "tab-pane fade" + (firstTab ? " show active" : "");
          tabPane.id = item.id;
          tabPane.role = "tabpanel";
  
          const iframe = document.createElement("iframe");
          iframe.src = item.fil;
          iframe.width = "100%";
          iframe.height = "600px";
          iframe.style.border = "none";
          tabPane.appendChild(iframe);
          contentContainer.appendChild(tabPane);
  
          // Opret kort med knapper
          const card = document.createElement("div");
          card.className = "col-md-4 mb-3";
          card.innerHTML = `
            <div class="card h-100">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${item.titel}</h5>
                <p class="card-text">${item.beskrivelse}</p>
                <div class="mt-auto row g-2">
                  <div class="col-6">
                    <a href="${item.fil}" target="_blank" class="btn btn-primary w-100">Se i browser</a>
                  </div>
                  <div class="col-6">
                    <a href="${item.fil}" download class="btn btn-outline-primary w-100">Download PDF</a>
                  </div>
                </div>
              </div>
            </div>
          `;
          cardsContainer.appendChild(card);
  
          firstTab = false;
        });
  
        // Initialiser Bootstrap-tabs (efter DOM er opdateret)
        const triggerTabList = document.querySelectorAll('#bylawsTab button');
        triggerTabList.forEach(triggerEl => {
          triggerEl.addEventListener('click', event => {
            const tabTrigger = new bootstrap.Tab(triggerEl);
            tabTrigger.show();
          });
        });
  
      })
      .catch(error => {
        console.error("Kunne ikke hente vedtægtsdata:", error);
      });
  }
  