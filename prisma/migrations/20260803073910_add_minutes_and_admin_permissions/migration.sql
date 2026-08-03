-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Minutes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetingDate" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "attendees" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Minutes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MinutesItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minutesId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MinutesItem_minutesId_fkey" FOREIGN KEY ("minutesId") REFERENCES "Minutes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minutesId" TEXT NOT NULL,
    "pledgerName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Pledge_minutesId_fkey" FOREIGN KEY ("minutesId") REFERENCES "Minutes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userId_area_key" ON "UserPermission"("userId", "area");

-- CreateIndex
CREATE INDEX "Minutes_meetingDate_idx" ON "Minutes"("meetingDate");

-- CreateIndex
CREATE INDEX "MinutesItem_minutesId_order_idx" ON "MinutesItem"("minutesId", "order");

-- CreateIndex
CREATE INDEX "Pledge_minutesId_order_idx" ON "Pledge"("minutesId", "order");
