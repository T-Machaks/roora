import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Forgot your password?
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Enter the email on your account and we&rsquo;ll send you a link to set a
        new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-8 text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-primary underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
