const nodemailer = require("nodemailer");

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "kartik221203@gmail.com",
        pass: "ztkx jtba srpw zmyp".replace(/\s+/g, '')
      }
    });

    console.log("Attempting to verify connection...");
    await transporter.verify();
    console.log("Connection successful!");
    
    // Now try to send a test email
    console.log("Attempting to send email...");
    let info = await transporter.sendMail({
      from: '"BookHub Test" <kartik221203@gmail.com>',
      to: "kartik221203@gmail.com",
      subject: "Test OTP",
      text: "This is a test OTP 123456"
    });
    console.log("Email sent successfully: " + info.messageId);
  } catch (error) {
    console.error("FAILED TO SEND EMAIL. Reason:");
    console.error(error);
  }
}

testEmail();
