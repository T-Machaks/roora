import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";

export const metadata = { title: "Moderation Log" };

export default async function ModerationLogsPage() {
  await requireArea(AdminArea.MODERATION);

  const logs = await db.moderationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Moderation Log
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Actor</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Target</th>
              <th className="py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/60">
                <td className="py-2 pr-4 text-ink-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{log.actor.name}</td>
                <td className="py-2 pr-4">{log.action}</td>
                <td className="py-2 pr-4 text-ink-muted">
                  {log.targetType} · {log.targetId.slice(0, 8)}
                </td>
                <td className="py-2 text-ink-muted">{log.reason ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-muted">
                  No moderator actions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
