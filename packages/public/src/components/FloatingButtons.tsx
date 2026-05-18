import { m } from "motion/react";
import { MessageCircle, ArrowUp } from "lucide-react";

export default function FloatingButtons() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col items-end gap-3">
      <m.button
        onClick={scrollToTop}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-primary text-white p-3.5 rounded-full shadow-[0_10px_30px_rgba(15,45,82,0.4)] cursor-pointer group"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
      </m.button>

      <m.a
        href="https://wa.me/6281234567890"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_15px_40px_rgba(37,211,102,0.35)] flex items-center justify-center group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white/20" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 font-semibold text-xs uppercase tracking-widest whitespace-nowrap">
          Chat Us
        </span>
      </m.a>
    </div>
  );
}
