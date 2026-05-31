// Uses Brevo (sendinblue) HTTP API on port 443 — works on Render Free Tier

export const sendEmail = async (to, subject, html) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "BookHub", email: "ai.verse.studio00@gmail.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send email via Brevo");
  }

  return data;
};
