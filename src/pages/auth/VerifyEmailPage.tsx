import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import Button from "../../components/common/Button";
import CodeInput from "../../components/common/CodeInput";
import { H2, Body, Small } from "../../components/common/Typography";
import backgroundImage from "../../assets/bgimage.jpg";
import {
  useVerifyEmail,
  useResendVerification,
} from "@/hooks/auth/useVerifyEmail";
import { getSafePostcodeReturnTo } from '@/utils/helpers';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const linkedCode = searchParams.get("code") || "";
  const hasValidVerificationLink = Boolean(email) && /^\d{6}$/.test(linkedCode);
  const userType = searchParams.get("type") || "user";
  const subscriptionPlan = searchParams.get("subscriptionPlan");
  const teamInviteToken = searchParams.get("teamInviteToken");
  const returnTo = getSafePostcodeReturnTo(searchParams.get("returnTo"));
  const postVerificationDestination = teamInviteToken
    ? `/team-invite?token=${encodeURIComponent(teamInviteToken)}`
    : subscriptionPlan
      ? `/pricing?checkoutPlan=${encodeURIComponent(subscriptionPlan)}`
      : returnTo ?? '/account';

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { mutate: verifyEmail, isPending: isVerifying, isError: verificationFailed } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();
  const hasSubmittedLink = useRef(false);

  useEffect(() => {
    if (!hasValidVerificationLink || hasSubmittedLink.current) return;
    hasSubmittedLink.current = true;
    verifyEmail(
      { email, code: linkedCode },
      {
        onSuccess: () => navigate(postVerificationDestination),
      },
    );
  }, [
    email,
    hasValidVerificationLink,
    linkedCode,
    navigate,
    postVerificationDestination,
    subscriptionPlan,
    userType,
    verifyEmail,
  ]);

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
        onSuccess: () => navigate(postVerificationDestination),
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
          {(!hasValidVerificationLink || verificationFailed) && (
            <div className="flex justify-center">
              <CodeInput length={6} onChange={handleCodeChange} error={error} />
            </div>
          )}

          <div className="text-center">
            <Body className="text-sm text-gray-dark/80">
              {isVerifying
                ? "Verifying your email address..."
                : <>A verification code has been sent to <strong>{email}</strong>.</>}
            </Body>
            {verificationFailed && (
              <Body className="text-sm text-red-700">
                This verification link may have expired. Enter your code or request a new one.
              </Body>
            )}
            {(!hasValidVerificationLink || verificationFailed) && (
              <Body className="text-sm text-gray-dark/80">
                Enter the code here to confirm your account.
              </Body>
            )}
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

          {(!hasValidVerificationLink || verificationFailed) && (
            <Button type="submit" className="w-full" disabled={isVerifying}>
              {isVerifying ? "VERIFYING..." : "SUBMIT CODE"}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
