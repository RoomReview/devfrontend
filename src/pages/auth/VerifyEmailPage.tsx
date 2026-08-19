import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";
import CodeInput from "../../components/common/CodeInput";
import { H2, Body, Small } from "../../components/common/Typography";
import backgroundImage from "../../assets/bgimage.png";
import {
  useVerifyEmail,
  useResendVerification,
} from "@/hooks/auth/useVerifyEmail";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const userType = searchParams.get("type") || "tenant";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { mutate: verifyEmail, isPending: isVerifying } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  const handleCodeChange = (value: string) => {
    setCode(value);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    verifyEmail(
      { email, code },
      {
        onSuccess: () => navigate(`/email-verified?type=${userType}`),
      },
    );
  };

  const handleResend = () => {
    if (!email) return;
    resend({ email });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10">
        <div className="flex justify-center mb-8">
          <Logo size="sm" linkTo="/" />
        </div>

        <H2 className="text-center text-primary mb-8 text-2xl sm:text-3xl">
          Confirm your email address
        </H2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <CodeInput length={6} onChange={handleCodeChange} error={error} />
          </div>

          <div className="text-center">
            <Body className="text-sm text-gray-dark/80">
              A verification code has been sent to <strong>{email}</strong>.
            </Body>
            <Body className="text-sm text-gray-dark/80">
              Enter the code here to confirm your account.
            </Body>
          </div>

          <div className="text-center">
            <Small className="text-gray-dark/70">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary font-semibold hover:underline disabled:opacity-50"
              >
                {isResending ? "Sending..." : "Resend"}
              </button>
            </Small>
          </div>

          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? "VERIFYING..." : "SUBMIT CODE"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

