export const metadata = { title: "You're offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-primary">
        You&rsquo;re offline
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        It looks like you&rsquo;ve lost your connection. Reconnect and try
        again — anything you&rsquo;ve already loaded, like the program and
        dress code, may still be available.
      </p>
    </div>
  );
}
