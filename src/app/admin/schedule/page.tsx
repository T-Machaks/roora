import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { saveScheduleItem, deleteScheduleItem } from "@/lib/actions/schedule";
import { toWallClockInputValue } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Schedule" };

function ItemRow({ item }: { item: Awaited<ReturnType<typeof getItems>>[number] }) {
  return (
    <form
      action={saveScheduleItem}
      className="grid gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
    >
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="programType" value={item.programType} />
      <Input name="title" defaultValue={item.title} placeholder="Title" />
      <Input
        name="startTime"
        type="datetime-local"
        defaultValue={toWallClockInputValue(item.startTime)}
      />
      <Input
        name="endTime"
        type="datetime-local"
        defaultValue={item.endTime ? toWallClockInputValue(item.endTime) : ""}
      />
      <Input
        name="order"
        type="number"
        defaultValue={item.order}
        className="w-20"
      />
      <div className="flex gap-2">
        <Button type="submit" variant="outline">
          Save
        </Button>
      </div>
      <Input
        name="description"
        defaultValue={item.description ?? ""}
        placeholder="Description (optional)"
        className="sm:col-span-5"
      />
    </form>
  );
}

function NewItemForm({ programType }: { programType: "MAIN" | "AFTER_PARTY" }) {
  return (
    <form
      action={saveScheduleItem}
      className="grid gap-2 rounded-xl border border-dashed border-border p-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
    >
      <input type="hidden" name="programType" value={programType} />
      <Input name="title" placeholder="Title" required />
      <Input name="startTime" type="datetime-local" required />
      <Input name="endTime" type="datetime-local" />
      <Input name="order" type="number" defaultValue={0} className="w-20" />
      <Button type="submit">Add</Button>
      <Input
        name="description"
        placeholder="Description (optional)"
        className="sm:col-span-5"
      />
    </form>
  );
}

async function getItems(programType: "MAIN" | "AFTER_PARTY") {
  return db.scheduleItem.findMany({
    where: { programType },
    orderBy: { order: "asc" },
  });
}

export default async function AdminSchedulePage() {
  await requireArea(AdminArea.SCHEDULE);

  const [mainItems, afterItems] = await Promise.all([
    getItems("MAIN"),
    getItems("AFTER_PARTY"),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-primary">Main Program</h2>
        {mainItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <ItemRow item={item} />
            <form action={deleteScheduleItem} className="self-end">
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="text-xs text-red-700 underline"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
        <NewItemForm programType="MAIN" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl text-primary">After Party</h2>
        {afterItems.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <ItemRow item={item} />
            <form action={deleteScheduleItem} className="self-end">
              <input type="hidden" name="id" value={item.id} />
              <button
                type="submit"
                className="text-xs text-red-700 underline"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
        <NewItemForm programType="AFTER_PARTY" />
      </section>
    </div>
  );
}
