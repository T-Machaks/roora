import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role, AdminArea } from "@/generated/prisma/enums";
import { updateUserRole } from "@/lib/actions/users";
import { updateUserPermissions } from "@/lib/actions/permissions";

export const metadata = { title: "Users" };

const ROLE_OPTIONS: Role[] = [
  Role.PENDING_GUEST,
  Role.APPROVED_GUEST,
  Role.ADMIN,
  Role.SUPERADMIN,
];

const AREA_OPTIONS: { area: AdminArea; label: string }[] = [
  { area: AdminArea.INVITES, label: "Invites" },
  { area: AdminArea.SCHEDULE, label: "Schedule" },
  { area: AdminArea.SETTINGS, label: "Settings" },
  { area: AdminArea.RSVPS, label: "RSVPs" },
  { area: AdminArea.MINUTES, label: "Minutes" },
  { area: AdminArea.MODERATION, label: "Moderation" },
];

export default async function AdminUsersPage() {
  const session = await requireRole([Role.ADMIN, Role.SUPERADMIN]);
  const canEditRoles = session.role === Role.SUPERADMIN;

  const [users, permissions] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "desc" } }),
    canEditRoles
      ? db.userPermission.findMany({ select: { userId: true, area: true } })
      : Promise.resolve([]),
  ]);

  const areasByUser = new Map<string, Set<AdminArea>>();
  for (const p of permissions) {
    if (!areasByUser.has(p.userId)) areasByUser.set(p.userId, new Set());
    areasByUser.get(p.userId)!.add(p.area);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Users
      </h1>

      <div className="flex flex-col gap-3">
        {users.map((user) => {
          const canEditThisUser = canEditRoles && user.id !== session.userId;
          const grantedForUser = areasByUser.get(user.id) ?? new Set<AdminArea>();

          return (
            <div
              key={user.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-ink">{user.name}</p>
                  <p className="text-xs text-ink-muted">
                    {user.email ?? user.guestHandle}
                  </p>
                </div>
                {canEditThisUser ? (
                  <form action={updateUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-secondary"
                    >
                      Update
                    </button>
                  </form>
                ) : (
                  <p className="text-xs uppercase tracking-wide text-ink-muted">
                    {user.role.replaceAll("_", " ")}
                    {user.id === session.userId && " (you)"}
                  </p>
                )}
              </div>

              {canEditThisUser && user.role === Role.ADMIN && (
                <form
                  action={updateUserPermissions}
                  className="flex flex-wrap items-center gap-3 border-t border-border pt-3"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  {AREA_OPTIONS.map(({ area, label }) => (
                    <label key={area} className="flex items-center gap-1.5 text-xs text-ink">
                      <input
                        type="checkbox"
                        name="areas"
                        value={area}
                        defaultChecked={grantedForUser.has(area)}
                      />
                      {label}
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-secondary"
                  >
                    Save access
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
