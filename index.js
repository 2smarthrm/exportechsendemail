const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Fix CORS: Allow requests from your frontend
const corsOptions = {
  origin: "https://store.exportech.com.pt", // Only allow your frontend
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ Handle preflight CORS requests

app.use(express.json({ limit: "100mb" })); // ✅ Increase body limit
app.use(express.urlencoded({ extended: true, limit: "100mb" })); // ✅ Handle large payloads

// ✅ Test GET Route
app.get("/", (req, res) => {
  res.status(200).json("Hello world of time boys !");
});

// ✅ Test POST Route
app.post("/sendfileconfig", async (req, res) => {
  console.log("Received request:", req.body);
  return res.status(200).json("GOOD JOB kiosso !!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
