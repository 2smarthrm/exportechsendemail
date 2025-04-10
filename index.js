const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path"); 

function Managers(managerKey) {
  const newKey = managerKey.toLowerCase().trim().split(" ").join("");
  const ManagersArray = [
    { name: "brunopimenta", email: "bruno.pimenta@exportech.com.pt" },
    { name: "josécarvalho", email: "jose.carvalho@exportech.com.pt" },
    { name: "germanooliveira", email: "germano.oliveira@exportech.com.pt" },
    { name: "ruiguedelha", email: "rui.guedelha@exportech.com.pt" },
    { name: "pauloferreira", email: "paulo.ferreira@exportech.com.pt" },
    { name: "fábiocatela", email: "fabio.catela@exportech.com.pt" },
  ];

  var mail = null;

  for (var i = 0; i < ManagersArray.length; i++) {
    if (newKey === ManagersArray[i].name) {
      mail = ManagersArray[i].email;
      console.log("EMAIL = ", ManagersArray[i].email);
      return ManagersArray[i].email;
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  if (isValidEmail(mail) === false) return "fabio.catela@exportech.com.pt";
  console.log("key = ", newKey);
  return mail !== null ? "fabio.catela@exportech.com.pt" : mail;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let fetch;

app.get("/", async (req, res) => {
  res.status(200).json("Hello world of players (-_-) ! (-_-)");
});

async function sendEmail(email, subject, htmlContent, manager) {
  let transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com", // ✅ CORRETO
    port: 465, // Porta SMTP segura para SSL
    secure: true, // true para SSL, false para STARTTLS
    auth: {
      user: "noreply@marketing.exportech.com.pt", // Seu e-mail da Hostinger
      pass: "!!_Exp@2024-?P4ulo#", // Sua senha ou senha de aplicativo
    },
  });

  const CurrentManager = Managers(manager);
  console.log("MANAGER = ", Managers(manager));

  let mailOptions = {
    from: "noreply@marketing.exportech.com.pt",
    to: email,
    bcc: [CurrentManager],
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
}

app.post("/sendfileconfig", async (req, res) => {
  try {
    const { email, htmlContent, manager } = req.body;

    if (!email || !htmlContent) {
      return res.status(400).json({ error: "Missing email or HTML content!" });
    }

    console.log("📩 Sending email to:", email);

    const emailSubject = `Configuração Exportech - Detalhes do Projeto`;
    await sendEmail(email, emailSubject, htmlContent, manager);

    console.log("📨 Email sent successfully to:", email);

    return res.status(200).json({
      message: "✅ Email sent successfully!",
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ error: "Error sending email!" });
  }
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
      host: "smtp.hostinger.com", // ✅ CORRETO
      port: 465, // Porta SMTP segura para SSL
      secure: true, // true para SSL, false para STARTTLS
      auth: {
        user: "noreply@marketing.exportech.com.pt", // Seu e-mail da Hostinger
        pass: "!!_Exp@2024-?P4ulo#", // Sua senha ou senha de aplicativo
      },
    });

    const mailOptions = {
      from: "noreply@marketing.exportech.com.pt",
      to: [Data.email],
      bcc: ["kiosso.silva@exportech.com.pt"],
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
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
async function generatePDF(Data, ProductsContent) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const blueColor = rgb(0, 0.454, 1);
    const blackColor = rgb(0, 0, 0);

    let yPos = 800;

    //  Logo
    page.drawText("EXPORTECH", {
      x: 50,
      y: yPos,
      size: 26,
      font: fontBold,
      color: blueColor,
    });

    yPos -= 20;
    page.drawText("YOUR SECURITY PARTNER", {
      x: 50,
      y: yPos,
      size: 10,
      font: fontItalic,
      color: blueColor,
    });

    //  Título FORMULÁRIO RMA com estilo igual ao do produto (cor azul)
    yPos -= 40;
    page.drawText("FORMULÁRIO RMA", {
      x: 50,
      y: yPos,
      size: 18,
      font: fontBold,
      color: blueColor,
    });

    yPos -= 20;
    page.drawText("Detalhes dos Produtos", {
      x: 50,
      y: yPos,
      size: 12,
      font: fontItalic,
      color: blackColor,
    });

    //  Separar os produtos
    const entries = ProductsContent.split(/\(\d+\)\s*-\s*Referência:/).filter(Boolean);

    yPos -= 30;
    const lineHeight = 14;

    entries.forEach((entry, idx) => {
      if (yPos < 100) return;

      const fields = entry
        .replace(/\n/g, ' ')
        .trim()
        .split(/Motivo:|Nº Série:|Fatura:|Password:|Avaria:|Acessórios:/)
        .map((s) => s.trim());

      const labels = ['Referência', 'Motivo', 'Nº Série', 'Fatura', 'Password', 'Avaria', 'Acessórios'];

      //  Título do produto
      page.drawText(`(${idx + 1}) Produto`, {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: blueColor,
      });
      yPos -= 18;

      //  Campos em coluna com indentação nas quebras de linha
      for (let i = 0; i < fields.length && i < labels.length; i++) {
        const label = labels[i];
        const value = fields[i];

        const wrapped = wrapText(value, fontRegular, 10, 450);

        wrapped.forEach((line, lineIdx) => {
          const text = lineIdx === 0 ? `${label}: ${line}` : `   ${line}`;
          page.drawText(text, {
            x: 55, // margem leve para a esquerda
            y: yPos,
            size: 10,
            font: fontRegular,
            color: blackColor,
          });
          yPos -= lineHeight;
        });

        yPos -= 4;
      }

      yPos -= 10; // Espaço entre produtos
    });

    //  Outras informações
    if (Data && Array.isArray(Data)) {
      page.drawText("Outros Detalhes:", {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: blackColor,
      });
      yPos -= 18;

      Data.forEach((item) => {
        if (yPos < 50) return;
        page.drawText(`- ${item}`, {
          x: 60,
          y: yPos,
          size: 10,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= lineHeight;
      });
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;

    //  Função de quebra com indentação
    function wrapText(text, font, fontSize, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let line = '';

      words.forEach((word) => {
        const testLine = line + word + ' ';
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && line !== '') {
          lines.push(line.trim());
          line = word + ' ';
        } else {
          line = testLine;
        }
      });

      if (line) lines.push(line.trim());
      return lines;
    }
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}


 
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


