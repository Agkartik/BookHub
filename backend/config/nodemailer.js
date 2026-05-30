import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined
  },
  family: 4, // Force IPv4 to prevent IPv6 timeouts on Render
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"BookHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};
