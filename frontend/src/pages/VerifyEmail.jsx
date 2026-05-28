import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { verifyEmail } from "../services/authService";

export default function VerifyEmail() {
  const [search] = useSearchParams();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    const token = search.get("token");
    if (!token) {
      setStatus("Invalid verification link.");
      return;
    }
    verifyEmail(token)
      .then(() => setStatus("Email verified successfully. You can continue using the app."))
      .catch(() => setStatus("Verification failed or token expired."));
  }, [search]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Email Verification</h1>
      <p className="mt-4 text-lg">{status}</p>
    </div>
  );
}
