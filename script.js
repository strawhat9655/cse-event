let selectedMood = "";

/* SET MOOD */
function setMood(mood) {
    selectedMood = mood;
}

/* REGISTER */
async function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        document.getElementById("message").innerText = "❌ Fill all fields";
        return;
    }

    const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    document.getElementById("message").innerText =
        data.success ? "✅ Registered Successfully!" : "❌ " + data.message;
}

/* LOGIN */
async function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
        localStorage.setItem("userEmail", email);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("message").innerText = "❌ Invalid login";
    }
}

/* SAVE ENTRY */
async function saveEntry() {
    const email = localStorage.getItem("userEmail");
    const sleep = document.getElementById("sleep").value;
    const stress = document.getElementById("stress").value;

    if (!selectedMood) {
        alert("⚠ Please select a mood");
        return;
    }

    await fetch("/saveEntry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            mood: selectedMood,
            sleep,
            stress
        })
    });

    generateSuggestion(selectedMood, sleep, stress);
    loadCharts();
}

/* SUGGESTIONS */
function generateSuggestion(mood, sleep, stress) {
    let suggestion = "";

    if (Number(sleep) < 6) {
        suggestion += "😴 You need more sleep! Try 7-8 hours.\n";
    }

    if (Number(stress) > 7) {
        suggestion += "🧘 High stress detected. Try meditation.\n";
    }

    if (mood.includes("Sad")) {
        suggestion += "🎵 Listen to relaxing music or watch anime.\n";
    }

    document.getElementById("suggestion").innerText = suggestion;
}

/* LOAD CHARTS */
async function loadCharts() {
    const email = localStorage.getItem("userEmail");
    const res = await fetch(`/getEntries/${email}`);
    const entries = await res.json();

    const last7 = entries.slice(-7);

    const moodCounts = {};
    const sleepData = [];

    last7.forEach(e => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
        sleepData.push(Number(e.sleep));
    });

    if (document.getElementById("moodChart")) {
        new Chart(document.getElementById("moodChart"), {
            type: "bar",
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    label: "Mood Frequency",
                    data: Object.values(moodCounts)
                }]
            }
        });
    }

    if (document.getElementById("sleepChart")) {
        new Chart(document.getElementById("sleepChart"), {
            type: "line",
            data: {
                labels: last7.map((_, i) => `Day ${i + 1}`),
                datasets: [{
                    label: "Sleep Hours",
                    data: sleepData
                }]
            }
        });
    }
}

/* SAVE JOURNAL */
async function saveJournal() {
    const email = localStorage.getItem("userEmail");
    const text = document.getElementById("journalText").value;

    const res = await fetch("/saveJournal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, text })
    });

    const data = await res.json();

    document.getElementById("journalStatus").innerText =
        data.success ? "✅ Journal Saved!" : "❌ Error saving journal";

    loadJournals();
}

/* LOAD JOURNALS */
async function loadJournals() {
    const email = localStorage.getItem("userEmail");
    const res = await fetch(`/getJournals/${email}`);
    const journals = await res.json();

    const container = document.getElementById("journalList");
    if (!container) return;

    container.innerHTML = "";

    journals.reverse().forEach(j => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p><strong>📅 ${new Date(j.date).toLocaleString()}</strong></p>
            <p>${j.text}</p>
            <hr>
        `;
        container.appendChild(div);
    });
}

/* AUTO LOAD JOURNAL PAGE */
if (window.location.pathname.includes("journal.html")) {
    loadJournals();
}
/* GO BACK TO DASHBOARD */
function goBack() {
    window.location.href = "dashboard.html";
}