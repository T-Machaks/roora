import { z } from "zod";

export const createInviteSchema = z.object({
  guestName: z.string().trim().max(100).optional(),
  maxGuests: z.coerce.number().int().min(1).max(20).default(1),
  note: z.string().trim().max(300).optional(),
  expiresAt: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
});

export const scheduleItemSchema = z.object({
  programType: z.enum(["MAIN", "AFTER_PARTY"]),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(500).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  order: z.coerce.number().int().default(0),
});

export const eventSettingsSchema = z.object({
  brideName: z.string().trim().min(1).max(100),
  groomName: z.string().trim().min(1).max(100),
  eventDate: z.string().min(1),

  mainVenueIsTBA: z.coerce.boolean(),
  mainVenueName: z.string().trim().max(150).optional(),
  mainVenueAddress: z.string().trim().max(300).optional(),
  mainStartTime: z.string().optional(),
  mainEndTime: z.string().optional(),

  afterVenueIsTBA: z.coerce.boolean(),
  afterVenueName: z.string().trim().max(150).optional(),
  afterVenueAddress: z.string().trim().max(300).optional(),
  afterStartTime: z.string().optional(),
  afterEndTime: z.string().optional(),

  dressCode: z.string().trim().min(1).max(1000),
  themePrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  themeSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  rsvpDeadline: z.string().optional(),
});

export const contactPersonSchema = z.object({
  name: z.string().trim().min(1).max(100),
  role: z.string().trim().min(1).max(60),
  phone: z.string().trim().max(30).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["PENDING_GUEST", "APPROVED_GUEST", "ADMIN", "SUPERADMIN"]),
});

export const ADMIN_AREAS = [
  "INVITES",
  "SCHEDULE",
  "SETTINGS",
  "RSVPS",
  "MINUTES",
  "MODERATION",
] as const;

export const updateUserPermissionsSchema = z.object({
  userId: z.string().min(1),
  areas: z.array(z.enum(ADMIN_AREAS)),
});

export const minutesSchema = z.object({
  meetingDate: z.string().min(1, "Meeting date is required"),
  title: z.string().trim().min(2).max(150),
  venue: z.string().trim().max(200).optional(),
  attendees: z.string().trim().max(500).optional(),
});

export const minutesItemSchema = z.object({
  minutesId: z.string().min(1),
  text: z.string().trim().min(1).max(500),
  order: z.coerce.number().int().default(0),
});

export const pledgeSchema = z.object({
  minutesId: z.string().min(1),
  pledgerName: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  order: z.coerce.number().int().default(0),
});
