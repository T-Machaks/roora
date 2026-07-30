import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run demo seed with NODE_ENV=production.");
  process.exit(1);
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const db = new PrismaClient({ adapter });

const code = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 8);
const token = () => randomBytes(24).toString("base64url");

async function main() {
  const superadmin = await db.user.findFirst({
    where: { role: "SUPERADMIN" },
  });
  if (!superadmin) {
    throw new Error("Run `npm run seed` first to create a superadmin.");
  }

  await db.invitation.createMany({
    data: [
      {
        code: code(),
        token: token(),
        guestName: "Demo Guest One",
        maxGuests: 2,
        createdById: superadmin.id,
      },
      {
        code: code(),
        token: token(),
        guestName: "Demo Guest Two",
        maxGuests: 1,
        createdById: superadmin.id,
      },
    ],
  });

  const demoPasswordHash = await bcrypt.hash("demo-password", 12);
  const demoGuest = await db.user.upsert({
    where: { email: "demo.guest@example.com" },
    update: {},
    create: {
      name: "Demo Guest",
      email: "demo.guest@example.com",
      guestHandle: "demo-guest",
      passwordHash: demoPasswordHash,
      role: "APPROVED_GUEST",
      rsvp: {
        create: {
          status: "MAYBE",
          guestCount: 2,
          notes: "Demo RSVP for local testing.",
        },
      },
    },
  });

  console.log("Demo data seeded:");
  console.log("  - 2 pending invitations (see /admin/invites)");
  console.log(
    `  - demo guest login: ${demoGuest.email} / demo-password (also handle: demo-guest)`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
