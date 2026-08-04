-- AlterTable
ALTER TABLE "EventSettings" ADD COLUMN "rsvpReminder1dSentAt" DATETIME;
ALTER TABLE "EventSettings" ADD COLUMN "rsvpReminder3dSentAt" DATETIME;

-- CreateTable
CREATE TABLE "FeaturedPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
