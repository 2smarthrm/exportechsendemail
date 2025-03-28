const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");  
const fs = require("fs");
const path = require("path");
 
 function Managers(managerKey){
   const newKey = managerKey.toLowerCase().trim().split(" ").join("");
   const ManagersArray = [
     {name:"brunopimenta", email:"bruno.pimenta@exportech.com.pt"},
     {name:"josécarvalho", email:"jose.carvalho@exportech.com.pt"},
     {name:"germanooliveira", email:"germano.oliveira@exportech.com.pt"},
     {name:"ruiguedelha", email:"rui.guedelha@exportech.com.pt"},
     {name:"pauloferreira", email:"paulo.ferreira@exportech.com.pt"},
     {name:"fábiocatela", email:"fabio.catela@exportech.com.pt"}
   ];
 
   var mail = null;
 
   for (var i = 0; i < ManagersArray.length; i++) { 
          if (newKey ===  ManagersArray[i].name){
           mail =  ManagersArray[i].email;
           console.log("EMAIL = ",   ManagersArray[i].email);
           return  ManagersArray[i].email;
        }
   }
 
   console.log("key = ", newKey)
   return mail !== null ? "kiossocamuegi@gmail.com" : mail;  
 } 
 
 
 const app = express();
 app.use(cors());
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));
 
 
 
 let fetch;
  
 app.get("/", async (req, res) => {
   res.status(200).json("Hello world of players (-_-) ! (-_-)");
 });
  
  
async function sendEmail(email, subject,  htmlContent, manager) { 
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
        const { email, htmlContent , manager} = req.body;

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
       bcc:["geral@exportech.com.pt"],
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

 
 // ✅ Start Server
 const PORT = 5000;
 app.listen(PORT, () => {
     console.log(`🚀 Server running at http://localhost:${PORT}`);
 });



  
