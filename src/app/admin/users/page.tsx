import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { updateUserRole } from "@/lib/actions/users";

export const metadata = { title: "Users" };

const ROLE_OPTIONS: Role[] = [
  Role.PENDING_GUEST,
  Role.APPROVED_GUEST,
  Role.ADMIN,
  Role.SUPERADMIN,
];

export default async function AdminUsersPage() {
  const session = await requireRole([Role.ADMIN, Role.SUPERADMIN]);
  const canEditRoles = session.role === Role.SUPERADMIN;

  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Users
      </h1>

      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-ink">{user.name}</p>
              <p className="text-xs text-ink-muted">
                {user.email ?? user.guestHandle}
              </p>
            </div>
            {canEditRoles && user.id !== session.userId ? (
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
        ))}
      </div>
    </div>
  );
}
