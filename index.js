const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: "https://store.exportech.com.pt", // Allow requests only from your frontend
  methods: ["GET", "POST", "OPTIONS"], // Allow necessary HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors()); // ✅ Handle preflight CORS requests
app.use(express.json()); // ✅ Enable JSON request parsing

// ✅ Test Route
app.get("/", (req, res) => {
  res.status(200).json("Hello world of time boys!");
});

// ✅ Example POST Route
app.post("/sendfileconfig", (req, res) => {
  res.status(200).json({ message: "GOOD JOB kiosso!!" });
});

// ✅ Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
