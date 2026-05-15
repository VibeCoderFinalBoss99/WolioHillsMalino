import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "motion/react";
import { Home, Info, Phone, Menu, X } from "lucide-react";
import type { PageName } from "../App";

interface NavbarProps {
  currentPage: PageName;
  navigate: (page: PageName) => void;
}

const navLinks: { name: string; page: PageName; icon: React.ElementType }[] = [
  { name: "BERANDA", page: "home", icon: Home },
  { name: "TENTANG", page: "about", icon: Info },
  { name: "KONTAK", page: "contact", icon: Phone },
];

export default function Navbar({ currentPage, navigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Setelah ganti halaman: samakan dengan Beranda (scroll di atas = navbar transparan, tidak “nyangkut” state scroll). */
  useEffect(() => {
    setIsScrolled(window.scrollY > 50);
    setIsMobileOpen(false);
    document.body.style.overflow = "unset";
  }, [currentPage]);

  /** Layar sempit / tablet: ikut visual viewport agar posisi & lebar navbar sama seperti di Beranda. */
  useEffect(() => {
    const vv = window.visualViewport;
    const mq = window.matchMedia("(max-width: 1023px)");
    if (!vv) return;

    const apply = () => {
      if (!mq.matches) {
        document.documentElement.style.setProperty("--navbar-vv-y", "0px");
        return;
      }
      const top = window.visualViewport?.offsetTop ?? 0;
      document.documentElement.style.setProperty("--navbar-vv-y", `${Math.max(0, top)}px`);
    };

    apply();
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", apply);
    } else {
      mq.addListener(apply);
    }
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      if (typeof mq.removeEventListener === "function") {
        mq.removeEventListener("change", apply);
      } else {
        mq.removeListener(apply);
      }
      document.documentElement.style.removeProperty("--navbar-vv-y");
    };
  }, []);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileOpen]);

  return (
    <>
      {/* Shell: top-0 + padding aman + translateY(var) = jarak atas stabil di mobile saat chrome browser muncul/hilang */}
      <div
        className="fixed inset-x-0 top-0 z-[120] flex justify-center px-3 sm:px-4 pt-[max(10px,calc(env(safe-area-inset-top,0px)+8px))] md:pt-4 pointer-events-none"
        style={{ transform: "translateY(var(--navbar-vv-y, 0px))" }}
      >
        <nav
          className={`pointer-events-auto w-full max-w-7xl transition-all duration-500 ${
            isScrolled
              ? "py-3 px-4 sm:px-6 bg-primary-dark/90 backdrop-blur-2xl border border-accent/15 shadow-[0_20px_50px_rgba(10,25,41,0.5)] rounded-full"
              : "py-3.5 px-5 sm:py-4 sm:px-8 bg-transparent rounded-none md:rounded-none"
          }`}
        >
        <div className="flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-3">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex min-w-0 items-center gap-3 cursor-pointer group md:justify-self-start"
            onClick={() => { navigate("home"); setIsMobileOpen(false); }}
          >
            <img 
              src="/images/logo.webp" 
              alt="Wolio Hills Logo" 
              className="w-10 h-10 shrink-0 object-contain rounded-xl group-hover:scale-110 transition-transform duration-300"
            />
            <div className="hidden sm:flex flex-col">
              <span className="font-display font-bold text-white text-lg leading-none tracking-wide">Wolio Hills</span>
              <span className="text-[9px] font-bold text-white tracking-[0.3em] uppercase">Malino</span>
            </div>
          </m.div>

          <div className="hidden md:flex md:justify-self-center items-center gap-1">
            {navLinks.map((link) => (
              <m.button
                key={link.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(link.page)}
                className={`relative px-5 py-2 rounded-full font-semibold text-[11px] tracking-[0.2em] transition-all duration-300 cursor-pointer ${
                  currentPage === link.page
                    ? "text-primary bg-accent shadow-lg"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.name}
              </m.button>
            ))}
          </div>

          <div className="flex min-w-0 items-center justify-end gap-3 md:justify-self-end">
            <m.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("book")}
              className="hidden md:flex items-center gap-2 bg-accent hover:bg-accent-light text-primary font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-full shadow-lg shadow-accent/25 transition-colors duration-300 cursor-pointer border-animation"
            >
              Booking Sekarang
            </m.button>

            <button
              type="button"
              className="md:hidden text-white p-2 cursor-pointer z-[200]"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        </nav>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <m.div
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-[110] hero-gradient flex flex-col items-center justify-center pt-[max(2rem,env(safe-area-inset-top))] pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex flex-col gap-8 items-center">
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 flex items-center justify-center shadow-2xl mb-6"
              >
                <img 
                  src="/images/logo.webp" 
                  alt="Wolio Hills Logo" 
                  className="w-full h-full object-contain rounded-xl"
                />
              </m.div>

              {navLinks.map((link, i) => (
                <m.button
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  onClick={() => { navigate(link.page); setIsMobileOpen(false); }}
                  className={`font-display font-bold text-3xl tracking-widest flex items-center gap-4 transition-colors cursor-pointer ${
                    currentPage === link.page ? "text-accent" : "text-white/80 hover:text-white"
                  }`}
                >
                  <link.icon className="w-7 h-7 opacity-50" />
                  {link.name}
                </m.button>
              ))}

              <m.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { navigate("book"); setIsMobileOpen(false); }}
                className="mt-6 bg-accent text-primary font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-full shadow-xl shadow-accent/30 cursor-pointer"
              >
                Booking Sekarang
              </m.button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
