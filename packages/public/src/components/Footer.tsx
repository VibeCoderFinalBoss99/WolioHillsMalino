import { m } from "motion/react";
import { MapPin, Phone, Mail, Camera, Globe, Send } from "lucide-react";
import type { PageName } from "../App";

interface FooterProps {
  navigate: (page: PageName) => void;
}

export default function Footer({ navigate }: FooterProps) {
  return (
    <footer className="bg-primary-dark text-white pt-20 pb-8 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[150px] -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.webp"
                alt="Wolio Hills Logo"
                className="w-12 h-12 shrink-0 object-contain rounded-xl shadow-lg"
              />
              <div>
                <h3 className="font-display font-bold text-xl text-white">Wolio Hills</h3>
                <p className="text-[9px] font-bold text-white tracking-[0.3em] uppercase">Malino</p>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Jelajahi Wolio Hills di Malino. Pengalaman menginap sempurna hanya dengan sekali klik.
            </p>
            <div className="flex gap-3">
              {[Camera, Globe, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent/30 flex items-center justify-center transition-all duration-300 group"
                >
                  <Icon className="w-4 h-4 text-white/50 group-hover:text-accent transition-colors" />
                </a>
              ))}
            </div>
          </m.div>

          {/* Quick Links */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent" /> Tautan Cepat
            </h4>
            <ul className="space-y-3">
              {[
                { page: "home" as PageName, label: "Beranda" },
                { page: "about" as PageName, label: "Tentang" },
                { page: "contact" as PageName, label: "Kontak" }
              ].map(({ page, label }) => (
                <li key={page}>
                  <button
                    onClick={() => navigate(page)}
                    className="text-white/50 hover:text-accent text-sm capitalize tracking-wide transition-colors cursor-pointer"
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate("book")}
                  className="text-white/50 hover:text-accent text-sm capitalize tracking-wide transition-colors cursor-pointer"
                >
                  Pesan Sekarang
                </button>
              </li>
            </ul>
          </m.div>

          {/* Social Media */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent" /> Social Media
            </h4>
            <ul className="space-y-3 text-white/50 text-sm">
              {[
                { name: "TikTok", link: "https://www.tiktok.com/@woliohills", target: "_blank", rel: "noopener noreferrer" },
                { name: "Instagram", link: "https://www.instagram.com/woliohillsmalino/", target: "_blank", rel: "noopener noreferrer" }
              ].map((social) => (
                <li key={social.name} className="hover:text-accent transition-colors cursor-default">
                  <a href={social.link}
                    target={social.target}
                    rel="noopener noreferrer">
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </m.div>

          {/* Contact Info */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-accent" /> Kontak
            </h4>
            <div className="space-y-4 mb-6">
              {[
                { icon: MapPin, text: "Malino, Kecamatan Tinggi Moncong, Kabupaten Gowa, Sulawesi Selatan. " },
                { icon: Phone, text: "081244583677" },
                { icon: Mail, text: "halo@woliohills.com" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {/* Google Maps */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.116640019884!2d119.90284757570312!3d-5.244363294733539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dbe9735ae4c684d%3A0x61b95ea46096be7e!2sWolio%20Hills%20Malino!5e0!3m2!1sid!2sid!4v1778495026013!5m2!1sid!2sid"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </m.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex items-center justify-center">
          <span className="text-white/50 text-sm">© 2026 Wolio Hills Malino. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
