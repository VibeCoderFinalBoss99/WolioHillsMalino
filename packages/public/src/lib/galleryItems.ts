export type GalleryEntry = { src: string; alt: string };

/** Fallback jika manifest kosong / gagal dimuat (setiap src unik). */
export const GALLERY_FALLBACK: GalleryEntry[] = [
  { src: "/images/picture-3.webp", alt: "Interior dan detail villa Wolio Hills" },
  { src: "/images/picture-2.webp", alt: "Ruang tamu dan area bersantai" },
  { src: "/images/hero-section.webp", alt: "Pemandangan pegunungan Malino" },
];

export function normalizeGallerySrc(src: string): string {
  const t = src.trim();
  if (t.startsWith("/")) return t;
  if (t.startsWith("./images/")) return `/${t.slice(2)}`;
  if (t.startsWith("images/")) return `/${t}`;
  return t.startsWith("/") ? t : `/images/${t.replace(/^\.\//, "")}`;
}

/** Hilangkan duplikat berdasarkan nama berkas (case-insensitive). */
export function dedupeGalleryItems(items: GalleryEntry[]): GalleryEntry[] {
  const seen = new Set<string>();
  const out: GalleryEntry[] = [];
  for (const it of items) {
    const src = normalizeGallerySrc(it.src);
    const base = src.split("/").pop()?.toLowerCase() ?? src.toLowerCase();
    if (seen.has(base)) continue;
    seen.add(base);
    const alt = it.alt?.trim() || humanizeImageFilename(src.split("/").pop() || base);
    out.push({ src, alt });
  }
  return out;
}

export function humanizeImageFilename(file: string): string {
  const base = file.replace(/\.(png|jpe?g|webp|gif|avif)$/i, "");
  return (
    base
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Foto Wolio Hills"
  );
}
