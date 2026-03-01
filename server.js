const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const DATA_FILE = path.join(__dirname, "data.json");

// Create data.json if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }, null, 2));
}

// Read Data
function readData() {
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
}

// Write Data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* ================= REGISTER ================= */
app.post("/register", (req, res) => {
    const { email, password } = req.body;
    const data = readData();

    if (data.users.find(u => u.email === email)) {
        return res.json({ success: false, message: "User exists" });
    }

    data.users.push({
        email,
        password,
        entries: [],
        journals: []
    });

    writeData(data);
    res.json({ success: true });
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const data = readData();

    const user = data.users.find(
        u => u.email === email && u.password === password
    );

    if (!user) return res.json({ success: false });

    res.json({ success: true });
});

/* ================= SAVE ENTRY ================= */
app.post("/saveEntry", (req, res) => {
    const { email, mood, sleep, stress } = req.body;
    const data = readData();

    const user = data.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    user.entries.push({
        mood,
        sleep,
        stress,
        date: new Date().toISOString()
    });

    writeData(data);
    res.json({ success: true });
});

/* ================= GET ENTRIES ================= */
app.get("/getEntries/:email", (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.email === req.params.email);

    if (!user) return res.json([]);

    res.json(user.entries);
});

/* ================= SAVE JOURNAL ================= */
app.post("/saveJournal", (req, res) => {
    const { email, text } = req.body;
    const data = readData();

    const user = data.users.find(u => u.email === email);
    if (!user) return res.json({ success: false });

    user.journals.push({
        text,
        date: new Date().toISOString()
    });

    writeData(data);
    res.json({ success: true });
});

/* ================= GET JOURNALS ================= */
app.get("/getJournals/:email", (req, res) => {
    const data = readData();
    const user = data.users.find(u => u.email === req.params.email);

    if (!user) return res.json([]);

    res.json(user.journals);
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
    console.log("🚀 Server running on port " + PORT);
});

