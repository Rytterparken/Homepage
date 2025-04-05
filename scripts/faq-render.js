function renderFAQ() {
    const container = document.getElementById("faqAccordion");
    if (!container) return;
  
    fetch("data/faq.json")
      .then(res => res.json())
      .then(faqs => {
        container.innerHTML = faqs
          .map((faq, index) => `
            <div class="accordion-item">
              <h2 class="accordion-header" id="faq-heading-${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  data-bs-target="#faq-collapse-${index}" aria-expanded="false" aria-controls="faq-collapse-${index}">
                  ${faq.spørgsmål}
                </button>
              </h2>
              <div id="faq-collapse-${index}" class="accordion-collapse collapse"
                   aria-labelledby="faq-heading-${index}" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  ${faq.svar}
                </div>
              </div>
            </div>
          `)
          .join("");
      })
      .catch(err => {
        console.error("Kunne ikke hente FAQ:", err);
        container.innerHTML = `<p class="text-danger">FAQ kunne ikke indlæses.</p>`;
      });
  }
  