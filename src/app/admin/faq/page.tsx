import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { saveFaqItem, deleteFaqItem } from "@/lib/actions/faq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "FAQ" };

export default async function AdminFaqPage() {
  await requireArea(AdminArea.SETTINGS);

  const items = await db.faqItem.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">FAQ</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <form
              action={saveFaqItem}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4"
            >
              <input type="hidden" name="id" value={item.id} />
              <Input name="question" defaultValue={item.question} placeholder="Question" required />
              <textarea
                name="answer"
                defaultValue={item.answer}
                placeholder="Answer"
                rows={3}
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  Order
                  <Input
                    name="order"
                    type="number"
                    defaultValue={item.order}
                    className="w-20"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input type="checkbox" name="visible" defaultChecked={item.visible} />
                  Visible to guests
                </label>
                <Button type="submit" variant="outline">
                  Save
                </Button>
              </div>
            </form>
            <form action={deleteFaqItem} className="self-end">
              <input type="hidden" name="id" value={item.id} />
              <button type="submit" className="text-xs text-red-700 underline">
                Delete
              </button>
            </form>
          </div>
        ))}

        <form
          action={saveFaqItem}
          className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-4"
        >
          <Input name="question" placeholder="New question" required />
          <textarea
            name="answer"
            placeholder="Answer"
            rows={3}
            required
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              Order
              <Input name="order" type="number" defaultValue={items.length} className="w-20" />
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" name="visible" defaultChecked />
              Visible to guests
            </label>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
