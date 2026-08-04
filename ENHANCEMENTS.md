# Claude Code Prompt — Roora App Enhancement

## Context

This is an **existing, working** Next.js 16 PWA for Blessing & Tessandra's maroora/lobola celebration. The app is deployed, has real users (invite-only), and the core features already work. **Do NOT rebuild from scratch** — this prompt is for adding new features, enhancements, and polish to what already exists.

Project path: `C:\Users\USER\Projects\roora`

---

## Current Stack (already in place)

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4**
- **Prisma 7 + SQLite** (provider-portable, migrating to Postgres later)
- **iron-session** (encrypted cookies) + **bcryptjs**
- **S3** for media uploads (private, served through authenticated routes)
- **PWA** (service worker, offline fallback, installable)
- **Docker** deployment on EC2 with Caddy reverse proxy

---

## What Already Exists

### Guest-facing pages (`src/app/(guest)/`):

- ✅ Dashboard (countdown, navigation tiles)
- ✅ Main Program (maroora schedule timeline)
- ✅ After Party (celebration schedule)
- ✅ RSVP (status selection + guest count + notes)
- ✅ Gallery (photo/video upload, moderation, comments, share links + QR)
- ✅ Dress Code page
- ✅ Contact page (host contact info)
- ✅ Account settings (password change)

### Public pages (`src/app/(public)/`):

- ✅ Landing page (couple photo, invite code entry, login)
- ✅ Invite redeem flow (code → set name/password → signed in)
- ✅ Login / Forgot password / Reset password
- ✅ Public share links (unauthenticated media viewing)

### Admin pages (`src/app/admin/`):

- ✅ Invite management (create, QR, status tracking)
- ✅ Schedule management (MAIN + AFTER_PARTY items)
- ✅ RSVP overview (attendance tracking)
- ✅ Media moderation (approve/reject/hide + audit logs)
- ✅ Meeting minutes (family planning meetings, pledges)
- ✅ Event settings (names, date, venues, colours, dress code)
- ✅ User management (roles, permissions)

### Components:

- ✅ Wax seal (static, CSS-only, decorative)
- ✅ Schedule timeline
- ✅ Invite envelope animation
- ✅ Install prompt (PWA)
- ✅ Push subscribe button (subscription stored, not yet sending)
- ✅ Bottom nav (mobile)
- ✅ UI primitives (Button, Input, Tile, CopyButton)

### Data model (Prisma):

- Users, Roles (SUPERADMIN/ADMIN/APPROVED_GUEST/PENDING_GUEST)
- Invitations (code + token + status)
- RSVP (status, guest count, notes)
- ScheduleItem (MAIN / AFTER_PARTY with time + order)
- EventSettings (names, date, venues, theme colours, dress code)
- Media + Comments + ModerationLog + ShareLink
- Minutes + MinutesItem + Pledge (family planning records)
- PushSubscription, UserPermission, PasswordResetToken, ContactPerson

---

## Enhancements to Add

Implement these features into the existing codebase. Respect the current architecture, coding style, and conventions. Add migrations where needed. Do NOT break any existing functionality.

---

### 1. Interactive Wax Seal Landing Animation

**Current state**: The wax seal is a static CSS component (`src/components/wax-seal.tsx`) used as decoration. The landing page (`src/app/(public)/page.tsx`) is a simple form with the couple photo.

**Enhancement**: Make the landing page a two-phase experience:

1. **Phase 1 (Seal screen)**: Full-viewport sage-green background with floral SVG line art. The wax seal is centered, large (~180px), with the initials "B&T" embossed. Text below: "TAP THE SEAL TO OPEN". On tap → seal cracks with a spring animation (fragments fly outward, opacity fades). After 600ms, crossfade to…
2. **Phase 2 (Current landing)**: The existing landing page content fades in from below.

**Implementation notes**:

- Add `framer-motion` to the project (it's not currently installed)
- Persist the "opened" state in `sessionStorage` so returning visitors skip straight to Phase 2
- Add haptic feedback: `navigator.vibrate?.(50)` on seal tap
- The seal-break animation should use spring physics (not linear easing)
- Keep it a client component (`"use client"`) that wraps the existing server-rendered landing content
- The floral pattern should be a subtle SVG with gold (#C9A84C) strokes on the primary green background

---

### 2. Venue Map & Directions Section

**Current state**: Venue info is just text in EventSettings (name + address + TBA flag). No map shown anywhere.

**Enhancement**: Add an interactive venue section to the guest dashboard or a dedicated `/venue` page:

- Embedded Google Map (iframe via `mapEmbedUrl`) showing the pin
- Venue name + full address below the map
- "GET DIRECTIONS" button → opens Google Maps in new tab with the venue coordinates
- Optional QR code (admin can upload or auto-generate from the directions URL)
- Handle the `mainVenueIsTBA` flag — show "Venue details coming soon" placeholder when TBA

**Schema changes**:

```prisma
// Add to EventSettings:
mainVenueMapUrl    String?   // Google Maps embed iframe URL
mainVenueLat       Float?    // For directions deep link
mainVenueLng       Float?    // For directions deep link
afterVenueMapUrl   String?
afterVenueLat      Float?
afterVenueLng      Float?

```

**Admin**: Add map URL + coordinates fields to `/admin/settings`.

---

### 3. Countdown Timer Component

**Current state**: Dashboard shows "X days to go" as a static badge.

**Enhancement**: Replace or supplement with a live countdown component:

- Days / Hours / Minutes / Seconds (flip-clock or segmented card style)
- Auto-updates every second (client-side interval)
- On event day: switches to "It's happening now! 🎉"
- After event: switches to "What a beautiful day it was ❤️"
- Place on the dashboard hero section, and optionally on the landing page

---

### 4. Photo Gallery Enhancements — "Moments of Us" Pre-Event Section

**Current state**: Gallery only shows user-uploaded media from the event.

**Enhancement**: Add an admin-curated "Moments of Us" pre-event gallery section:

- A top carousel or grid on the gallery page showing the couple's pre-event photos
- These are uploaded by admin from `/admin/settings` or a new `/admin/gallery-featured` page
- Separate from user-uploaded memories — always visible, always approved, no moderation needed
- Labelled with a section header: "Our Story" or "Moments of Us"

**Schema**:

```prisma
model FeaturedPhoto {
  id        String   @id @default(cuid())
  path      String   // S3 key
  caption   String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
}

```

---

### 5. FAQ Section

**Current state**: No FAQ page exists.

**Enhancement**: Add `/faq` guest page with expandable accordion:

- Questions and answers managed by admin (new `/admin/faq` page)
- Animated expand/collapse (CSS transitions or framer-motion)
- Add FAQ tile to the dashboard grid

**Schema**:

```prisma
model FaqItem {
  id       String @id @default(cuid())
  question String
  answer   String
  order    Int    @default(0)
  visible  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

---

### 6. Guest Song Request (RSVP Enhancement)

**Current state**: RSVP has status, guest count, and freeform notes.

**Enhancement**: Add a dedicated "Song Request" field to the RSVP form:

- Text input: "What song gets you on the dance floor?"
- Stored alongside the RSVP
- Visible in the admin RSVP summary (optionally as a playlist export)

**Schema change**:

```prisma
// Add to Rsvp model:
songRequest String?

```

---

### 7. Dietary Requirements (RSVP Enhancement)

**Current state**: Only freeform notes on RSVP.

**Enhancement**: Add a dedicated dietary restrictions field:

- Multi-select checkboxes: Vegetarian, Vegan, Halal, Gluten-free, Nut allergy, Other
- "Other" expands a text field for specifics
- Stored as JSON string or comma-separated in the RSVP record
- Admin RSVP dashboard shows dietary summary/counts

**Schema change**:

```prisma
// Add to Rsvp model:
dietaryNeeds String?   // JSON array of selected options + freeform "other"

```

---

### 8. Scroll Animations & Polish

**Current state**: No scroll-triggered animations. Pages are static.

**Enhancement**: Add subtle entrance animations throughout the guest pages:

- Sections fade-in + slide up as they enter the viewport
- Timeline items stagger on scroll
- Gallery photos scale from 0.95 on viewport entry
- Use Intersection Observer + CSS transitions (or framer-motion if added for the seal)
- Keep it tasteful — no jarring effects, 400-600ms durations, ease-out curves
- **Important**: Respect `prefers-reduced-motion` — disable animations when the user has that OS setting enabled

---

### 9. Push Notifications — Actually Send Them

**Current state**: Push subscription storage is wired up (`PushSubscription` model, subscribe button, VAPID keys configured), but nothing actually sends a push.

**Enhancement**: Implement push sending for key events:

- Admin triggers: "Venue announced", "Schedule updated", "New gallery photos approved"
- Auto-triggers: RSVP deadline reminder (if `rsvpDeadline` is set, send 3 days before and 1 day before)
- Use the `web-push` package (already in `package.json`) to send to all subscribed users
- Add a "Send announcement" form in the admin panel (custom title + body)
- Server action that loops over `PushSubscription` records and sends via `web-push`
- Handle expired/invalid subscriptions (delete on 410 response)

---

### 10. Video Thumbnails

**Current state**: Video uploads show as a generic video icon or blank in the gallery grid.

**Enhancement**:

- On upload, extract a thumbnail frame (first frame or 1s in) server-side
- Store the thumbnail in S3 alongside the video
- Show the thumbnail in the gallery grid with a play button overlay
- If server-side extraction is too complex (no ffmpeg on the server), use a `<video>` element with `preload="metadata"` and a poster frame via `#t=1` trick on the client

---

### 11. Event-Day Live Features (Stretch)

**Current state**: No real-time features.

**Enhancement** (lower priority — implement if time allows):

- **Live photo wall**: New approved gallery photos appear in real-time for all guests (polling every 30s or Server-Sent Events)
- **Announcement banner**: Admin can post a live text announcement that appears as a toast/banner on all guest screens (e.g., "Ceremony starting in 5 minutes — please take your seats")

---

## Implementation Guidelines

1. **Don't break existing features** — all current pages, APIs, and flows must continue to work.
2. **Follow existing patterns**:- Server components by default; `"use client"` only where interaction is needed

- Server Actions in `src/lib/actions/` for mutations
- Validation schemas in `src/lib/validations/`
- Auth checks via `src/lib/auth.ts` patterns
- Prisma operations use the existing `db` export from `src/lib/db.ts`

1. **Migrations**: Create proper Prisma migrations for schema changes (`npx prisma migrate dev --name <description>`)
2. **Tailwind v4**: Use CSS variables and the existing design token pattern (check `globals.css` for `--primary`, `--secondary`, `--surface`, etc.)
3. **Accessibility**: Semantic HTML, proper aria attributes, keyboard navigable, respects `prefers-reduced-motion`
4. **Mobile-first**: The app is primarily used on phones. Every new UI must be thumb-friendly and work at 375px width.
5. **The proxy allowlist** (`src/proxy.ts`): Any new public route must be added to the allowlist, or it will 403.

---

## Priority Order

1. 🔴 **Interactive seal animation** (landing page wow factor — guests haven't received invites yet, this is the first impression)
2. 🔴 **Countdown timer** (quick win, high visibility)
3. 🟡 **Venue map & directions** (critical once venue is confirmed)
4. 🟡 **FAQ section** (reduces repeat questions to the hosts)
5. 🟡 **Song request + dietary fields** (RSVP enhancements — needed before invites go out)
6. 🟢 **Scroll animations** (polish)
7. 🟢 **Featured gallery / "Moments of Us"** (nice-to-have pre-event)
8. 🟢 **Push notification sending** (useful but not urgent)
9. 🟢 **Video thumbnails** (polish)
10. 🔵 **Live event-day features** (stretch, only if time allows)

---

## Notes

- The event is **24 October 2026** — there's time, but invites will be going out soon so RSVP enhancements and the seal animation should land first.
- The app is already live at a domain with HTTPS (Caddy handles TLS). Any new client-side features (framer-motion, etc.) must work in production builds.
- SQLite is the current DB — keep queries simple, no complex JOINs in hot paths. Prisma handles the abstraction.
- `framer-motion` is NOT currently installed — add it as part of enhancement #1 or #8.

