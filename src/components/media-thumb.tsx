import { PlayIcon } from "@/components/icons";

/** No server-side thumbnail extraction (no ffmpeg in the runtime image) —
 * the #t= fragment is a browser-only seek hint, never sent to the server,
 * so this relies purely on Range support in streamFile. Used from both a
 * server component (the initial gallery render) and a client component
 * (the live-polled grid), so it stays framework-neutral — no directives,
 * no hooks. */
export function MediaThumb({ id, type }: { id: string; type: "IMAGE" | "VIDEO" }) {
  const src = `/api/media/file/${id}`;
  if (type === "IMAGE") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <div className="relative h-full w-full">
      <video
        src={`${src}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
        <PlayIcon width={28} height={28} className="text-white drop-shadow" />
      </span>
    </div>
  );
}
