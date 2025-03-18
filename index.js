const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ Configuração do CORS para permitir o frontend acessar o backend
app.use(cors({
    origin: "https://store.exportech.com.pt",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));

// ✅ Middleware para aceitar arquivos binários no body
app.use(express.raw({ type: "application/pdf", limit: "50mb" }));
app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json("🚀 Servidor está rodando!");
});

// ✅ Rota para enviar e-mail com anexo (sem multer)
app.post("/sendfileconfig", async (req, res) => {
    try {
        const email = req.headers["email"];  // Pegamos o email do cabeçalho
        const filename = req.headers["filename"];  // Pegamos o nome do arquivo do cabeçalho
        const fileBuffer = req.body; // O arquivo está diretamente no body

        if (!fileBuffer || !email || !filename) {
            return res.status(400).json({ error: "Faltando dados (arquivo, email ou nome do arquivo)." });
        }

        console.log("📩 Recebido no servidor:");
        console.log("Email:", email);
        console.log("Arquivo:", filename);

        // ✅ Configuração do Nodemailer
        let transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "2smarthrm@gmail.com",
                pass: "bguvbniphmcnxdrl",
            },
        });

        // ✅ Opções do e-mail
        const mailOptions = {
            from: "geral@exportech.com.pt",
            to: email,
            bcc: ["kiossocamuegi@gmail.com"],
            subject: `Configuração Exportech - ${filename}`,
            text: `Olá, segue a configuração em anexo: ${filename}.`,
            attachments: [
                {
                    filename: filename,
                    content: fileBuffer, // ✅ Enviar o arquivo diretamente do body
                    contentType: "application/pdf"
                }
            ]
        };

        // ✅ Enviar o e-mail
        let info = await transporter.sendMail(mailOptions);
        console.log("📨 E-mail enviado com sucesso para:", email);

        return res.status(200).json({
            message: "✅ E-mail enviado com sucesso!",
            email,
            filename
        });

    } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
        return res.status(500).json({ error: "Erro ao enviar o e-mail." });
    }
});

// ✅ Iniciar Servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
