window.enableZoomPanOnMap = function () {
    const img = document.getElementById('zoom-image');
    const container = document.getElementById('zoom-container');
    const resetBtn = document.getElementById('reset-map-btn');
    if (!img || !container) return;
  
    let scale = 1;
    let minScale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX, startY;
  
    function updateTransform() {
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
  
    function limitPan() {
      const rect = container.getBoundingClientRect();
      const imgWidth = img.naturalWidth * scale;
      const imgHeight = img.naturalHeight * scale;
  
      const maxX = 0;
      const minX = rect.width - imgWidth;
      if (imgWidth > rect.width) {
        translateX = Math.max(minX, Math.min(maxX, translateX));
      } else {
        translateX = (rect.width - imgWidth) / 2;
      }
  
      const maxY = 0;
      const minY = rect.height - imgHeight;
      if (imgHeight > rect.height) {
        translateY = Math.max(minY, Math.min(maxY, translateY));
      } else {
        translateY = (rect.height - imgHeight) / 2;
      }
    }
  
    function resetZoom() {
      const rect = container.getBoundingClientRect();
      scale = rect.width / img.naturalWidth;
      minScale = scale;
  
      const scaledWidth = img.naturalWidth * scale;
      translateX = (rect.width - scaledWidth) / 2;
      translateY = 0;
  
      updateTransform();
    }
  
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newScale = Math.min(Math.max(minScale, scale + delta), 3);
      const scaleChange = newScale / scale;
      scale = newScale;
  
      const rect = container.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
  
      translateX -= (offsetX - translateX) * (scaleChange - 1);
      translateY -= (offsetY - translateY) * (scaleChange - 1);
  
      updateTransform();
    });
  
    container.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      img.style.cursor = 'grabbing';
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
      img.style.cursor = 'grab';
    });
  
    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
  
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
  
      limitPan();
      updateTransform();
    });
  
    if (resetBtn) {
      resetBtn.addEventListener('click', resetZoom);
    }
  
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
  
    function zoom(delta) {
      const newScale = Math.min(Math.max(minScale, scale + delta), 3);
      const scaleChange = newScale / scale;
      scale = newScale;
  
      const rect = container.getBoundingClientRect();
      const offsetX = rect.width / 2;
      const offsetY = rect.height / 2;
  
      translateX -= (offsetX - translateX) * (scaleChange - 1);
      translateY -= (offsetY - translateY) * (scaleChange - 1);
  
      updateTransform();
    }
  
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => zoom(0.1));
    }
  
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => zoom(-0.1));
    }
  
    function waitForVisibilityAndInit() {
      const rect = container.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 && img.complete;
  
      if (isVisible) {
        resetZoom();
        updateTransform();
      } else {
        setTimeout(waitForVisibilityAndInit, 50);
      }
    }
  
    waitForVisibilityAndInit();
  };
  