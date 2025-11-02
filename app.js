
const container = document.getElementById('workoutContainer');
const syncBtn = document.getElementById('syncBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const darkToggle = document.getElementById('darkToggle');

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzt0WU6KPVlF6LIXCKO57dUse5-Er_m-yBch-C5nChqwb2hlERhSzULjG3_O0--RUSF/exec";

let workouts = [];
let progress = JSON.parse(localStorage.getItem('progress') || '{}');

function embedVideo(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([\w-]+)/);
  if (match) {
    return \`<iframe src="https://www.youtube.com/embed/\${match[1]}" frameborder="0" allowfullscreen></iframe>\`;
  }
  return "";
}

function render() {
  container.innerHTML = "";
  const days = [...new Set(workouts.map(w => w.Day))];

  days.forEach(day => {
    const section = document.createElement('div');
    section.className = 'day-section';
    const workoutsForDay = workouts.filter(w => w.Day === day);

    section.innerHTML = \`
      <h2>\${day} <button onclick="resetDay('\${day}')">Reset</button></h2>
      \${workoutsForDay.map((w, i) => {
        const key = \`\${day}-\${i}\`;
        const checked = progress[key] ? 'checked' : '';
        return \`
          <div class="workout">
            <strong>\${w.Workout}</strong> - \${w.Category}<br/>
            \${w.Notes}<br/>
            <label>
              <input type="checkbox" onchange="toggleCheck('\${key}')" \${checked}/> Done
            </label>
            \${w["Link to Video"] ? embedVideo(w["Link to Video"]) : ""}
          </div>
        \`;
      }).join("")}
    \`;

    container.appendChild(section);
  });
}

function toggleCheck(key) {
  progress[key] = !progress[key];
  localStorage.setItem('progress', JSON.stringify(progress));
}

function resetDay(day) {
  if (!confirm(\`Reset progress for \${day}?\`)) return;
  const keys = Object.keys(progress).filter(k => k.startsWith(day));
  keys.forEach(k => delete progress[k]);
  localStorage.setItem('progress', JSON.stringify(progress));
  render();
}

function resetAll() {
  if (!confirm("Reset ALL progress?")) return;
  progress = {};
  localStorage.removeItem('progress');
  render();
}

function fetchWorkouts() {
  fetch(SHEET_URL)
    .then(res => res.json())
    .then(data => {
      workouts = data;
      render();
    });
}

function toggleDark() {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark', document.body.classList.contains('dark'));
}

if (localStorage.getItem('dark') === 'true') {
  document.body.classList.add('dark');
}

darkToggle.onclick = toggleDark;
syncBtn.onclick = fetchWorkouts;
resetAllBtn.onclick = resetAll;

fetchWorkouts();
