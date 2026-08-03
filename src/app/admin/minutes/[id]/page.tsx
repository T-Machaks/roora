import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import {
  saveMinutes,
  deleteMinutes,
  saveMinutesItem,
  deleteMinutesItem,
  savePledge,
  deletePledge,
} from "@/lib/actions/minutes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Minutes" };

function toDateInputValue(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default async function AdminMinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireArea(AdminArea.MINUTES);
  const { id } = await params;

  const minutes = await db.minutes.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      pledges: { orderBy: { order: "asc" } },
    },
  });
  if (!minutes) notFound();

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Edit minutes
        </h1>
        <form action={saveMinutes} className="mt-4 flex max-w-lg flex-col gap-3">
          <input type="hidden" name="id" value={minutes.id} />
          <div>
            <Label htmlFor="meetingDate">Meeting date</Label>
            <Input
              id="meetingDate"
              name="meetingDate"
              type="date"
              defaultValue={toDateInputValue(minutes.meetingDate)}
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={minutes.title} required />
          </div>
          <div>
            <Label htmlFor="venue">Venue (optional)</Label>
            <Input id="venue" name="venue" defaultValue={minutes.venue ?? ""} />
          </div>
          <div>
            <Label htmlFor="attendees">Attendees (optional)</Label>
            <Input
              id="attendees"
              name="attendees"
              defaultValue={minutes.attendees ?? ""}
              placeholder="Comma-separated names"
            />
          </div>
          <Button type="submit" variant="outline" className="self-start">
            Save
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-primary">Discussion items</h2>
        {minutes.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <form
              action={saveMinutesItem}
              className="grid gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_auto_auto]"
            >
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="minutesId" value={minutes.id} />
              <Input name="text" defaultValue={item.text} />
              <Input
                name="order"
                type="number"
                defaultValue={item.order}
                className="w-20"
              />
              <Button type="submit" variant="outline">
                Save
              </Button>
            </form>
            <form action={deleteMinutesItem} className="self-end">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="minutesId" value={minutes.id} />
              <button type="submit" className="text-xs text-red-700 underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        <form
          action={saveMinutesItem}
          className="grid gap-2 rounded-xl border border-dashed border-border p-4 sm:grid-cols-[1fr_auto_auto]"
        >
          <input type="hidden" name="minutesId" value={minutes.id} />
          <Input name="text" placeholder="New item" required />
          <Input name="order" type="number" defaultValue={minutes.items.length} className="w-20" />
          <Button type="submit">Add</Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg text-primary">Pledges</h2>
        {minutes.pledges.map((pledge) => (
          <div key={pledge.id} className="flex flex-col gap-1">
            <form
              action={savePledge}
              className="grid gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_2fr_auto_auto]"
            >
              <input type="hidden" name="id" value={pledge.id} />
              <input type="hidden" name="minutesId" value={minutes.id} />
              <Input name="pledgerName" defaultValue={pledge.pledgerName} placeholder="Name" />
              <Input name="description" defaultValue={pledge.description} placeholder="Pledge" />
              <Input
                name="order"
                type="number"
                defaultValue={pledge.order}
                className="w-20"
              />
              <Button type="submit" variant="outline">
                Save
              </Button>
            </form>
            <form action={deletePledge} className="self-end">
              <input type="hidden" name="id" value={pledge.id} />
              <input type="hidden" name="minutesId" value={minutes.id} />
              <button type="submit" className="text-xs text-red-700 underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        <form
          action={savePledge}
          className="grid gap-2 rounded-xl border border-dashed border-border p-4 sm:grid-cols-[1fr_2fr_auto_auto]"
        >
          <input type="hidden" name="minutesId" value={minutes.id} />
          <Input name="pledgerName" placeholder="Name" required />
          <Input name="description" placeholder="Pledge" required />
          <Input name="order" type="number" defaultValue={minutes.pledges.length} className="w-20" />
          <Button type="submit">Add</Button>
        </form>
      </section>

      <section>
        <form action={deleteMinutes}>
          <input type="hidden" name="id" value={minutes.id} />
          <button type="submit" className="text-sm text-red-700 underline">
            Delete these minutes
          </button>
        </form>
      </section>
    </div>
  );
}
