
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzt0WU6KPVlF6LIXCKO57dUse5-Er_m-yBch-C5nChqwb2hlERhSzULjG3_O0--RUSF/exec";
let allWorkouts = {};

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
  }
});

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function fetchData() {
  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      allWorkouts = groupByDay(data);
      renderDays();
    })
    .catch(err => {
      alert("Failed to fetch workouts.");
      console.error(err);
    });
}

function groupByDay(data) {
  const map = {};
  data.forEach(row => {
    const day = row.Day.trim();
    if (!map[day]) map[day] = [];
    map[day].push(row);
  });
  return map;
}

function renderDays() {
  document.getElementById("days-list").innerHTML = "";
  for (let day in allWorkouts) {
    const btn = document.createElement("div");
    btn.className = "day-button";
    btn.textContent = day;
    btn.onclick = () => showWorkouts(day);
    document.getElementById("days-list").appendChild(btn);
  }
  document.getElementById("days-list").classList.remove("hidden");
  document.getElementById("workout-container").classList.add("hidden");
}

function showWorkouts(day) {
  const list = document.getElementById("workouts-list");
  list.innerHTML = "";
  document.getElementById("day-title").textContent = day;

  allWorkouts[day].forEach((w, idx) => {
    const card = document.createElement("div");
    card.className = "workout-card";
    const checked = localStorage.getItem(`${day}-${idx}`) === "true";

    card.innerHTML = \`
      <strong>Workout:</strong><br/>
      <input value="\${w.Workout}" onchange="updateWorkout('\${day}', \${idx}, 'Workout', this.value)">
      <br/><strong>Category:</strong><br/>
      <input value="\${w.Category}" onchange="updateWorkout('\${day}', \${idx}, 'Category', this.value)">
      <br/><strong>Notes:</strong><br/>
      <textarea onchange="updateWorkout('\${day}', \${idx}, 'Notes', this.value)">\${w.Notes}</textarea>
      <br/><iframe src="\${w['Link to Video'].replace('watch?v=', 'embed/')}" allowfullscreen></iframe>
      <br/><button onclick="toggleDone('\${day}', \${idx}, this)">\${checked ? '✅ Done' : 'Mark Done'}</button>
      <button onclick="resetWorkout('\${day}', \${idx})">Reset</button>
    \`;
    if (checked) card.style.opacity = 0.6;
    list.appendChild(card);
  });

  document.getElementById("days-list").classList.add("hidden");
  document.getElementById("workout-container").classList.remove("hidden");
}

function toggleDone(day, idx, btn) {
  const key = \`\${day}-\${idx}\`;
  const current = localStorage.getItem(key) === "true";
  localStorage.setItem(key, !current);
  btn.textContent = !current ? "✅ Done" : "Mark Done";
  btn.parentElement.style.opacity = !current ? 0.6 : 1;
}

function resetWorkout(day, idx) {
  localStorage.removeItem(\`\${day}-\${idx}\`);
  fetchData();
}

function resetAll() {
  if (confirm("Reset all workouts?")) {
    localStorage.clear();
    fetchData();
  }
}

function goBack() {
  renderDays();
}

function updateWorkout(day, idx, field, value) {
  allWorkouts[day][idx][field] = value;
}
