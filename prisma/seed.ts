import "dotenv/config";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

const handleSuffix = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);

async function main() {
  const superadminName = process.env.SEED_SUPERADMIN_NAME || "Superadmin";
  const superadminEmail =
    process.env.SEED_SUPERADMIN_EMAIL || "admin@example.com";
  const superadminPassword =
    process.env.SEED_SUPERADMIN_PASSWORD || "change-me-now";

  const passwordHash = await bcrypt.hash(superadminPassword, 12);

  const superadmin = await db.user.upsert({
    where: { email: superadminEmail },
    update: {},
    create: {
      name: superadminName,
      email: superadminEmail,
      guestHandle: `superadmin-${handleSuffix()}`,
      passwordHash,
      role: "SUPERADMIN",
    },
  });

  console.log(`Superadmin ready: ${superadmin.email}`);
  if (!process.env.SEED_SUPERADMIN_PASSWORD) {
    console.log(
      `  (no SEED_SUPERADMIN_PASSWORD set — used default "change-me-now"; change it immediately after first login)`
    );
  }

  const eventDate = new Date(process.env.EVENT_DATE || "2026-10-24");

  await db.eventSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brideName: "Tessandra Chikomba",
      groomName: "Blessing Ngonidzashe Kaitano",
      eventDate,
      mainVenueIsTBA: true,
      afterVenueIsTBA: true,
      dressCode:
        "All black. Guests are kindly asked to dress elegantly in black for the maroora proceedings.",
      themePrimaryColor: process.env.THEME_PRIMARY_COLOR || "#5C3A21",
      themeSecondaryColor: process.env.THEME_SECONDARY_COLOR || "#EDE0D4",
      themeName: "groom",
    },
  });
  console.log("Event settings ready.");

  const existingContacts = await db.contactPerson.count();
  if (existingContacts === 0) {
    await db.contactPerson.createMany({
      data: [
        {
          name: "Blessing Ngonidzashe Kaitano",
          role: "Groom",
          order: 0,
        },
        {
          name: "Tessandra Chikomba",
          role: "Bride",
          order: 1,
        },
      ],
    });
    console.log("Seeded contact people.");
  }

  const existingItems = await db.scheduleItem.count();
  if (existingItems === 0) {
    const day = eventDate.toISOString().slice(0, 10);
    // Appending Z stores the literal Harare wall-clock time typed here,
    // matching how the admin UI's datetime-local inputs are parsed
    // (see parseWallClock in src/lib/format.ts) — no timezone conversion.
    const at = (time: string) => new Date(`${day}T${time}:00.000Z`);

    await db.scheduleItem.createMany({
      data: [
        {
          programType: "MAIN",
          title: "Guests arrive & registration",
          startTime: at("09:00"),
          endTime: at("09:30"),
          order: 0,
        },
        {
          programType: "MAIN",
          title: "Welcome & opening remarks",
          startTime: at("09:30"),
          endTime: at("10:00"),
          order: 1,
        },
        {
          programType: "MAIN",
          title: "Maroora proceedings",
          startTime: at("10:00"),
          endTime: at("13:00"),
          order: 2,
        },
        {
          programType: "MAIN",
          title: "Closing remarks & lunch",
          startTime: at("13:00"),
          endTime: at("14:00"),
          order: 3,
        },
        {
          programType: "AFTER_PARTY",
          title: "Doors open",
          startTime: at("15:30"),
          endTime: at("16:00"),
          order: 0,
        },
        {
          programType: "AFTER_PARTY",
          title: "Celebration & entertainment",
          startTime: at("16:00"),
          endTime: at("20:00"),
          order: 1,
        },
      ],
    });
    console.log("Seeded schedule items.");
  }

  console.log("Seed complete.");
  return superadmin;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
