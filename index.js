const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");

const app = express();

const corsOptions = {
    origin: "https://store.exportech.com.pt",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Configurar o Multer para armazenar o arquivo na memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.status(200).json("🚀 Servidor está rodando!");
});

// ✅ Rota para enviar e-mail com anexo
app.post("/sendfileconfig", upload.single("file"), async (req, res) => {
    try {
        const email = req.body.email;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
        }

        console.log("📩 Recebido no servidor:");
        console.log("Email:", email);
        console.log("Arquivo:", file.originalname);

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
            subject: `Configuração Exportech - ${file.originalname}`,
            text: `Olá, segue a configuração em anexo: ${file.originalname}.`,
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer, // ✅ Enviar o arquivo diretamente da memória
                    contentType: file.mimetype
                }
            ]
        };

        // ✅ Enviar o e-mail
        let info = await transporter.sendMail(mailOptions);
        console.log("📨 E-mail enviado com sucesso para:", email);

        return res.status(200).json({
            message: "✅ E-mail enviado com sucesso!",
            email,
            filename: file.originalname
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
