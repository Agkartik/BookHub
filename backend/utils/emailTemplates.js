export const otpTemplate = (otp) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#6d28d9;margin-bottom:8px">BookVerse OTP Verification</h2>
    <p>Your OTP to verify your account is:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:12px 0;color:#111827">${otp}</div>
    <p>This OTP is valid for 10 minutes.</p>
  </div>
`;

export const welcomeTemplate = (name) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#6d28d9;margin-bottom:8px">Welcome to BookVerse, ${name}!</h2>
    <p>Your account is now verified. Explore books, save favorites, and join the reading community.</p>
  </div>
`;

export const reviewNotificationTemplate = ({ reviewer, bookTitle, rating, comment }) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px">
    <h2 style="color:#6d28d9;margin-bottom:8px">New Review on "${bookTitle}"</h2>
    <p><b>${reviewer}</b> rated your book <b>${rating}/5</b>.</p>
    <p style="color:#374151">${comment || "No comment provided."}</p>
  </div>
`;
