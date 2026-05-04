async function loadCSV() {
  const response = await fetch('./scores.csv');
  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(s => s.trim());
  
  return lines.slice(1).map(line => {
    const cells = line.split(",").map(s => s.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
}

function toNumber(x) {
  if (x === "" || x == null) return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function computeStandings(rows) {
  if (!rows || rows.length === 0) return [];
  
  const eventNames = Object.keys(rows[0]).filter(k => k !== "team" && k !== "Total");

  return rows.map(r => {
    const scores = eventNames
      .map(e => toNumber(r[e]))
      .filter(v => v != null);

    const total = scores.reduce((a, b) => a + b, 0);

    let dropped = null;
    let totalAfterDrop = total;

    if (scores.length >= 2) {
      dropped = Math.min(...scores);
      totalAfterDrop = total - dropped;
    }

    return {
      team: r.team,
      total: total.toFixed(2),
      dropped: dropped !== null ? dropped.toFixed(2) : "-",
      totalAfterDrop: totalAfterDrop.toFixed(2)
    };
  }).sort((a, b) => parseFloat(b.totalAfterDrop) - parseFloat(a.totalAfterDrop));
}

function renderTable(standings) {
  const tbody = document.querySelector("#standings tbody");
  tbody.innerHTML = "";

  standings.forEach((s, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${s.team}</td>
      <td>${s.total}</td>
      <td>${s.dropped}</td>
      <td><b>${s.totalAfterDrop}</b></td>
    `;
    tbody.appendChild(tr);
  });
}

(async function main() {
  try {
    const rows = await loadCSV();
    const standings = computeStandings(rows);
    renderTable(standings);
  } catch (err) {
    console.error("Error loading standings:", err);
    document.getElementById("standings").insertAdjacentHTML('afterend', 
      '<p style="color:red;">Error loading scores.csv — check console (F12)</p>');
  }
})();
