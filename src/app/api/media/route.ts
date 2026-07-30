import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { saveUpload, UploadValidationError } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await requireApiRole([
    Role.APPROVED_GUEST,
    Role.ADMIN,
    Role.SUPERADMIN,
  ]);
  if (session instanceof NextResponse) return session;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const captionRaw = formData?.get("caption");
  const caption =
    typeof captionRaw === "string" && captionRaw.trim()
      ? captionRaw.trim().slice(0, 300)
      : null;

  try {
    const saved = await saveUpload(file);

    const media = await db.media.create({
      data: {
        uploaderId: session.userId,
        type: saved.type,
        mimeType: saved.mimeType,
        fileName: saved.fileName,
        originalName: file.name.slice(0, 200),
        path: saved.relativePath,
        sizeBytes: saved.sizeBytes,
        caption,
        status: "PENDING",
      },
    });

    return NextResponse.json({ ok: true, media });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
