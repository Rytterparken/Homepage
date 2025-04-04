window.renderCalendarFromXLSX = function () {
    fetch("kalender.xlsx")
      .then(res => res.arrayBuffer())
      .then(data => {
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
  
        const calendarList = document.getElementById("calendar-list");
        if (!calendarList) return;
  
        calendarList.innerHTML = ""; // Fjern placeholder
        rows.forEach(event => {
          const li = document.createElement("li");
          li.className = "mb-3";
          li.innerHTML = `
            <strong>${event.Titel}</strong><br>
            📍 ${event.Sted} – <em>${event.Dato}</em>
          `;
          calendarList.appendChild(li);
        });
      })
      .catch(err => {
        console.error("Kunne ikke indlæse kalender:", err);
      });
  };
  