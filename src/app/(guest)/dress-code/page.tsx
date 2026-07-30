import { getEventSettings } from "@/lib/settings";

export const metadata = { title: "Dress Code" };

export default async function DressCodePage() {
  const settings = await getEventSettings();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Dress Code
      </h1>

      <div className="flex items-center justify-center gap-4 rounded-2xl border border-border bg-surface p-8">
        <span className="h-16 w-16 rounded-full bg-black" aria-hidden />
        <span className="font-display text-xl text-ink">All Black</span>
      </div>

      <p className="text-sm leading-relaxed text-ink-muted">
        {settings.dressCode}
      </p>

      <p className="text-sm leading-relaxed text-ink-muted">
        We kindly ask all guests to dress elegantly in black to honour the
        traditional maroora proceedings. Comfortable footwear is
        recommended, as parts of the ceremony may involve standing.
      </p>
    </div>
  );
}
