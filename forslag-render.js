function initForslag() {
    const container = document.getElementById("forslagsAccordionGrid");
    const forslagTags = container.querySelectorAll("forslag");
  
    forslagTags.forEach((tag, index) => {
      const id = index + 1;
      const title = tag.getAttribute("title");
      const content = tag.innerHTML.trim();
  
      const accordionHTML = `
        <div class="col">
          <div class="accordion" id="accordion${id}">
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading${id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapse${id}" aria-expanded="false"
                        aria-controls="collapse${id}">
                  <strong>${title}</strong>
                </button>
              </h2>
              <div id="collapse${id}" class="accordion-collapse collapse"
                   aria-labelledby="heading${id}" data-bs-parent="#accordion${id}">
                <div class="accordion-body">
                  <p>${content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
      
      tag.insertAdjacentHTML("afterend", accordionHTML);
      tag.remove();
    });
  }
  