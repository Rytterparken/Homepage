window.renderCalendar = function () {
  const USE_LIVE_DATA = window.USE_LIVE_DATA;
  const sheetName = "Kalender";
  const deadlineSheet = "Forslags Deadline";

  const calendarList = document.getElementById("calendar-list");
  if (!calendarList) return;
  calendarList.innerHTML = "";

  const kalenderUrl = USE_LIVE_DATA
    ? `${window.GOOGLE_SHEETS_DATA}?ark=${sheetName}`
    : "data/kalender.xlsx";

  const deadlineUrl = USE_LIVE_DATA
    ? `${window.GOOGLE_SHEETS_DATA}?ark=${deadlineSheet}`
    : "data/forslags-deadline.json";

  const fetchCalendarData = USE_LIVE_DATA
    ? fetch(kalenderUrl).then(res => res.json())
    : fetch(kalenderUrl)
        .then(res => res.arrayBuffer())
        .then(data => {
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          return XLSX.utils.sheet_to_json(sheet, { raw: false });
        });

  const fetchDeadlineData = fetch(deadlineUrl).then(res => res.json());

  Promise.all([fetchCalendarData, fetchDeadlineData])
    .then(([rows, deadlineRaw]) => {
      const deadlineDatoStr = USE_LIVE_DATA
        ? deadlineRaw[0]["næstedeadline"]
        : deadlineRaw["naeste-deadline"];

      if (deadlineDatoStr) {
        rows.push({
          dato: deadlineDatoStr,
          tid: "23:59",
          titel: "Deadline for forslag",
          sted: "-",
          type: "Alle",
        });
      }

      renderCalendarItems(rows, USE_LIVE_DATA);
    })
    .catch(err => {
      console.error("Fejl ved hentning af kalender eller deadline:", err);
    });

  function renderCalendarItems(rows, isLive) {
  
    const getDateTime = row => {
      const dato = isLive ? row.dato : row.Dato;
      const tid = isLive ? row.tid : row.Tid || "00:00";
      if (!dato) return null;
      
      let day, month, year;
    
      if (dato.includes("/")) {
        // dd/mm/yyyy
        [day, month, year] = dato.split("/");
      } else if (dato.includes("-")) {
        // yyyy-mm-dd
        [year, month, day] = dato.split("-");
      } else {
        return null;
      }
    
      const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${tid}`;
      const parsed = new Date(isoString);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const now = new Date();

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

      const isDeadline = (titel || "").toLowerCase().includes("deadline");
      if (isDeadline) {
        badgeHTML = `<span class="badge ms-1" style="background-color: #fff8d6; color: #856404; border: 1px solid #ffeeba;">📌 Deadline</span>`;
      } else if (type === "intern") {
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
