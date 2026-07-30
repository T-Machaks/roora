import { db } from "@/lib/db";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const contacts = await db.contactPerson.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Contact the Hosts
      </h1>

      {contacts.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Contact details will be shared here soon.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {contacts.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="font-medium text-ink">{c.name}</p>
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {c.role}
              </p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-primary underline">
                    {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-primary underline"
                  >
                    {c.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
