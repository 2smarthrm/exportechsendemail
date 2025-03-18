const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: "https://store.exportech.com.pt",  // ✅ Permite requisições do frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Rota de Teste
app.get("/", (req, res) => {
    res.status(200).json("🚀 Servidor está rodando!");
});

// ✅ Rota `/sendfileconfig` que apenas retorna os dados recebidos
app.post("/sendfileconfig", (req, res) => {
    const { email } = req.body;  // ✅ Pega o email do corpo da requisição
    const filename = req.body.filename || "arquivo_desconhecido.pdf";  // ✅ Nome do arquivo

    console.log("📩 Recebido no servidor:");
    console.log("Email:", email);
    console.log("Arquivo:", filename);

    // ✅ Retorna os dados para aparecer no console do frontend
    return res.status(200).json({
        message: "✅ Dados recebidos com sucesso!",
        email,
        filename
    });
});

// ✅ Porta do Servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
