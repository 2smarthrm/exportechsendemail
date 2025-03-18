 const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

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

let fetch;

app.get("/", async (req, res) => {
  res.status(200).json("Hello world of time boys !");
});

  
 

app.post("/sendfileconfig",   async (req, res) => {
  return res.status(200).json("GOOD JOB kiosso !!"); 
});


 
app.post("/sendfile", async (req, res) => {
  try {
    if (!fetch) {
      fetch = (await import("node-fetch")).default;
    }

    const Data = req.body.dt;
    const Products = Data.products || [];
    let ProductsContent = "";

    for (let i = 0; i < Products.length; i++) {
      ProductsContent += `(${i + 1}) - Referência: ${Products[i].referenciadoequipamento}\n`
        + `Motivo: ${Products[i].motivodadevolucao}\n`
        + `Nº Série: ${Products[i].ndeserie}\n`
        + `Fatura: ${Products[i].nfaturacompra}\n`
        + `Password: ${Products[i].palavrapassedoequipamento}\n`
        + `Avaria: ${Products[i].descricaodaavaria}\n`
        + `Acessórios: ${Products[i].acessoriosqueacompanhamoequipamento}\n\n`;
    }

    const pdfBytes = await generatePDF(Data, ProductsContent);

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

    const mailOptions = {
      from: "geral@exportech.com.pt",
      to: ["geral@exportech.com.pt", Data.email],
      subject: `Formulário de Devolução - ${Data.company || "Não informado"}`,
      text: `Segue em anexo o formulário de devolução da empresa ${Data.company || "Não informado"}.`,
      attachments: [{ filename: "Formulario_Devolucao.pdf", content: pdfBytes, contentType: "application/pdf" }],
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Erro ao enviar e-mail:", err);
        return res.status(500).json({ error: "Erro ao enviar o e-mail." });
      }
      console.log("E-mail enviado:", info.response);
      return res.status(200).json("Mensagem enviada com sucesso!");
    });
  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json("Erro ao processar a solicitação.");
  }
});

// ✅ Função para gerar o PDF
async function generatePDF(Data, ProductsContent) {
  const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 750;
  const lineHeight = 14;

  page.drawText("Formulário de Devolução de Equipamentos", { x: 50, y, size: 14, font: boldFont, color: rgb(0, 0, 0) });
  y -= 20;

  const companyDetails = [
    `Empresa: ${Data.company || "Não informado"}`,
    `Email: ${Data.email || "Não informado"}`,
    `Telefone: ${Data.phone || "Não informado"}`,
    `NIF: ${Data.nif || "Não informado"}`,
  ];

  companyDetails.forEach((detail) => {
    page.drawText(detail, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  });

  y -= 20;
  page.drawText("Detalhes dos produtos:", { x: 50, y, size: 12, font: boldFont, color: rgb(0, 0, 0) });
  y -= 20;

  ProductsContent.split("\n").forEach((line) => {
    if (y < 50) {
      pdfDoc.addPage();
      y = 750;
    }
    page.drawText(line, { x: 50, y, size: 10, font, color: rgb(0.105, 0.149, 0.231) });
    y -= 14;
  });

  return await pdfDoc.save();
}


 
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
