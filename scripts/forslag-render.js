fetch("data/forslag.json")
.then(response => response.json())
.then(data => {
  const grouped = data.reduce((acc, item) => {
    acc[item.år] = acc[item.år] || [];
    acc[item.år].push(item);
    return acc;
  }, {});

  const container = document.getElementById("forslagsAccordionGrid");
  if (!container) return;

  container.innerHTML = "";

  const år = Object.keys(grouped).sort((a, b) => b - a); // nyeste først

  if (år.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted">Der er endnu ingen forslag til næste generalforsamling.</div>
    `;
    return;
  }

  år.forEach((årstal, yearIndex) => {
    const forslag = grouped[årstal];
    const accordionId = `yearAccordion${årstal}`;

    const wrapper = document.createElement("div");
    wrapper.className = "accordion mb-5";
    wrapper.id = accordionId;

    const heading = document.createElement("h3");
    heading.className = "mb-3 mt-4";
    heading.textContent = `📋 Forslag fra ${årstal}`;
    container.appendChild(heading);
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
          </div>
        </div>
      `;
      wrapper.appendChild(item);
    });
  });
})
.catch(error => {
  document.getElementById("forslagsAccordionGrid").innerHTML =
    `<div class="text-danger">Kunne ikke hente forslag: ${error}</div>`;
});
