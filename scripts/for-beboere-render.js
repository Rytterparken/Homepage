window.renderHouses = function () {
    const totalHouses = 114;
  
    // Define members here:
    const members = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 39, 40, 41, 42, 43, 44, 45, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108, 110, 112, 114];
  
    const container = document.getElementById("house-container");
    if (!container) return;
  
    for (let i = 1; i <= totalHouses; i++) {
      const status = members.includes(i) ? "member" : "not-member";
      const span = document.createElement("span");
      span.className = "house";
      span.dataset.number = i;
      span.dataset.status = status;
      container.appendChild(span);
    }
  
    document.querySelectorAll('.house').forEach(el => {
      const number = el.dataset.number || '';
      const status = el.dataset.status || 'member';
      const color = status === 'not-member' ? '#ea9999' : '#b3ea99';
  
      const svg = `
        <svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg"
             width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
          <rect x="20" y="40" width="80" height="50" fill="${color}" stroke="#000" stroke-width="4"/>
          <polygon points="15,40 60,5 105,40" fill="${color}" stroke="#000" stroke-width="4"/>
          <text x="60" y="65" text-anchor="middle" dominant-baseline="middle"
                fill="#333" font-size="32" font-weight="bold">${number}</text>
        </svg>
      `;
      el.innerHTML = svg;
    });
  }

window.initMailchimpForm = function () {
  const mcForm = document.getElementById('mc-form');
  const mcMsg = document.getElementById('mc-thankyou');
  const mcWrapper = document.getElementById('mc-wrapper');
  const iframe = document.querySelector('iframe[name="hidden_iframe"]');

  if (mcForm && mcMsg && mcWrapper && iframe) {
    iframe.addEventListener('load', () => {
      const emailField = mcForm.querySelector('input[name="EMAIL"]');
      if (emailField && emailField.value.trim() !== '') {
        // Fade formularen
        mcWrapper.classList.add('transition-opacity');
        mcWrapper.style.opacity = '0';

        // Vis overlay
        mcMsg.classList.remove('d-none');

        // Nulstil input
        mcForm.reset();

        // Efter 10 sekunder, nulstil alt
        setTimeout(() => {
          mcWrapper.style.opacity = '1';
          mcMsg.classList.add('d-none');
        }, 10000);
      }
    });
  }
};