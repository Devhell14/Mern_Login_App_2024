const nodemailer = require("nodemailer");
const Mailgen = require('mailgen');

// https://ethereal.email/create
let nodeConfig = {
    // host: "smtp.ethereal.email",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    }
}

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
    theme: "default",
    product : {
        name: "Mailgen",
        link: 'https://mailgen.js/'
    }
})

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username": "John",
  "userEmail": "john@example.com",
  "text": "Hello789",
  "subject": "Greetings"
}
*/
exports.registerMail = async (req, res) => {
    try {
        const { username, userEmail, text, subject } = req.body;

        // Body of the email
        const email = {
            body: {
                name: username,
                intro: text || "Welcome to Daily Tuition! We're very excited to have you on board.",
                outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
            },
        };

        const emailBody = MailGenerator.generate(email);

        const message = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: subject || "Signup Successful",
            html: emailBody,
        };

        // Send mail
        await transporter.sendMail(message);
        return res.status(200).send({ msg: "You should receive an email from us." });
    } catch (error) {
        console.error("Error sending registration email:", error);
        return res.status(500).send({ error: "Internal server error" });
    }
}

