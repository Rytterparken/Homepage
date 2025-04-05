window.renderCalendarFromXLSX = function () {
  fetch("kalender.xlsx")
    .then(res => res.arrayBuffer())
    .then(data => {
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { raw: false });

      const calendarList = document.getElementById("calendar-list");
      calendarList.innerHTML = "";

      rows.forEach(event => {
        const date = new Date(event.Dato);
        const formattedDate = date.toLocaleDateString('da-DK', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        // Bestem badge afhængig af Type
        let badgeHTML = "";
        if (event.Type?.toLowerCase() === "intern") {
          badgeHTML = `<span class="badge bg-secondary ms-1">Kun bestyrelsen</span>`;
        } else if (event.Type?.toLowerCase() === "offentlig") {
          badgeHTML = `<span class="badge bg-success ms-1">For medlemmer</span>`;
        }

        const li = document.createElement("li");
        li.className = "mb-3";
        li.innerHTML = `
          <strong>${event.Titel}</strong> ${badgeHTML}<br>
          📍 ${event.Sted} – <em>${formattedDate}</em>
        `;
        calendarList.appendChild(li);
      });
    });
};
