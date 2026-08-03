import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold text-primary">
        Welcome back
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Sign in to view the celebration details.
      </p>
      {reset === "1" && (
        <p className="mt-4 max-w-sm text-sm text-primary">
          Your password has been reset. Sign in with your new password.
        </p>
      )}
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-8 text-sm text-ink-muted">
        Not signed up yet?{" "}
        <Link href="/redeem" className="font-medium text-primary underline">
          Enter your invite code
        </Link>
      </p>
    </div>
  );
}
