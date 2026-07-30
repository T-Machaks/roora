import { db } from "@/lib/db";
import { getEventSettings } from "@/lib/settings";
import { toWallClockInputValue } from "@/lib/format";
import {
  updateEventSettings,
  createContact,
  deleteContact,
} from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [settings, contacts] = await Promise.all([
    getEventSettings(),
    db.contactPerson.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Event Settings
        </h1>
        <form action={updateEventSettings} className="mt-4 flex max-w-lg flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="groomName">Groom name</Label>
              <Input id="groomName" name="groomName" defaultValue={settings.groomName} required />
            </div>
            <div>
              <Label htmlFor="brideName">Bride name</Label>
              <Input id="brideName" name="brideName" defaultValue={settings.brideName} required />
            </div>
            <div>
              <Label htmlFor="eventDate">Event date</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="date"
                defaultValue={settings.eventDate.toISOString().slice(0, 10)}
                required
              />
            </div>
            <div>
              <Label htmlFor="rsvpDeadline">RSVP deadline (optional)</Label>
              <Input
                id="rsvpDeadline"
                name="rsvpDeadline"
                type="date"
                defaultValue={
                  settings.rsvpDeadline
                    ? settings.rsvpDeadline.toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium text-primary">
              Main maroora venue &amp; time
            </legend>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="mainVenueIsTBA"
                defaultChecked={settings.mainVenueIsTBA}
              />
              Venue to be advised
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="mainVenueName">Venue name</Label>
                <Input id="mainVenueName" name="mainVenueName" defaultValue={settings.mainVenueName ?? ""} />
              </div>
              <div>
                <Label htmlFor="mainVenueAddress">Address</Label>
                <Input id="mainVenueAddress" name="mainVenueAddress" defaultValue={settings.mainVenueAddress ?? ""} />
              </div>
              <div>
                <Label htmlFor="mainStartTime">Start time</Label>
                <Input
                  id="mainStartTime"
                  name="mainStartTime"
                  type="datetime-local"
                  defaultValue={settings.mainStartTime ? toWallClockInputValue(settings.mainStartTime) : ""}
                />
              </div>
              <div>
                <Label htmlFor="mainEndTime">End time</Label>
                <Input
                  id="mainEndTime"
                  name="mainEndTime"
                  type="datetime-local"
                  defaultValue={settings.mainEndTime ? toWallClockInputValue(settings.mainEndTime) : ""}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-1 text-sm font-medium text-primary">
              After party venue &amp; time
            </legend>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="afterVenueIsTBA"
                defaultChecked={settings.afterVenueIsTBA}
              />
              Venue to be advised
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="afterVenueName">Venue name</Label>
                <Input id="afterVenueName" name="afterVenueName" defaultValue={settings.afterVenueName ?? ""} />
              </div>
              <div>
                <Label htmlFor="afterVenueAddress">Address</Label>
                <Input id="afterVenueAddress" name="afterVenueAddress" defaultValue={settings.afterVenueAddress ?? ""} />
              </div>
              <div>
                <Label htmlFor="afterStartTime">Start time</Label>
                <Input
                  id="afterStartTime"
                  name="afterStartTime"
                  type="datetime-local"
                  defaultValue={settings.afterStartTime ? toWallClockInputValue(settings.afterStartTime) : ""}
                />
              </div>
              <div>
                <Label htmlFor="afterEndTime">End time</Label>
                <Input
                  id="afterEndTime"
                  name="afterEndTime"
                  type="datetime-local"
                  defaultValue={settings.afterEndTime ? toWallClockInputValue(settings.afterEndTime) : ""}
                />
              </div>
            </div>
          </fieldset>

          <div>
            <Label htmlFor="dressCode">Dress code description</Label>
            <textarea
              id="dressCode"
              name="dressCode"
              rows={3}
              defaultValue={settings.dressCode}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="themePrimaryColor">Primary color</Label>
              <input
                id="themePrimaryColor"
                name="themePrimaryColor"
                type="color"
                defaultValue={settings.themePrimaryColor}
                className="h-11 w-full rounded-lg border border-border"
              />
            </div>
            <div>
              <Label htmlFor="themeSecondaryColor">Secondary color</Label>
              <input
                id="themeSecondaryColor"
                name="themeSecondaryColor"
                type="color"
                defaultValue={settings.themeSecondaryColor}
                className="h-11 w-full rounded-lg border border-border"
              />
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Save settings
          </Button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-primary">Contact People</h2>
        <div className="mt-4 flex flex-col gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm text-ink">{c.name} — {c.role}</p>
                <p className="text-xs text-ink-muted">{[c.phone, c.email].filter(Boolean).join(" · ")}</p>
              </div>
              <form action={deleteContact}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="text-xs text-red-700 underline">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={createContact} className="mt-4 grid max-w-lg gap-3 sm:grid-cols-2">
          <Input name="name" placeholder="Name" required />
          <Input name="role" placeholder="Role (e.g. Groom, Best man)" required />
          <Input name="phone" placeholder="Phone (optional)" />
          <Input name="email" type="email" placeholder="Email (optional)" />
          <Button type="submit" className="sm:col-span-2">
            Add contact
          </Button>
        </form>
      </section>
    </div>
  );
}
