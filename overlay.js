// === CONFIG ====
const API_URL = "https://script.google.com/macros/s/AKfycbwpG_Gx-QIbE11RzyK41zMBk5EGFicax8A3lrhrK5XyXGjFD-nQ1fmBP89Wg5GQHL6x/exec";
const POLL_INTERVAL = 15000; // 15 seconds

let prev = {};
let prevLeaderId = null;

// Main polling loop
async function fetchAndRender() {
  try {
    const res = await fetch(API_URL);
    const json = await res.json();
    const standings = json.standings;

    const tbody = document.getElementById("standings-body");
    tbody.innerHTML = "";

    let curr = {};
    const newLeader = standings[0]?.id;

    standings.forEach(row => {
      curr[row.id] = row;

      const tr = document.createElement("tr");

      const p = prev[row.id];
      const rankMovement = p ? (p.rank - row.rank) : 0;
      const fishMovement = p ? (row.fish_count - p.fish_count) : 0;

      // Leader highlighting + animation
      if (row.id === newLeader) {
        tr.classList.add("leader");
        if (prevLeaderId && prevLeaderId !== newLeader) {
          tr.classList.add("leader-change");
        }
      }

      // Rank up/down animations
      if (rankMovement > 0) tr.classList.add("rank-up");
      if (rankMovement < 0) tr.classList.add("rank-down");

      // New fish animation
      if (fishMovement > 0) tr.classList.add("new-fish");

      tr.innerHTML = `
        <td>${row.rank}</td>
        <td>${row.angler_name}</td>
        <td>${row.fish_count}</td>
        <td>${row.score.toFixed(2)}</td>
      `;

      tbody.appendChild(tr);

      setTimeout(() => {
        tr.classList.remove("leader-change", "rank-up", "rank-down", "new-fish");
      }, 1400);
    });

    // Update footer
    document.getElementById("last-updated").textContent =
      "Last updated: " + new Date().toLocaleTimeString();

    prev = curr;
    prevLeaderId = newLeader;

  } catch (err) {
    console.error("Overlay error:", err);
    document.getElementById("last-updated").textContent = "Error updating data";
  }
}

fetchAndRender();
setInterval(fetchAndRender, POLL_INTERVAL);
