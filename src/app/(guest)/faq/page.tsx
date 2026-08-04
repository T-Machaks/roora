import { db } from "@/lib/db";
import { FaqAccordion } from "@/components/faq-accordion";

export const metadata = { title: "FAQ" };

export default async function FaqPage() {
  const items = await db.faqItem.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Frequently Asked Questions
      </h1>

      {items.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Nothing here yet — check back soon.
        </p>
      ) : (
        <FaqAccordion items={items} />
      )}
    </div>
  );
}
