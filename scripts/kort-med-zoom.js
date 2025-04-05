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

  function waitForImageAndInit() {
    const rect = container.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && img.complete;
    if (isVisible) {
      resetZoom();
    } else {
      setTimeout(waitForImageAndInit, 50);
    }
  }

  // 🎯 Event bindings
  container.addEventListener('wheel', onWheel);
  container.addEventListener('mousedown', onMouseDown);
  container.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  if (resetBtn) resetBtn.addEventListener('click', resetZoom);
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoom(0.1));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoom(-0.1));

  waitForImageAndInit();
};
