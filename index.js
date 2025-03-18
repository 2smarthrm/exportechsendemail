const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS Configuration - Allow Specific Frontend Origin
app.use(cors({
  origin: "https://store.exportech.com.pt",  // ✅ Allow only your frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json()); // ✅ Enable JSON request parsing

// ✅ Handle Preflight CORS Requests Properly
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204); // No Content
});

// ✅ Test Route
app.get("/", (req, res) => {
  res.status(200).json("Hello world of time boys!");
});

// ✅ API Route - Send Email
app.post("/sendfileconfig", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt"); // ✅ Ensure this is included in the response
  res.status(200).json({ message: "GOOD JOB kiosso!!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
