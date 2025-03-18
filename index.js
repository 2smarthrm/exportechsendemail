  const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS Configuration - Ensure it applies to ALL responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ Enable CORS for OPTIONS (Preflight requests)
app.options("*", (req, res) => {
  res.sendStatus(204);
});

// ✅ Ensure Express handles large JSON payloads
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// ✅ Test GET Route
app.get("/", (req, res) => {
  res.status(200).json("Hello world of time boys!");
});

// ✅ Fix for POST Route - Ensure CORS headers are present
app.post("/sendfileconfig", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt"); // ✅ Important for POST
  res.status(200).json({ message: "GOOD JOB kiosso!!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

