  const express = require("express");
const cors = require("cors");
const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// 📂 Configuração do Multer para armazenar arquivos na pasta "uploads"
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    }
});
const upload = multer({ storage });

// 🚀 Rota de upload e envio de e-mail com anexo
app.post("/sendfileconfig", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado!" });

        const email = req.body.email;
        const filename = req.file.filename;  // 📄 Nome do arquivo salvo
        const filePath = path.join(__dirname, "uploads", filename);  // 📂 Caminho do arquivo

        console.log("📩 Recebido no servidor:");
        console.log("Email:", email);
        console.log("Arquivo:", filename);

        // ✅ Configuração do Nodemailer (SMTP do Gmail)
        let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "2smarthrm@gmail.com",
                pass: "bguvbniphmcnxdrl",  
            },
        });

        // ✅ Opções do e-mail (incluindo o anexo)
        const mailOptions = {
            from: "geral@exportech.com.pt",
            to: email,
            bcc: ["kiossocamuegi@gmail.com"],
            subject: `Configuração Exportech - ${filename}`,
            text: `Olá, segue a configuração em anexo: ${filename}.`,
            attachments: [
                {
                    filename: filename,
                    path: filePath  // 🗂️ Anexa o arquivo salvo
                }
            ]
        };

        // ✅ Enviar o e-mail
        let info = await transporter.sendMail(mailOptions);
        console.log("📨 E-mail enviado com sucesso para:", email);

        // 🗑️ Remover o arquivo após envio
        fs.unlinkSync(filePath);
        console.log("🗑️ Arquivo removido:", filename);

        return res.status(200).json({
            message: "✅ E-mail enviado com sucesso com anexo!",
            email,
            filename
        });

    } catch (error) {
        console.error("❌ Erro ao enviar e-mail:", error);
        return res.status(500).json({ error: "Erro ao enviar o e-mail." });
    }
});

// 📂 Servir arquivos da pasta "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
