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

window.enableZoomPanOnMap = function () {
  const img = document.getElementById('zoom-image');
  const container = document.getElementById('zoom-container');
  const resetBtn = document.getElementById('reset-map-btn');
  if (!img || !container) return;

  let scale = 1;
  let translateY = 0;
  let minScale = 1;
  let isDragging = false;
  let startY;

  function updateTransform() {
    const rect = container.getBoundingClientRect();
    const offsetX = (rect.width - img.naturalWidth * scale) / 2;

    img.style.transform = `translate(${offsetX}px, ${translateY}px) scale(${scale})`;
  }

  function resetZoom() {
    const rect = container.getBoundingClientRect();
    scale = rect.width / img.naturalWidth;
    minScale = scale;

    const scaledHeight = img.naturalHeight * scale;
    translateY = (rect.height - scaledHeight) / 2;

    updateTransform();
  }

  container.addEventListener('wheel', (e) => {
    e.preventDefault();

    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(minScale, scale + delta), 3);
    const scaleChange = newScale / scale;
    scale = newScale;

    const rect = container.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    translateY -= (offsetY - translateY) * (scaleChange - 1);

    updateTransform();
  });

  container.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startY = e.clientY - translateY;
    img.style.cursor = 'grabbing';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    img.style.cursor = 'grab';
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateY = e.clientY - startY;
    updateTransform();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', resetZoom);
  }

  img.onload = resetZoom;
  if (img.complete) resetZoom();
};

