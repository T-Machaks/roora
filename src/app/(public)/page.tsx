import Image from "next/image";
import { LinkButton } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-secondary shadow-md sm:h-40 sm:w-40">
        <Image
          src="/images/couple/couple-2-faces.jpg"
          alt="Blessing and Tessandra"
          fill
          sizes="(min-width: 640px) 10rem, 8rem"
          className="object-cover"
          priority
        />
      </div>

      <p className="font-display mt-6 text-sm uppercase tracking-[0.3em] text-ink-muted">
        You are invited
      </p>
      <h1 className="font-display mt-4 max-w-md text-4xl font-semibold leading-tight text-primary sm:text-5xl">
        Blessing &amp; Tessandra
      </h1>
      <p className="mt-3 text-base text-ink-muted">Maroora Celebration</p>
      <p className="mt-1 text-sm text-ink-muted">
        24 October &middot; Harare &middot; Venue to be advised
      </p>

      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <LinkButton href="/redeem" variant="primary" className="w-full">
          Enter invite code
        </LinkButton>
        <LinkButton href="/login" variant="outline" className="w-full">
          I already have an account
        </LinkButton>
      </div>

      <p className="mt-12 max-w-sm text-xs text-ink-muted">
        This celebration is private and by invitation only. If you believe
        you should have received an invite, please contact the hosts
        directly.
      </p>
    </div>
  );
}
