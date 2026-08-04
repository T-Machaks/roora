-- AlterTable
ALTER TABLE "EventSettings" ADD COLUMN "afterVenueLat" REAL;
ALTER TABLE "EventSettings" ADD COLUMN "afterVenueLng" REAL;
ALTER TABLE "EventSettings" ADD COLUMN "afterVenueMapUrl" TEXT;
ALTER TABLE "EventSettings" ADD COLUMN "mainVenueLat" REAL;
ALTER TABLE "EventSettings" ADD COLUMN "mainVenueLng" REAL;
ALTER TABLE "EventSettings" ADD COLUMN "mainVenueMapUrl" TEXT;

-- AlterTable
ALTER TABLE "Rsvp" ADD COLUMN "dietaryNeeds" TEXT;
ALTER TABLE "Rsvp" ADD COLUMN "songRequest" TEXT;

-- CreateTable
CREATE TABLE "FaqItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
