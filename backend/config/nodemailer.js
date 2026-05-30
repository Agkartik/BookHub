import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined
  },
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 5000
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"BookHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};
