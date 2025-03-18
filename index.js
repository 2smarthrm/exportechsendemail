const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

const corsOptions = {
    origin: "https://store.exportech.com.pt",  // ✅ Permite requisições do frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Teste para ver se o servidor está online
app.get("/", (req, res) => {
    res.status(200).json("🚀 Servidor está rodando!");
});

// ✅ Rota que recebe os dados e envia e-mail
app.post("/sendfileconfig", async (req, res) => {
    try {
        const { email, filename } = req.body;  // ✅ Pega os dados do frontend

        console.log("📩 Recebido no servidor:");
        console.log("Email:", email);
        console.log("Arquivo:", filename);

        // ✅ Configuração do Nodemailer (SMTP do Gmail)
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
