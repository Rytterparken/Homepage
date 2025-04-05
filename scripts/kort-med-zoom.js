window.enableZoomPanOnMap = function () {
  const img = document.getElementById('zoom-image');
  const container = document.getElementById('zoom-container');
  const resetBtn = document.getElementById('reset-map-btn');
  const zoomInBtn = document.getElementById('zoom-in-btn');
  const zoomOutBtn = document.getElementById('zoom-out-btn');
  if (!img || !container) return;

  let scale = 1, minScale = 1;
  let translateX = 0, translateY = 0;
  let isDragging = false, startX, startY;

  // Touch variables
  let initialPinchDistance = null;
  let initialScale = 1;

  function updateTransform() {
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function limitPan() {
    const rect = container.getBoundingClientRect();
    const imgWidth = img.naturalWidth * scale;
    const imgHeight = img.naturalHeight * scale;

    translateX = imgWidth > rect.width
      ? Math.max(rect.width - imgWidth, Math.min(0, translateX))
      : (rect.width - imgWidth) / 2;

    translateY = imgHeight > rect.height
      ? Math.max(rect.height - imgHeight, Math.min(0, translateY))
      : (rect.height - imgHeight) / 2;
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

  function onWheel(e) {
    e.preventDefault();
    zoom(-e.deltaY * 0.001);
  }

  function onMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    img.style.cursor = 'grabbing';
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    limitPan();
    updateTransform();
  }

  function onMouseUp() {
    isDragging = false;
    img.style.cursor = 'grab';
  }

  function getTouchDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 🎯 Touch events
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDistance = getTouchDistance(e.touches[0], e.touches[1]);
      initialScale = scale;
    }
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - startX;
      translateY = e.touches[0].clientY - startY;
      limitPan();
      updateTransform();
    } else if (e.touches.length === 2) {
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      if (initialPinchDistance) {
        let newScale = initialScale * (currentDistance / initialPinchDistance);
        newScale = Math.min(Math.max(minScale, newScale), 3);
        const scaleChange = newScale / scale;
        scale = newScale;

        const rect = container.getBoundingClientRect();
        const offsetX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const offsetY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

        translateX -= (offsetX - translateX) * (scaleChange - 1);
        translateY -= (offsetY - translateY) * (scaleChange - 1);

        limitPan();
        updateTransform();
      }
    }
  }, { passive: false });

  container.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialPinchDistance = null;
      isDragging = false;
    }
  });

  function waitForImageAndInit() {
    const rect = container.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && img.complete;
    if (isVisible) {
      resetZoom();
    } else {
      setTimeout(waitForImageAndInit, 50);
    }
  }

  // 🔗 Event bindings
  container.addEventListener('wheel', onWheel);
  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  if (resetBtn) resetBtn.addEventListener('click', resetZoom);
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoom(0.1));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoom(-0.1));

  waitForImageAndInit();
};
