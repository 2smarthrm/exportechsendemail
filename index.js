 const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

 
function Managers(managerKey) {
  const newKey = String(managerKey || "")
    .toLowerCase()
    .trim()
    .split(" ")
    .join("");

  const ManagersArray = [
    { name: "brunopimenta", email: "bruno.pimenta@exportech.com.pt" },
    { name: "josécarvalho", email: "jose.carvalho@exportech.com.pt" },
    { name: "germanooliveira", email: "germano.oliveira@exportech.com.pt" },
    { name: "ruiguedelha", email: "rui.guedelha@exportech.com.pt" },
    { name: "pauloferreira", email: "paulo.ferreira@exportech.com.pt" },
    { name: "fábiocatela", email: "fabio.catela@exportech.com.pt" },
  ];

  let mail = null;
  for (let i = 0; i < ManagersArray.length; i++) {
    if (newKey === ManagersArray[i].name) {
      mail = ManagersArray[i].email;
      return mail;
    }
  }

  return "fabio.catela@exportech.com.pt";
}

function wrapText(text, font, fontSize, maxWidth) {
  const words = String(text || "").split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line + word + " ";
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && line !== "") {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line.trim());
  return lines;
}

 
async function generatePDF(Data, ProductsContent) {
  try {
    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const blueColor = rgb(0, 0.454, 1);
    const blackColor = rgb(0, 0, 0);
    const redColor = rgb(1, 0, 0);

    let page = pdfDoc.addPage([595, 842]); // A4
    let yPos = 800;
    const lineHeight = 14;

    function checkAndCreateNewPage() {
      if (yPos < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPos = 800;
      }
    }

   
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

    yPos -= 40;
    page.drawText("FORMULÁRIO DE DEVOLUÇÃO DE EQUIPAMENTOS (RMA)", {
      x: 50,
      y: yPos,
      size: 11,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 30;

    if (Data && Data.company) {
      checkAndCreateNewPage();

      page.drawText("Detalhes da Empresa:", {
        x: 50,
        y: yPos,
        size: 11,
        font: fontBold,
        color: blackColor,
      });

      yPos -= 18;

      const companyData = [
        { label: "Empresa:", value: Data.company || "—" },
        { label: "E-mail:", value: Data.email || "—" },
        { label: "NIF:", value: Data.nif || "—" },
        { label: "Telefone:", value: Data.phone || "—" },
      ];

      companyData.forEach((item) => {
        checkAndCreateNewPage();
        page.drawText(`${item.label} ${item.value}`, {
          x: 50,
          y: yPos,
          size: 10,
          font: fontRegular,
          color: blackColor,
        });
        yPos -= lineHeight;
      });
    }

    
    yPos -= 20;
    page.drawText("Detalhes dos Produtos", {
      x: 50,
      y: yPos,
      size: 11,
      font: fontBold,
      color: blackColor,
    });

    const entries = String(ProductsContent || "")
      .split(/\(\d+\)\s*-\s*Referência:/)
      .filter(Boolean);

    yPos -= 30;

    entries.forEach((entry, idx) => {
      checkAndCreateNewPage();

      const fields = entry
        .replace(/\n/g, " ")
        .trim()
        .split(/Motivo:|Nº Série:|Fatura:|Password:|Avaria:|Acessórios:/)
        .map((s) => s.trim());

      const labels = ["Referência", "Motivo", "Nº Série", "Fatura", "Password", "Avaria", "Acessórios"];

      page.drawText(`(${idx + 1}) Produto`, {
        x: 50,
        y: yPos,
        size: 12,
        font: fontBold,
        color: blueColor,
      });

      yPos -= 18;

      for (let i = 0; i < fields.length && i < labels.length; i++) {
        const label = labels[i];
        const value = fields[i] || "—";
        const wrapped = wrapText(value, fontRegular, 10, 450);

        wrapped.forEach((line, lineIdx) => {
          checkAndCreateNewPage();
          const text = lineIdx === 0 ? `${label}: ${line}` : `   ${line}`;
          page.drawText(text, {
            x: 55,
            y: yPos,
            size: 10,
            font: fontRegular,
            color: blackColor,
          });
          yPos -= lineHeight;
        });

        yPos -= 4;
      }

      yPos -= 10;
    });

   
    checkAndCreateNewPage();
    yPos -= 20;

    page.drawText("Loja online:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    page.drawText(" www.store.exportech.com.pt", {
      x: 120,
      y: yPos,
      size: 9,
      font: fontRegular,
      color: blueColor,
    });

    yPos -= 20;
    page.drawText("Localizações:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 12;
    page.drawText("Sede Lisboa:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 12;
    page.drawText(
      "Rua Fernando Farinha nº 2A e 2B, Braço de Prata 1950-448 Lisboa | Tel: +351 210 353 555",
      { x: 50, y: yPos, size: 9, font: fontRegular, color: blackColor }
    );

    yPos -= 12;
    page.drawText("Filial Funchal:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 12;
    page.drawText(
      "Rua da Capela do Amparo, Edifício Alpha Living Loja A, 9000-267 Funchal | Tel: +351 291 601 603",
      { x: 50, y: yPos, size: 9, font: fontRegular, color: blackColor }
    );

    yPos -= 12;
    page.drawText("Armazém Logístico:", {
      x: 50,
      y: yPos,
      size: 9,
      font: fontBold,
      color: blackColor,
    });

    yPos -= 12;
    page.drawText(
      "Estrada do Contador nº 25 - Fracção B, Sesmaria do Colaço 2130-223 Benavente | Tel: +351 210 353 555",
      { x: 50, y: yPos, size: 9, font: fontRegular, color: blackColor }
    );

    yPos -= 20;
    page.drawText(
      "O RMA será enviado para o seu email, o mesmo deve de ser impresso e acompanhado com o equipamento;",
      { x: 50, y: yPos, size: 10, font: fontBold, color: redColor }
    );

    const pdfBytes = await pdfDoc.save();  
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar o PDF:", error);
    throw error;
  }
}

 
const app = express(); 
app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

 
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "noreply@marketing.exportech.com.pt",
    pass: "!!_Exp@2024-?P4ulo#",
  },
});

 
async function sendEmail(email, subject, htmlContent, manager) {
  const CurrentManager = Managers(manager);
  const mailOptions = {
    from: "noreply@marketing.exportech.com.pt",
    to: email,
    bcc: [CurrentManager],
    subject,
    html: htmlContent,
  };
  return transporter.sendMail(mailOptions);
}

async function sendEmailOrder(subject, htmlContent) {
  const mailOptions = {
    from: "noreply@marketing.exportech.com.pt",
    to: "kiosso.silva@exportech.com.pt",
    bcc: "kiosso.silva@exportech.com.pt",
    subject,
    html: htmlContent,
  };
  return transporter.sendMail(mailOptions);
}

 
app.get("/", (req, res) => {
  res.status(200).json("Hello world of players (-_-) ! (-_-)");
});

app.post("/sendfileconfig", async (req, res) => {
  try {
    const { email, htmlContent, manager } = req.body;
    if (!email || !htmlContent) {
      return res.status(400).json({ error: "Missing email or HTML content!" });
    }

    const emailSubject = "Configuração Exportech - Detalhes do Projeto";
    await sendEmail(email, emailSubject, htmlContent, manager);

    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Error sending email!",
      message: error?.message,
      stack: error?.stack,
    });
  }
});

app.post("/sendcustomorder", async (req, res) => {
  try {
    const { htmlContent } = req.body;
    const emailSubject = "Produtos customizados Exportech - Detalhes do Projeto";
    await sendEmailOrder(emailSubject, htmlContent);

    return res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      error: "Error sending email!",
      message: error?.message,
      stack: error?.stack,
    });
  }
});

 
app.post("/sendfile", async (req, res) => {
  try {
    const Data = req.body.dt || {};
    const Products = Data.products || [];
    let ProductsContent = "";

    for (let i = 0; i < Products.length; i++) {
      ProductsContent += `(${i + 1}) - Referência: ${Products[i].referenciadoequipamento || ""}\n`
        + `Motivo: ${Products[i].motivodadevolucao || ""}\n`
        + `Nº Série: ${Products[i].ndeserie || ""}\n`
        + `Fatura: ${Products[i].nfaturacompra || ""}\n`
        + `Password: ${Products[i].palavrapassedoequipamento || ""}\n`
        + `Avaria: ${Products[i].descricaodaavaria || ""}\n`
        + `Acessórios: ${Products[i].acessoriosqueacompanhamoequipamento || ""}\n\n`;
    }

    const pdfBytes = await generatePDF(Data, ProductsContent);

    const mailOptions = {
      from: "noreply@marketing.exportech.com.pt",
      to: [Data.email].filter(Boolean),
      bcc: ["anderson.alarcon@exportech.com.pt"],
      subject: `Formulário de Devolução - ${Data.company || "Não informado"}`,
      text: `Segue em anexo o formulário de devolução da empresa ${Data.company || "Não informado"}.`,
      attachments: [
        {
          filename: "Formulario_Devolucao.pdf",
          content: Buffer.from(pdfBytes),
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=Formulario_Devolucao.pdf");
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("Erro:", error);
    return res.status(500).json({
      error: "Erro ao processar a solicitação.",
      message: error?.message,
      stack: error?.stack,
    });
  }
});

 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

