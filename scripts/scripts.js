// Årlig forslagsfrist uden årstal (fx "15/2"). Næste/sidste udledes af, om datoen i år er passeret.
window.getForslagsDeadlineValue = function (deadlineRaw) {
  if (deadlineRaw == null) return "";
  const row = Array.isArray(deadlineRaw) ? deadlineRaw[0] : deadlineRaw;
  if (row == null) return String(deadlineRaw);
  if (typeof row !== "object") return String(row);
  return row.deadline || row.Deadline || row.næstedeadline || row["naeste-deadline"] || "";
};

window.resolveYearlyDeadline = function (datoStr, now) {
  now = now || new Date();
  if (datoStr == null || datoStr === "") return null;

  let day, month;
  if (datoStr instanceof Date && !isNaN(datoStr.getTime())) {
    day = datoStr.getDate();
    month = datoStr.getMonth() + 1;
  } else {
    const str = String(datoStr).trim();
    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const slash = str.match(/^(\d{1,2})[./](\d{1,2})(?:[./]\d{2,4})?/);
    if (iso) {
      month = Number(iso[2]);
      day = Number(iso[3]);
    } else if (slash) {
      day = Number(slash[1]);
      month = Number(slash[2]);
    } else {
      return null;
    }
  }

  if (!day || !month || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const startOf = (year) => new Date(year, month - 1, day);
  const endOf = (year) => new Date(year, month - 1, day, 23, 59, 59, 999);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisYearStart = startOf(now.getFullYear());
  // På selve deadline-dagen skiftes der til næste år.
  const nextYear = today >= thisYearStart ? now.getFullYear() + 1 : now.getFullYear();
  const previousYear = nextYear - 1;

  return {
    day,
    month,
    next: startOf(nextYear),
    previous: startOf(previousYear),
    nextEnd: endOf(nextYear),
    previousEnd: endOf(previousYear)
  };
};

// Load external HTML files into the corresponding sections
function loadSection(sectionId, url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById(sectionId).innerHTML = data;
      if (typeof callback === "function") callback();
    })
    .catch(error => console.error(`Error loading ${sectionId}:`, error));
}

// Vis kun én sektion ad gangen og opdater navigation
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }

  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.classList.remove('active');
  });

  const matchingLink = document.querySelector(`.nav-link[data-section="${id}"]`);
  if (matchingLink) {
    matchingLink.classList.add('active');
  }
}

// Load sektioner
loadSection('faq', 'faq.html', renderFAQ);
loadSection('dokumenter', 'dokumenter.html', function () {
  if (typeof renderDokumenter === "function") {
    renderDokumenter();
  }
});
loadSection('hvem-er-vi', 'hvem-er-vi.html', function () {
  const base = window.GOOGLE_SHEETS_DATA;
  const isLive = window.USE_LIVE_DATA;

  const prefix = isLive ? base + "?ark=" : "data/roller/";
  const suffix = isLive ? "" : ".json";

  renderRolleListe("bestyrelse-render", `${prefix}Bestyrelse${suffix}`);
  renderRolleListe("suppleanter-render", `${prefix}Suppleanter${suffix}`);
  renderRolleListe("revisorer-render", `${prefix}Revisorer${suffix}`);
  renderRolleListe("legepladsudvalg-render", `${prefix}Legepladsudvalg${suffix}`);
});


loadSection('vores-arbejde', 'vores-arbejde.html', renderOpgaverAccordion);
loadSection('for-beboere', 'for-beboere.html', function () {
  renderHouses();
  initMailchimpForm();
  if (typeof renderCalendar === "function") {
    renderCalendar();
  }
  enableZoomPanOnMap();
});
loadSection('forslag', 'forslag.html', renderForslag);

// Når vedtægter er loadet, så initialiser tabs korrekt
loadSection('vedtaegter', 'vedtaegter.html', renderVedtaegter);

// Vis forside som udgangspunkt
document.addEventListener("DOMContentLoaded", function () {
  showSection('forside');
  const navbarCollapse = document.getElementById("navbarNav");
  const navLinks = navbarCollapse.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      // Luk kun hvis burger-menuen er synlig (uanset skærmbredde)
      const toggler = document.querySelector('.navbar-toggler');
      const isVisible = window.getComputedStyle(toggler).display !== "none";

      if (isVisible) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });
});
