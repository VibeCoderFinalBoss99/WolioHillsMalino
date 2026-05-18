import React from "react";
import { m } from "motion/react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { use3DTilt } from "../hooks/use3DTilt";
import type { PageName } from "../App";

interface Props { navigate: (page: PageName) => void; }

function ContactCard({ icon: Icon, title, value, delay }: { icon: React.ElementType; title: string; value: string; delay: number }) {
  const { rotateX, rotateY, glareBackground, handleMouseMove, handleMouseLeave, setIsHovering } = use3DTilt();
  return (
    <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay }} viewport={{ once: true }} style={{ perspective: 1000 }}>
      <m.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseEnter={() => setIsHovering(true)} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        className="bg-white p-6 rounded-2xl shadow-deep gold-border text-center group relative overflow-hidden h-full cursor-default"
      >
        <div style={{ transform: "translateZ(20px)" }} className="w-12 h-12 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center group-hover:bg-accent transition-colors duration-300">
          <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors duration-300" />
        </div>
        <h4 style={{ transform: "translateZ(15px)" }} className="font-display font-bold text-primary text-sm mb-1">{title}</h4>
        <p style={{ transform: "translateZ(10px)" }} className="text-text-light text-xs leading-relaxed">{value}</p>
        <m.div style={{ background: glareBackground, zIndex: 0, pointerEvents: "none" }} className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </m.div>
    </m.div>
  );
}

export default function ContactPage({}: Props) {


  return (
    <div className="min-w-0 overflow-x-clip">
      <section className="relative pt-40 pb-24 px-6 hero-gradient overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <m.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent font-semibold text-xs uppercase tracking-[0.3em]">Hubungi Kami</m.span>
          <m.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-display font-black text-white text-5xl md:text-7xl leading-[0.9] mt-3 mb-6">Kontak <span className="text-gradient">Kami</span></m.h1>
          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-white/60 text-lg max-w-2xl mx-auto">Ada pertanyaan atau butuh bantuan? Tim kami siap membantu kamu 24/7.</m.p>
        </div>
        <div className="absolute bottom-0 left-0 w-full"><svg viewBox="0 0 1440 120" fill="none" className="w-full"><path d="M0,80 C360,120 1080,40 1440,80 L1440,120 L0,120 Z" fill="var(--color-surface)" /></svg></div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ContactCard icon={MapPin} title="Alamat" value="Malino, Kecamatan Tinggi Moncong, Kabupaten Gowa, Sulawesi Selatan." delay={0} />
          <ContactCard icon={Phone} title="Telepon" value="081244583677" delay={0.1} />
          <ContactCard icon={Mail} title="Email" value="hello@woliohills.com" delay={0.2} />
          <ContactCard icon={Clock} title="Jam Operasional" value="Support 24/7 Tersedia" delay={0.3} />
        </div>
      </section>

      {/* Map */}
      <section className="py-12 px-6 max-w-6xl mx-auto">
        <div className="w-full">
          <m.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
            <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-deep gold-border relative">
              <iframe
                title="Wolio Hills Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.116640019884!2d119.90284757570312!3d-5.244363294733539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbe9735ae4c684d%3A0x61b95ea46096be7e!2sWolio%20Hills%20Malino!5e0!3m2!1sid!2sid!4v1778495026013!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </m.div>
        </div>
      </section>
    </div>
  );
}