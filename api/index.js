const app = require("../backend/src/app");

// Explicitly handle /api or /api/ to avoid "Cannot GET /api"
app.get("/api", (req, res) => {
    res.json({ message: "KaryaSetu API is running!", status: "safe" });
});

module.exports = app;
