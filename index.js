  const express = require("express");
  const cors = require("cors");
  const nodemailer = require("nodemailer");
  const multer = require("multer");
  const fs = require("fs");
  const path = require("path");
  const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

  
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
async function generatePDF(Data, ProductsContent) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 em pontos

    // Carregar fontes padrão
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Azul em RGB (hex: #0074FF)
    const blueColor = rgb(0, 0.454, 1);

    // ✅ Adicionar "EXPORTECH" em azul e uppercase
    page.drawText("EXPORTECH", {
      x: 50,
      y: 800,
      size: 26,
      font: fontBold,
      color: blueColor,
    });

    // ✅ Adicionar slogan abaixo, menor e também azul
    page.drawText("YOUR SECURITY PARTNER", {
      x: 50,
      y: 780,
      size: 10,
      font: fontItalic,
      color: blueColor,
    });

    // ✅ Adicionar título
    page.drawText("Formulário de Devolução", {
      x: 50,
      y: 750,
      size: 14,
      font: fontBold,
      color: rgb(0, 0, 0),
    });

    // ✅ Conteúdo dos produtos com espaçamento entre linhas
    let yPos = 720;
    const lineHeight = 18;

    if (ProductsContent) {
      const lines = ProductsContent.split("\n");

      lines.forEach((line) => {
        if (yPos < 50) return;
        page.drawText(line, {
          x: 50,
          y: yPos,
          size: 12,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        yPos -= lineHeight;
      });
    }

    // ✅ Adicionar detalhes da variável Data
    if (Data && Array.isArray(Data)) {
      page.drawText("Detalhes:", {
        x: 50,
        y: yPos - 10,
        size: 12,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      yPos -= 30;

      Data.forEach((item) => {
        if (yPos < 50) return;
        page.drawText(`- ${item}`, {
          x: 60,
          y: yPos,
          size: 11,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPos -= lineHeight;
      });
    }

    // ✅ Salvar PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}

  
  // ✅ Start Server
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });


 
