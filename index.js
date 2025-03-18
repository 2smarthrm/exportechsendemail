 const express = require("express"); 
const cors = require("cors"); 

const app = express();

const corsOptions = {
  origin: "https://store.exportech.com.pt", // ✅ Only allow requests from your frontend
  methods: "GET, POST, OPTIONS",  // ✅ Ensure POST requests are allowed
  allowedHeaders: "Content-Type, Authorization",
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));  // ✅ Handle preflight CORS requests
app.use(express.json()); // ✅ Ensure JSON parsing is enabled
 



app.get("/", async (req, res) => {
  res.status(200).json("Hello world of time boys !");
});


app.post("/sendfileconfig",   async (req, res) => {
  return res.status(200).json("GOOD JOB kiosso !!"); 
});

 
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
