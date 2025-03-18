const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Proper CORS Configuration
const corsOptions = {
  origin: "https://store.exportech.com.pt",  // ✅ Allow frontend origin
  methods: ["GET", "POST", "OPTIONS"],        // ✅ Allow GET, POST, and OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// ✅ Apply CORS Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: "100mb" }));  // ✅ Increase request size limit
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// ✅ Handle Preflight Requests (CORS for POST)
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(204);
});

// ✅ Test Route - Works Fine
app.get("/", (req, res) => {
  res.status(200).json("Hello world of time boys!");
});

// ✅ POST Route - Ensure CORS Headers are Present
app.post("/sendfileconfig", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://store.exportech.com.pt"); // ✅ Important for POST
  console.log("📩 Incoming Email:", req.body.email);  // ✅ Debugging Info

  res.status(200).json({ message: "GOOD JOB kiosso!!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

