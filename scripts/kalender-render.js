window.renderCalendar = function () {
  const USE_LIVE_DATA = window.USE_LIVE_DATA;
  const sheetName = "Kalender";

  const dataUrl = USE_LIVE_DATA
    ? `${window.GOOGLE_SHEETS_DATA}?ark=${sheetName}`
    : "data/kalender.xlsx";

  const calendarList = document.getElementById("calendar-list");
  if (!calendarList) return;
  calendarList.innerHTML = "";

  if (USE_LIVE_DATA) {
    // Brug Google Sheets
    fetch(dataUrl)
      .then(res => res.json())
      .then(rows => {
        renderCalendarItems(rows, true);
      })
      .catch(err => {
        console.error("Kunne ikke hente kalenderdata fra Sheets:", err);
      });
  } else {
    // Brug lokal Excel-fil
    fetch(dataUrl)
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });
        renderCalendarItems(rows, false);
      })
      .catch(err => {
        console.error("Fejl ved lokal kalenderfil:", err);
      });
  }

  function renderCalendarItems(rows, isLive) {
    const getDateTime = row => {
      const dato = isLive ? row.dato : row.Dato;
      const tid = isLive ? row.tid : row.Tid || "00:00";
  
      if (!dato) return null;
  
      const [day, month, year] = dato.split("/");
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${tid}`;
      return new Date(isoString);
    };
  
    const now = new Date();
  
    // Filtrér ud begivenheder før dags dato og tid
    const upcomingRows = rows
      .map(row => ({ ...row, __datetime: getDateTime(row) }))
      .filter(row => row.__datetime && row.__datetime >= now)
      .sort((a, b) => a.__datetime - b.__datetime);
  
    upcomingRows.forEach(event => {
      const dato = isLive ? event.dato : event.Dato;
      const tid = isLive ? event.tid : event.Tid;
      const titel = isLive ? event.titel : event.Titel;
      const sted = isLive ? event.sted : event.Sted;
      const type = (isLive ? event.type : event.Type || "").toLowerCase();
  
      const formattedDate = dato || "Ukendt dato";
      const formattedTime = tid ? ` kl. ${tid}` : "";
  
      let badgeHTML = "";
      if (type === "intern") {
        badgeHTML = `<span class="badge bg-secondary ms-1">Kun bestyrelsen</span>`;
      } else if (type === "alle") {
        badgeHTML = `<span class="badge bg-success ms-1">For medlemmer</span>`;
      }
  
      const stedText = sted && sted !== "-" ? `📍 ${sted} – ` : "";
  
      const li = document.createElement("li");
      li.className = "mb-3";
      li.innerHTML = `
        <strong>${titel || "Ukendt titel"}</strong> ${badgeHTML}<br>
        ${stedText}<em>${formattedDate}${formattedTime}</em>
      `;
      calendarList.appendChild(li);
    });
  }  
};
