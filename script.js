let selectedMood = "";
// 🔐 AUTH CHECK
function checkLogin() {
    const email = localStorage.getItem("userEmail");

    if (!email && 
        (window.location.pathname.includes("dashboard.html") ||
         window.location.pathname.includes("journal.html"))) {

        window.location.href = "index.html";
    }
}

checkLogin();
/* SET MOOD */
function setMood(mood) {
    selectedMood = mood;

    const buttons = document.querySelectorAll(".mood-btn");
    buttons.forEach(btn => btn.classList.remove("active-mood"));

    const selectedButton = Array.from(buttons).find(
        btn => btn.getAttribute("data-mood") === mood
    );

    if (selectedButton) {
        selectedButton.classList.add("active-mood");
    }

    changeBackground(mood);
    showQuote(mood);
}
function changeBackground(mood) {
    document.body.classList.remove("happy-bg","sad-bg","angry-bg","tired-bg");

    if (mood.includes("Happy")) {
        document.body.classList.add("happy-bg");
    }
    if (mood.includes("Sad")) {
        document.body.classList.add("sad-bg");
    }
    if (mood.includes("Angry")) {
        document.body.classList.add("angry-bg");
    }
    if (mood.includes("Tired")) {
        document.body.classList.add("tired-bg");
    }
}
function showQuote(mood) {

    const quotes = {
        Happy: [
            "🌞 Keep shining. The world needs your light.",
            "✨ Happiness looks good on you.",
            "🎉 Smile — today is yours."
        ],
        Sad: [
            "🌈 After rain comes a rainbow.",
            "💙 It's okay to feel low. You are not alone.",
            "🌟 Tough times don’t last, strong people do."
        ],
        Angry: [
            "🔥 Calm mind brings inner strength.",
            "🧘 Breathe in peace, breathe out anger.",
            "🌿 Control your reaction, control your power."
        ],
        Tired: [
            "😴 Rest is productive too.",
            "🌙 Small breaks create big energy.",
            "⚡ Recharge yourself. You deserve it."
        ]
    };

    let moodKey = "";

    if (mood.includes("Happy")) moodKey = "Happy";
    if (mood.includes("Sad")) moodKey = "Sad";
    if (mood.includes("Angry")) moodKey = "Angry";
    if (mood.includes("Tired")) moodKey = "Tired";

    if (!moodKey) return;

    const randomQuote =
        quotes[moodKey][Math.floor(Math.random() * quotes[moodKey].length)];

    document.getElementById("dailyQuote").innerText = randomQuote;
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
    let music = "";

    if (Number(sleep) < 6) {
        suggestion += "😴 You need more sleep! Try 7-8 hours.\n";
    }

    if (Number(stress) > 7) {
        suggestion += "🧘 High stress detected. Try meditation.\n";
    }

    if (mood.includes("Happy")) {
        music = `
        <p>🎵 Energetic Playlist:</p>
        <a href="https://www.youtube.com/watch?v=ZbZSe6N_BXs" target="_blank">Happy - Pharrell Williams</a>
        `
        ;
    }

    if (mood.includes("Sad")) {
        music = `
        <p>🎵 Calm & Healing Music:</p>
        <a href="https://youtu.be/mRD0-GxqHVo?si=ykj_TcGzelnWZTJF" target="_blank">Heat Waves</a>
        `;
    }

    if (mood.includes("Angry")) {
        music = `
        <p>🎵 Stress Relief Beats:</p>
        <a href="https://youtu.be/0GVExpdmoDs?si=i7GAjb2sl9OX7di5" target="_blank"> Animals </a>
        `;
    }

    if (mood.includes("Tired")) {
        music = `
        <p>🎵 Focus Music:</p>
        <a href="https://www.youtube.com/watch?v=5qap5aO4i9A" target="_blank">24/7 Lofi Radio</a>
        `;
    }

    document.getElementById("suggestion").innerText = suggestion;
    document.getElementById("musicSuggestion").innerHTML = music;
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
// 👤 Display logged user
window.addEventListener("DOMContentLoaded", () => {

    const email = localStorage.getItem("userEmail");

    // Show email in dropdown
    const userDisplay = document.getElementById("loggedUser");
    if (userDisplay && email) {
        userDisplay.innerText = email;
    }

    // Generate first letter avatar
    const avatar = document.getElementById("avatarLetter");
    if (avatar && email) {
        avatar.innerText = email.charAt(0).toUpperCase();
        avatar.style.background = generateColorFromEmail(email);
    }

});
// 🚪 LOGOUT
function logout() {
    localStorage.removeItem("userEmail");
    window.location.href = "index.html";
}
function toggleUserMenu() {
    const menu = document.getElementById("userMenu");
    menu.classList.toggle("show");
}
function generateColorFromEmail(email) {
    const colors = [
        "#ff6b6b",
        "#6c5ce7",
        "#00b894",
        "#fdcb6e",
        "#0984e3",
        "#e84393"
    ];

    let index = email.charCodeAt(0) % colors.length;
    return colors[index];
}
