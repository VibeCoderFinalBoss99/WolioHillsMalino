import React from "react";
import { m } from "motion/react";
import { Star, Shield, Clock, Headphones, Bed, Users, MapPin, ArrowRight, Quote } from "lucide-react";
import { TESTIMONIALS } from "../data/properties";
import { use3DTilt } from "../hooks/use3DTilt";
import type { PageName } from "../App";

interface HomePageProps {
  navigate: (page: PageName) => void;
  startBooking: (id?: number, name?: string, price?: number, image?: string) => void;
}



function FeatureCard({ icon: Icon, title, desc, delay }: { icon: React.ElementType; title: string; desc: string; delay: number }) {
  const { rotateX, rotateY, glareBackground, handleMouseMove, handleMouseLeave, setIsHovering } = use3DTilt();
  return (
    <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.6 }} viewport={{ once: true }} style={{ perspective: 1000 }}>
      <m.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseEnter={() => setIsHovering(true)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        className="bg-white p-8 rounded-3xl shadow-deep gold-border text-center group relative overflow-hidden h-full cursor-default"
      >
        <div style={{ transform: "translateZ(30px)" }} className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-5 flex items-center justify-center shadow-lg group-hover:bg-accent transition-colors duration-300">
          <Icon className="w-7 h-7 text-accent group-hover:text-white transition-colors duration-300" />
        </div>
        <h4 style={{ transform: "translateZ(20px)" }} className="font-display font-bold text-primary text-lg mb-3">{title}</h4>
        <p style={{ transform: "translateZ(10px)" }} className="text-text-light text-sm leading-relaxed">{desc}</p>
        <m.div style={{ background: glareBackground, zIndex: 0, pointerEvents: "none" }} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      </m.div>
    </m.div>
  );
}

import { OptimizedVideo } from "../components/OptimizedVideo";

export default function HomePage({ navigate, startBooking }: HomePageProps) {
  const videos = [
    { id: 1, src: '/videos/optimized/room-2-tour.mp4', poster: '/videos/posters/video3-poster.jpg', title: 'Ruangan Nyaman', desc: 'Kamar tidur elegan dengan desain modern dan fasilitas premium untuk kenyamanan maksimal selama menginap.' },
    { id: 2, src: '/videos/optimized/room-main-tour.mp4', poster: '/videos/posters/video4-poster.jpg', title: 'Master Suite', desc: 'Suite utama mewah dengan pemandangan pegunungan yang memukau dan interior yang sangat eksklusif.' },
    { id: 3, src: '/videos/optimized/room-tour-1.mp4', poster: '/videos/posters/video1-poster.jpg', title: 'Mountain View', desc: 'Pemandangan pegunungan yang hijau dan memukau dari villa, suasana segar dan menenangkan.' },
    { id: 4, src: '/videos/optimized/room-tour-2.mp4', poster: '/videos/posters/video2-poster.jpg', title: 'Tropical Garden', desc: 'Perkebunan tropis yang asri dan hijau, nuansa alami yang menyegarkan di tengah Malino.' },
    { id: 5, src: '/videos/optimized/overview-optimized.mp4', poster: '/videos/posters/overview-poster.jpg', title: 'Villa Panorama', desc: 'Panorama lengkap villa dengan latar pegunungan dan perkebunan yang indah, pemandangan eksklusif Wolio Hills.' }
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Full-size background image — slight bleed menghindari garis sub-pixel di tepi atas */}
        <div className="absolute -inset-px min-h-[calc(100%+2px)] min-w-[calc(100%+2px)]">
          <img
            src="/images/hero-section.webp"
            alt="Wolio Hills Malino"
            className="h-full w-full max-w-none object-cover object-center"
            width={1920}
            height={1080}
            decoding="sync"
            fetchPriority="high"
            style={{ minHeight: "100vh", minWidth: "100%", objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
        <div aria-hidden className="pointer-events-none absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-primary-light/30 blur-[150px]" />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 pt-32 pb-20">
          <m.h1
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display font-black text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6 tracking-tight"
            style={{ textShadow: '0 10px 40px rgba(45,67,36,0.3)' }}
          >
            Wolio Hills<br /><span className="text-gradient">Malino</span>
          </m.h1>
          <m.p
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ textShadow: '0 5px 20px rgba(0,0,0,0.2)' }}
          >
            Wolio Hills Malino - Pengalaman menginap premium di tengah keindahan alam Malino yang memukau. Tempat perfect buat staycation, healing, dan quality time bareng orang tersayang!
          </m.p>
          <m.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <m.button
              whileHover={{ scale: 1.05, y: -2, boxShadow: '0 25px 60px rgba(201,168,76,0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startBooking()}
              className="bg-accent hover:bg-accent-light text-primary font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-full shadow-lg flex items-center gap-3 transition-all duration-300 cursor-pointer"
              style={{ backdropFilter: 'blur(10px)' }}
            >
              Booking Sekarang <ArrowRight className="w-4 h-4" />
            </m.button>
          </m.div>
        </div>

        <div className="absolute -bottom-10 left-0 w-full"><svg viewBox="0 0 1440 60" fill="none" className="w-full h-15"><path d="M0,40 C360,60 1080,20 1440,40 L1440,60 L0,60 Z" fill="var(--color-surface)" /></svg></div>
      </section>

      {/* STATS SECTION */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-primary/5 relative overflow-hidden">
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5"
        />
        <m.div
          className="max-w-6xl mx-auto relative z-10"
        >
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Kenapa Wolio Hills?</span>
            <h2 className="font-display font-black text-primary text-4xl md:text-5xl mt-3">Pengalaman <span className="text-gradient">Premium</span></h2>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl border border-white/30"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <m.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 group-hover:text-accent transition-colors duration-300">999+</div>
                <p className="text-primary/80 text-sm font-medium group-hover:text-primary transition-colors duration-300">Pengalaman Tak Terlupakan</p>
              </m.div>
              <m.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 group-hover:text-accent transition-colors duration-300">100%</div>
                <p className="text-primary/80 text-sm font-medium group-hover:text-primary transition-colors duration-300">Kepuasan Tamu</p>
              </m.div>
              <m.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 group-hover:text-accent transition-colors duration-300">24/7</div>
                <p className="text-primary/80 text-sm font-medium group-hover:text-primary transition-colors duration-300">Support Tersedia</p>
              </m.div>
            </div>
          </m.div>
        </m.div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 max-w-7xl mx-auto relative">
        <m.div
          className="max-w-7xl mx-auto relative z-10"
        >
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Mengapa Memilih Kami</span>
            <h2 className="font-display font-black text-primary text-4xl md:text-5xl mt-3">Pengalaman <span className="text-gradient">Wolio Hills</span></h2>
          </m.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={Shield} title="Mutu Terjamin" desc="Kualitas bukan sekadar kata. Di Wolio Hills, setiap sudut telah melalui seleksi ketat sebelum Anda tiba." delay={0} />
            <FeatureCard icon={Clock} title="Pesan Instan" desc="Pesan menginap sempurna kamu dalam hitungan detik dengan sistem yang Wolio Hills rancang." delay={0.1} />
            <FeatureCard icon={Headphones} title="Support 24/7" desc="Kami selalu siap membantu kapan saja kamu butuhkan — siang, malam, bahkan di tengah perjalananmu sekalipun." delay={0.2} />
            <FeatureCard icon={Star} title="Harga Terbaik" desc="Wolio Hills jamin harga terbaik. Dengan Kualitas dan Pengalaman yang tentunya sesuai." delay={0.3} />
          </div>
        </m.div>
      </section>

      {/* VIDEO SHOWCASE */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[150px]" />
        <div aria-hidden className="pointer-events-none absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />

        <m.div
          className="max-w-7xl mx-auto relative z-10"
        >
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Video Experience</span>
            <h2 className="font-display font-black text-primary text-4xl md:text-5xl mt-3">Eksplorasi <span className="text-gradient">Wolio Hills</span></h2>
            <p className="text-text-light text-lg mt-4 max-w-2xl mx-auto">Lihat langsung keindahan dan fasilitas Wolio Hills Malino melalui video-video eksklusif kami.</p>
          </m.div>

          {/*
            Video grid: <lg = 2 kolom (baris akhir kartu ke-5 col-span-2, isi dibatasi max-width agar tidak besar).
            lg+ = 5 kolom sejajar — jarak antar kartu hanya gap grid (kecil), tanpa kartu penuh lebar layar.
          */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-3 xl:gap-4 auto-rows-auto">
            {videos.map((video, index) => {
              const isLastVideo = index === videos.length - 1;
              return (
                <m.div
                  key={video.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                  }}
                  className={`group cursor-pointer min-w-0 ${isLastVideo ? "col-span-2 lg:col-span-1" : ""}`}
                >
                  <div
                    className={`relative overflow-hidden shadow-lg bg-white rounded-xl md:rounded-2xl hover:shadow-xl transition-all duration-300 h-full ${
                      isLastVideo ? "max-lg:max-w-[min(100%,17.5rem)] max-lg:mx-auto" : ""
                    }`}
                  >
                    {/* Video Container */}
                    <div className="relative aspect-[9/16] w-full">
                      <OptimizedVideo
                        src={video.src}
                        posterSrc={video.poster}
                        className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-105"
                        autoPlay
                      />

                      {/* Gradient Overlay */}
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      />

                      {/* Shimmer Effect */}
                      <m.div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 -skew-x-12"
                        whileHover={{
                          opacity: [0, 0.8, 0],
                          x: ["-100%", "100%"]
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Content */}
                    <m.div
                      className="p-4 md:p-5"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.15 + 0.2 }}
                    >
                      <m.h3
                        className="font-display font-bold text-primary text-sm md:text-lg mb-2 group-hover:text-accent transition-all duration-300"
                        whileHover={{ x: 2 }}
                      >
                        {video.title}
                      </m.h3>
                      <m.p
                        className="text-text-light text-xs md:text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                      >
                        {video.desc}
                      </m.p>
                    </m.div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </m.div>
      </section>

      {/* VILLA SHOWCASE */}
      <section className="py-20 px-6 bg-primary-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute top-1/2 right-1/4 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[150px]" />
        <m.div
          className="max-w-7xl mx-auto relative z-10"
        >
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Destinasi Eksklusif</span>
            <h2 className="font-display font-black text-white text-4xl md:text-5xl mt-3">Wolio Hills <span className="text-gradient">Malino</span></h2>
            <p className="text-white/60 text-lg mt-4 max-w-2xl mx-auto">Destinasi premium di Malino dengan pemandangan alam yang memukau, fasilitas lengkap, dan privasi maksimal. Sempurna untuk liburan keluarga, gathering bareng teman, atau staycation yang menyegarkan pikiran.</p>
          </m.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <m.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img src="/images/picture-2.webp" alt="Wolio Hills Malino" className="w-full h-[400px] object-cover" loading="lazy" />
              </div>
              <div
                className="absolute -bottom-6 -right-6 bg-accent text-primary p-4 rounded-2xl shadow-xl"
                style={{ boxShadow: '0 20px 40px rgba(201,168,76,0.3)' }}
              >
                <div className="text-2xl font-bold">⭐ 4.9</div>
                <p className="text-xs font-semibold">Perfect Rating</p>
              </div>
            </m.div>

            <m.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-white mb-3">Akomodasi Premium</h3>
                <p className="text-white/70 leading-relaxed">Akomodasi eksklusif dengan desain modern, fasilitas lengkap, dan pemandangan alam yang memukau. Perfect buat liburan keluarga, gathering bareng teman, atau staycation yang menyegarkan pikiran.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <m.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <Bed className="w-5 h-5 text-accent mb-2" />
                  <h4 className="text-white font-semibold text-sm mb-1">Kamar Tidur</h4>
                  <p className="text-white/60 text-xs">Kapasitas hingga 15 orang</p>
                </m.div>
                <m.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <Users className="w-5 h-5 text-accent mb-2" />
                  <h4 className="text-white font-semibold text-sm mb-1">View Eksklusif</h4>
                  <p className="text-white/60 text-xs">Pemandangan alam memukau</p>
                </m.div>
                <m.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <MapPin className="w-5 h-5 text-accent mb-2" />
                  <h4 className="text-white font-semibold text-sm mb-1">Lokasi Strategis</h4>
                  <p className="text-white/60 text-xs">Malino, Sulawesi Selatan</p>
                </m.div>
                <m.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                >
                  <Shield className="w-5 h-5 text-accent mb-2" />
                  <h4 className="text-white font-semibold text-sm mb-1">Full Privacy</h4>
                  <p className="text-white/60 text-xs">Tidak ada gangguan</p>
                </m.div>
              </div>

              <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("about")}
                className="w-full bg-accent hover:bg-accent-light text-primary font-bold text-sm tracking-wider uppercase px-8 py-4 rounded-full shadow-lg cursor-pointer transition-colors"
                style={{ boxShadow: '0 20px 40px rgba(201,168,76,0.3)' }}
              >
                Info Lebih Lanjut
              </m.button>
            </m.div>
          </div>
        </m.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <m.div
          className="relative z-10"
        >
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Proses Mudah</span>
            <h2 className="font-display font-black text-primary text-4xl md:text-5xl mt-3">Cara <span className="text-gradient">Pesan</span></h2>
            <p className="text-text-light text-lg mt-4 max-w-2xl mx-auto">Klik Booking Sekarang, Isi data diri dan nikmati.</p>
          </m.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ step: "01", title: "Booking", desc: "Klik tombol booking sekarang untuk memulai." }, { step: "02", title: "Isi Data", desc: "Lengkapi data diri dengan benar." }, { step: "03", title: "Nikmati", desc: "Siap untuk menikmati pengalaman menginap." }].map((item, i) => (
              <m.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }} className="text-center relative">
                <m.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-20 h-20 rounded-2xl bg-primary mx-auto mb-6 flex items-center justify-center shadow-deep relative z-10">
                  <span className="font-display font-bold text-accent text-xl">{item.step}</span>
                </m.div>
                <h4 className="font-display font-bold text-primary text-xl mb-2">{item.title}</h4>
                <p className="text-text-light text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </m.div>
            ))}
          </div>
        </m.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-6 bg-surface-dark">
        <div className="max-w-7xl mx-auto">
          <m.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Testimoni</span>
            <h2 className="font-display font-black text-primary text-4xl md:text-5xl mt-3">Apa Kata <span className="text-gradient">Tamu Kami</span></h2>
          </m.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <m.div key={t.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-white p-8 rounded-3xl shadow-deep gold-border relative">
                <Quote className="w-8 h-8 text-accent/20 absolute top-6 right-6" />
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-accent font-bold text-sm">{t.avatar}</div>
                  <div><h5 className="font-display font-bold text-primary text-sm">{t.name}</h5><p className="text-text-light text-xs">{t.role}</p></div>
                  <div className="ml-auto flex gap-0.5">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-accent fill-accent" />)}</div>
                </div>
                <p className="text-text-light text-sm leading-relaxed italic">"{t.text}"</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 hero-gradient relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[150px]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <m.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display font-black text-white text-4xl md:text-6xl mb-6">Siap Merasakan <span className="text-gradient">Kemewahan?</span></m.h2>
          <m.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/50 text-lg mb-10 max-w-lg mx-auto">Mulai perjalanan Anda hari ini dan temukan mengapa ribuan orang memilih Wolio Hills.</m.p>
          <m.button initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }} onClick={() => startBooking()} className="bg-accent hover:bg-accent-light text-primary font-bold text-sm tracking-wider uppercase px-12 py-5 rounded-full shadow-[0_20px_50px_rgba(201,168,76,0.35)] cursor-pointer transition-colors border-animation">Mulai Pesan Sekarang</m.button>
        </div>
      </section>
    </>
  );
}
