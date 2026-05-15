import React, { useCallback, useEffect, useMemo, useState } from "react";
import { m } from "motion/react";
import {
  MapPin,
  Mountain,
  Trees,
  Maximize2,
  Map,
  Sparkles,
  Leaf,
  Handshake,
  Heart,
  Cloud,
  X,
  Images,
} from "lucide-react";
import {
  dedupeGalleryItems,
  GALLERY_FALLBACK,
  humanizeImageFilename,
  type GalleryEntry,
} from "../lib/galleryItems";

const HERO_WAVE_PATH =
  "M0,55 C180,95 360,15 540,55 C720,95 900,25 1080,50 C1260,75 1380,40 1440,48 L1440,120 L0,120 Z";

/** Layout asimetris 5 sel — digabung dengan 5 gambar pertama daftar unik */
const GALLERY_GRID_SPANS = [
  "md:col-span-1 md:row-span-2 h-64 md:h-auto",
  "md:col-span-2 md:row-span-1 h-56 md:h-auto",
  "md:col-span-1 md:row-span-2 md:col-start-4 md:row-start-1 h-64 md:h-auto",
  "md:col-span-1 md:row-span-1 h-56 md:h-auto",
  "md:col-span-1 md:row-span-1 h-56 md:h-auto",
] as const;

/** Gelombang bawah hero — amplitudo kecil (objectBoundingBox) */
const HERO_BOTTOM_WAVE_CLIP =
  "M0,0 L1,0 L1,0.94 C0.88,0.965 0.72,0.93 0.58,0.955 C0.44,0.98 0.3,0.935 0.16,0.958 C0.08,0.97 0,0.94 0,0.952 L0,0 Z";

/** Pemisah surface — gelombang halus, viewBox pendek */
const HERO_SURFACE_WAVE_PATH =
  "M0,52 C240,46 480,58 720,50 C960,42 1200,54 1440,48 L1440,80 L0,80 Z";

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`text-accent font-semibold text-[10px] sm:text-xs uppercase tracking-[0.2em] block mb-4 ${className}`}
    >
      {children}
    </span>
  );
}

function PhilosophyCard({
  icon: Icon,
  title,
  desc,
  stagger,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  stagger?: boolean;
  delay: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`philosophy-card-shell relative h-full overflow-hidden rounded-3xl border-t-4 border-t-accent bg-white p-8 gold-border shadow-deep flex flex-col gap-5 ${stagger ? "lg:translate-y-8" : ""}`}
    >
      <div className="philosophy-shine-track rounded-3xl" aria-hidden>
        <div className="philosophy-shine-bar" />
      </div>
      <div className="relative z-[1] flex flex-col gap-5">
        <Icon className="w-9 h-9 text-accent stroke-[1.25]" aria-hidden />
        <h3 className="font-display font-bold text-primary text-xl md:text-2xl leading-snug">{title}</h3>
        <div className="w-full h-px bg-accent/20" />
        <p className="text-text-light text-sm leading-relaxed">{desc}</p>
      </div>
    </m.div>
  );
}

export default function AboutPage() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [magnified, setMagnified] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryEntry[]>(() => dedupeGalleryItems(GALLERY_FALLBACK));

  const uniqueGallery = useMemo(() => dedupeGalleryItems(galleryItems), [galleryItems]);
  const gridGallery = useMemo(() => uniqueGallery.slice(0, 5), [uniqueGallery]);

  useEffect(() => {
    const loadManifest = () => {
      fetch("/gallery-manifest.json", { cache: "no-cache" })
        .then((r) => (r.ok ? r.json() : []))
        .then((raw: unknown) => {
          if (!Array.isArray(raw)) return;
          const fromManifest: GalleryEntry[] = raw
            .filter((x): x is { file: string; alt?: string } => Boolean(x && typeof (x as { file?: string }).file === "string"))
            .map((x) => ({
              src: `/images/${String(x.file).replace(/^\/+/, "")}`,
              alt: typeof x.alt === "string" && x.alt.trim() ? x.alt.trim() : humanizeImageFilename(x.file),
            }));
          setGalleryItems(dedupeGalleryItems([...fromManifest, ...GALLERY_FALLBACK]));
        })
        .catch(() => {});
    };

    const idle =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(() => loadManifest(), { timeout: 2800 })
        : window.setTimeout(loadManifest, 1);
    return () => {
      if (typeof requestIdleCallback !== "undefined" && typeof idle === "number") {
        cancelIdleCallback(idle);
      } else {
        clearTimeout(idle as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  const closeAll = useCallback(() => {
    setGalleryOpen(false);
    setViewerIndex(null);
    setMagnified(false);
  }, []);

  useEffect(() => {
    if (!galleryOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [galleryOpen]);

  useEffect(() => {
    if (!galleryOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (viewerIndex !== null) {
        setViewerIndex(null);
        setMagnified(false);
      } else {
        closeAll();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [galleryOpen, viewerIndex, closeAll]);

  const openGallery = () => {
    setViewerIndex(null);
    setMagnified(false);
    setGalleryOpen(true);
  };

  const backdropClick = () => {
    if (viewerIndex !== null) {
      setViewerIndex(null);
      setMagnified(false);
    } else {
      closeAll();
    }
  };

  return (
    <div className="min-w-0 overflow-x-clip">
      {/* 1. Hero — bawah background terpotong gelombang (clip-path) */}
      <section className="relative min-h-[58vh] md:min-h-[64vh] flex items-end overflow-hidden bg-primary pb-12 md:pb-14 pt-28 md:pt-32 px-6 md:px-16">
        <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden>
          <defs>
            <clipPath id="about-hero-bottom-wave" clipPathUnits="objectBoundingBox">
              <path d={HERO_BOTTOM_WAVE_CLIP} />
            </clipPath>
          </defs>
        </svg>
        <div className="absolute inset-0" style={{ clipPath: "url(#about-hero-bottom-wave)" }}>
          <img
            src="./images/IMG_6888.webp"
            alt="Pemandangan pegunungan Malino"
            className="absolute inset-0 h-full w-full object-cover object-center"
            width={1920}
            height={1080}
            decoding="async"
          />

          {/* Gelombang dekoratif di atas foto */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[38%] overflow-hidden" aria-hidden>
            <div className="about-hero-wave-track absolute bottom-0 left-0 flex h-20 w-[200%] min-h-[5.5rem] md:h-28">
              <svg className="block h-full w-1/2 text-white/22" viewBox="0 0 1440 120" preserveAspectRatio="none">
                <path fill="currentColor" d={HERO_WAVE_PATH} />
              </svg>
              <svg className="block h-full w-1/2 text-white/22" viewBox="0 0 1440 120" preserveAspectRatio="none">
                <path fill="currentColor" d={HERO_WAVE_PATH} />
              </svg>
            </div>
            <div className="about-hero-wave-track-slow absolute bottom-0 left-0 flex h-16 w-[200%] min-h-[4.5rem] opacity-70 md:h-24">
              <svg className="block h-full w-1/2 text-accent/25" viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path
                  fill="currentColor"
                  d="M0,70 C240,30 480,90 720,45 C960,0 1200,80 1440,55 L1440,100 L0,100 Z"
                />
              </svg>
              <svg className="block h-full w-1/2 text-accent/25" viewBox="0 0 1440 100" preserveAspectRatio="none">
                <path
                  fill="currentColor"
                  d="M0,70 C240,30 480,90 720,45 C960,0 1200,80 1440,55 L1440,100 L0,100 Z"
                />
              </svg>
            </div>
          </div>

          <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/78 via-black/52 to-black/42" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-12">
          <div className="max-w-2xl">
            <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <SectionLabel>Tentang Kami</SectionLabel>
              <h1 className="font-display font-black text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.08] mb-5 text-balance">
                Lebih dari Sekadar <br />
                <span className="italic text-gradient">Tempat Menginap</span>
              </h1>
              <div className="w-16 h-px bg-accent/80 mb-5" />
              <p
                className="text-white/80 text-base sm:text-lg max-w-lg leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.55),0_0_24px_rgba(0,0,0,0.35)]"
              >
                Di tengah pelukan kabut Malino, Wolio Hills hadir sebagai suaka bagi jiwa yang mencari ketenangan dan
                harmoni antara kenyamanan modern dengan kemegahan alam.
              </p>
            </m.div>
          </div>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-dark rounded-2xl p-6 md:p-8 w-full max-w-md border border-accent/20"
          >
            <div className="flex items-center gap-3 w-full border-b border-white/10 pb-3">
              <MapPin className="w-5 h-5 text-accent shrink-0" aria-hidden />
              <span className="text-white/90 text-[10px] font-semibold uppercase tracking-[0.2em]">Koordinat</span>
            </div>
            <p className="text-white/65 text-sm mt-3">5°14&apos;39.5&quot;S 119°54&apos;19.6&quot;E</p>
            <div className="flex items-center gap-3 w-full border-b border-white/10 pb-3 pt-4 mt-2">
              <Mountain className="w-5 h-5 text-accent shrink-0" aria-hidden />
              <span className="text-white/90 text-[10px] font-semibold uppercase tracking-[0.2em]">Elevasi</span>
            </div>
            <p className="text-white/65 text-sm mt-3">1.200 mdpl</p>
          </m.div>
        </div>
      </section>

      {/* Pemisah gelombang (fill surface) — overlap tipis agar tidak garis putus */}
      <div className="relative z-[5] -mt-px leading-[0] bg-surface">
        <svg
          viewBox="0 0 1440 80"
          className="relative z-[1] block w-full h-8 sm:h-9 md:h-10"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path fill="var(--color-surface)" d={HERO_SURFACE_WAVE_PATH} />
        </svg>
      </div>

      {/* 2. Kisah — rapat ke hero, sedikit napas setelah gelombang */}
      <section className="w-full bg-surface pt-4 pb-14 md:pt-6 md:pb-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <m.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full min-h-[380px] lg:min-h-[520px] relative rounded-3xl overflow-hidden shadow-deep gold-border"
          >
              <img
                src="./images/picture-3.webp"
                alt="Interior villa Wolio Hills dengan pemandangan hutan"
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
          </m.div>
          <m.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:pl-2">
            <SectionLabel>Kisah Kami</SectionLabel>
            <h2 className="font-display font-black text-primary text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              Dilahirkan dari <br />
              <span className="italic text-gradient">Kecintaan pada Alam</span>
            </h2>
            <div className="space-y-5 text-text-light text-sm md:text-base leading-relaxed max-w-xl">
              <p>
                Didirikan dengan satu tujuan sederhana yaitu menghadirkan tempat beristirahat yang tenang, nyaman, dan dekat dengan alam. Wolio Hills Malino lahir dari keinginan untuk memberi setiap tamu pengalaman menginap yang benar-benar berbeda dari biasanya.
              </p>
              <p>
              Setiap sudut properti kami dirancang dengan penuh perhatian dan bukan sekadar tempat tidur, tapi ruang untuk memperlambat langkah, menghirup udara segar pegunungan, dan menikmati pemandangan yang sulit ditemukan di tempat lain. Kami tidak hanya menyewakan rumah, kami menghadirkan ketenangan.
              </p>
              <p>
              Terletak di Malino dengan pesona alam yang khas, Wolio Hills menjadi pelarian sempurna dari kesibukan sehari-hari. Kami mengundang Anda untuk datang, beristirahat, dan membawa pulang kenangan yang tak terlupakan.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-accent/15">
              {[
                { Icon: Trees, label: "Perkebunan" },
                { Icon: Maximize2, label: "View 360°" },
                { Icon: Map, label: "Malino" },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="px-4 py-2 rounded-full border border-accent/25 text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-2 bg-white/60"
                >
                  <Icon className="w-3.5 h-3.5 text-accent" aria-hidden />
                  {label}
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </section>

      {/* 3. Filosofi */}
      <section className="relative py-16 md:py-24 px-6 md:px-16 hero-gradient overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <m.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 md:mb-20"
          >
            <SectionLabel>Filosofi</SectionLabel>
            <h2 className="font-display font-black text-white text-3xl md:text-4xl lg:text-5xl">
              Prinsip yang <span className="italic text-gradient">Memandu Kami</span>
            </h2>
          </m.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <PhilosophyCard
              icon={Sparkles}
              title="Keheningan Sejati"
              desc="Ruang di mana ketenangan menjadi kemewahan yang sesungguhnya, tempat kamu bisa benar-benar hadir dan mendengarkan ritme alam dengan lebih jelas."
              delay={0}
            />
            <PhilosophyCard
              icon={Leaf}
              title="Kemewahan Alami"
              desc="Material natural dan desain yang membumi membuat setiap sudut villa terasa menyatu dengan lanskap pegunungan di sekitarnya, bukan berdiri di atasnya."
              stagger
              delay={0.08}
            />
            <PhilosophyCard
              icon={Handshake}
              title="Koneksi Mendalam"
              desc="Tempat di mana kamu bisa benar-benar hadir, bersama diri sendiri, orang-orang terkasih, dan alam yang mengelilingimu."
              delay={0.16}
            />
            <PhilosophyCard
              icon={Heart}
              title="Perawatan Tulus"
              desc="Layanan yang hangat dan penuh perhatian, kami selalu hadir sebelum kamu sempat memintanya, agar setiap momen terasa benar-benar istimewa."
              stagger
              delay={0.24}
            />
          </div>
        </div>
      </section>

      {/* 4. Pengalaman */}
      <section className="w-full bg-surface py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto space-y-20 md:space-y-28">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-[58%] min-h-[320px] lg:min-h-[480px] order-2 lg:order-1 rounded-3xl overflow-hidden shadow-deep gold-border"
            >
              <img src="./images/IMG_6950.webp" alt="Ruang tamu villa pada golden hour" className="w-full h-full object-cover min-h-[320px] lg:min-h-[480px]" loading="lazy" />
            </m.div>
            <div className="w-full lg:w-[42%] order-1 lg:order-2 flex flex-col items-start">
              <h3 className="font-display font-black text-primary text-2xl md:text-4xl mb-4 leading-tight">
                Malam yang <br />
                <span className="italic text-gradient">Tak Terlupakan</span>
              </h3>
              <div className="w-12 h-px bg-accent/40 mb-5" />
              <p className="text-text-light text-sm md:text-base leading-relaxed">
              Saat matahari tenggelam di balik bukit, suasana villa berubah menjadi hangat dan nyaman. Obrolan terasa lebih santai bersama orang-orang terkasih, camilan terasa lebih nikmat, dan langit malam yang jernih jauh dari hiruk-pikuk cahaya kota. Dinginnya udara Malino di malam hari semakin membuat momen kebersamaan terasa lebih dalam dan berkesan.
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="w-full lg:w-[42%] flex flex-col items-start lg:items-end lg:text-right">
              <h3 className="font-display font-black text-primary text-2xl md:text-4xl mb-4 leading-tight">
                Pagi Hari di Sambut <br />
                <span className="italic text-gradient">Pemandangan</span>
              </h3>
              <div className="w-12 h-px bg-accent/40 mb-5 lg:ml-auto" />
              <p className="text-text-light text-sm md:text-base leading-relaxed">
              Awali pagi harimu dengan udara sejuk Malino dan suara alam yang sayup-sayup terdengar dari kejauhan. Saat kamu membuka pintu lautan kabut di antara pepohonan menyambut harimu dengan ketenangan yang jarang ditemukan di tempat lain. Pagi di sini bukan sekadar awal hari, melainkan pengalaman yang pelan-pelan mengisi ulang energimu dari dalam.
              </p>
            </div>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-[58%] min-h-[320px] lg:min-h-[480px] rounded-3xl overflow-hidden shadow-deep gold-border"
            >
              <img src="./images/IMG_6965.webp" alt="Kabut pagi di pegunungan" className="w-full h-full object-cover min-h-[320px] lg:min-h-[480px]" loading="lazy" />
            </m.div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full lg:w-[58%] min-h-[320px] lg:min-h-[480px] order-2 lg:order-1 rounded-3xl overflow-hidden shadow-deep gold-border"
            >
              <img src="./images/IMG_6973.webp" alt="Area teras dan pemandangan lembah" className="w-full h-full object-cover min-h-[320px] lg:min-h-[480px]" loading="lazy" />
            </m.div>
            <div className="w-full lg:w-[42%] order-1 lg:order-2 flex flex-col items-start">
              <h3 className="font-display font-black text-primary text-2xl md:text-4xl mb-4 leading-tight">
                Sore yang <br />
                <span className="italic text-gradient">Menenangkan</span>
              </h3>
              <div className="w-12 h-px bg-accent/40 mb-5" />
              <p className="text-text-light text-sm md:text-base leading-relaxed">
              Luangkan waktu di teras sambil menikmati minuman hangat, memandangi lembah hijau yang terbentang di bawah. Angin pegunungan berhembus pelan, dan langit sore di Malino punya caranya sendiri untuk membuat pikiran terasa lebih ringan. Sebuah jeda kecil yang, tanpa disadari, justru paling kamu butuhkan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Galeri */}
      <section id="galeri" className="w-full bg-primary py-16 md:py-24 px-6 md:px-16 text-white">
        <div className="max-w-7xl mx-auto">
          <m.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 md:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <span className="text-accent font-semibold text-[10px] sm:text-xs uppercase tracking-[0.2em] block mb-3">Galeri</span>
              <h2 className="font-display font-black text-3xl md:text-4xl lg:text-5xl text-white">
                Jelajahi Setiap <span className="italic text-gradient">Sudut</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={openGallery}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-accent px-5 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-primary"
            >
              <Images className="h-4 w-4" aria-hidden />
              Lihat koleksi foto
            </button>
          </m.div>
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[min(800px,70vh)]">
            {gridGallery.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => {
                  setGalleryOpen(true);
                  setViewerIndex(i);
                  setMagnified(false);
                }}
                className={`relative overflow-hidden rounded-2xl gold-border text-left outline-none ring-offset-2 ring-offset-primary transition-[filter,box-shadow] focus-visible:ring-2 focus-visible:ring-accent ${GALLERY_GRID_SPANS[i] ?? ""} group`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popup galeri + zoom */}
      {galleryOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Galeri foto Wolio Hills"
          onClick={backdropClick}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-accent/30 bg-primary shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
              <h3 className="font-display text-lg font-bold text-white md:text-xl">
                {viewerIndex === null ? "Koleksi foto" : "Detail foto"}
              </h3>
              <div className="flex items-center gap-2">
                {viewerIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      setViewerIndex(null);
                      setMagnified(false);
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/85 transition hover:bg-white/10"
                  >
                    Kembali
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
                  aria-label="Tutup galeri"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(92vh-3.5rem)] overflow-y-auto overscroll-contain p-4 md:p-5">
              {viewerIndex === null ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:gap-4">
                  {uniqueGallery.map((item, i) => (
                    <button
                      key={item.src}
                      type="button"
                      onClick={() => {
                        setViewerIndex(i);
                        setMagnified(false);
                      }}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 outline-none ring-accent transition hover:border-accent/60 focus-visible:ring-2"
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMagnified((z) => !z)}
                      className="rounded-full border border-accent/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-primary"
                    >
                      {magnified ? "Perkecil tampilan" : "Perbesar (zoom)"}
                    </button>
                    <p className="w-full text-center text-[11px] text-white/50 md:w-auto md:text-left">
                      Klik gambar untuk zoom cepat, atau gunakan tombol di atas.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMagnified((z) => !z)}
                    className={`relative max-h-[min(72vh,640px)] w-full overflow-auto rounded-xl border border-white/10 bg-black/30 p-1 ${magnified ? "cursor-zoom-out" : "cursor-zoom-in"}`}
                    aria-label={magnified ? "Perkecil gambar" : "Perbesar gambar"}
                  >
                    <img
                      src={uniqueGallery[viewerIndex]?.src}
                      alt={uniqueGallery[viewerIndex]?.alt ?? ""}
                      className={`mx-auto max-w-full object-contain transition-transform duration-300 ease-out will-change-transform ${magnified ? "scale-[1.35]" : "scale-100"}`}
                      style={{ transformOrigin: "center center" }}
                      loading="eager"
                      decoding="async"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* 6. Lokasi — peta hanya ≥1024px (lg) */}
      <section className="w-full bg-surface">
        <div className="flex flex-col lg:flex-row lg:min-h-[600px]">
          <div className="relative hidden min-h-0 overflow-hidden lg:block lg:w-1/2 lg:min-h-[600px]">
            <iframe
              title="Lokasi Wolio Hills Malino"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.116640019884!2d119.90284757570312!3d-5.244363294733539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbe9735ae4c684d%3A0x61b95ea46096be7e!2sWolio%20Hills%20Malino!5e0!3m2!1sid!2sid!4v1778495026013!5m2!1sid!2sid"
              width="100%"
              height="100%"
              className="absolute inset-0 min-h-full grayscale-[30%] contrast-[1.05]"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="w-full py-12 px-6 md:px-12 lg:w-1/2 lg:py-20 lg:px-16 flex flex-col justify-center">
            <SectionLabel>Lokasi</SectionLabel>
            <h2 className="font-display font-black text-primary text-3xl md:text-4xl mb-6 leading-tight">
              Malino, Surga Tersembunyi <br />
              <span className="italic text-gradient">Sulawesi Selatan</span>
            </h2>
            <p className="text-text-light text-sm md:text-base leading-relaxed mb-10 max-w-md">
              Terletak di dataran tinggi pegunungan Bawakaraeng, Malino menawarkan kesejukan di tengah iklim tropis —
              dikelilingi hutan pinus, air terjun, dan panorama yang menenangkan.
            </p>
            <div className="space-y-6">
              {[
                { Icon: Trees, k: "Lingkungan", v: "Pegunungan" },
                { Icon: Mountain, k: "Ketinggian", v: "1.200 Meter dpl" },
                { Icon: Cloud, k: "Iklim mikro", v: "17°C - 23°C" },
              ].map(({ Icon, k, v }) => (
                <div key={k} className="flex items-center gap-5 border-b border-accent/10 pb-6 last:border-0 last:pb-0">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl border border-accent/30 text-accent bg-white">
                    <Icon className="w-5 h-5" aria-hidden />
                  </div>
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-light">{k}</span>
                    <span className="font-display font-bold text-primary text-lg md:text-xl">{v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
