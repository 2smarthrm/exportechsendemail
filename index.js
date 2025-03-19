const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");


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
  return mail !== null ? "fabio.catela@exportech.com.pt" : mail;  
} 


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Email Sender Function
async function sendEmail(email, subject,  htmlContent, manager) {
    let transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: "2smarthrm@gmail.com",
            pass: "bguvbniphmcnxdrl",
        },
    });

    const CurrentManager = Managers(manager); 
    console.log("MANAGER = ", Managers(manager));

    let mailOptions = {
        from: "geral@exportech.com.pt",
        to: email,
        bcc: [CurrentManager],
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
}

// ✅ Teste para ver se o servidor está online
app.get("/", (req, res) => {
    res.status(200).json("🚀 Servidor está rodando!");
});



// ✅ API Route: Handle Email Sending
app.post("/sendfileconfig", async (req, res) => {
    try {
        const { email, htmlContent , manager} = req.body;

        if (!email || !htmlContent) {
            return res.status(400).json({ error: "Missing email or HTML content!" });
        }

        console.log("📩 Sending email to:", email);

        // ✅ Send Email
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

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
