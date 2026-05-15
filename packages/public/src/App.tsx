import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { BOOKING_DRAFT_KEY, clearFullPaymentSession, clearPaymentOrderState } from "./lib/sessionKeys";
import { AnimatePresence, m } from "motion/react";
import Navbar from "./components/Navbar";
const Footer = lazy(() => import("./components/Footer"));
const FloatingButtons = lazy(() => import("./components/FloatingButtons"));
import HomePage from "./pages/HomePage";

const AboutPage = lazy(() => import("./pages/AboutPage"));
const BookingFormPage = lazy(() => import("./pages/BookingFormPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailurePage = lazy(() => import("./pages/PaymentFailurePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));

export type PageName =
  | "home"
  | "about"
  | "book"
  | "payment"
  | "payment-success"
  | "payment-failed"
  | "contact";

export interface BookingData {
  propertyId: number | null;
  propertyName: string;
  propertyPrice: number;
  propertyImage: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  specialRequests: string;
}

const emptyBooking: BookingData = {
  propertyId: null,
  propertyName: "",
  propertyPrice: 0,
  propertyImage: "",
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  checkIn: "",
  checkOut: "",
  guests: 1,
  rooms: 1,
  specialRequests: "",
};

const VALID_PAGES: PageName[] = [
  "home",
  "about",
  "book",
  "payment",
  "payment-success",
  "payment-failed",
  "contact",
];

function initialPageFromHash(): PageName {
  if (typeof window === "undefined") return "home";
  const h = window.location.hash.replace("#", "") as PageName;
  return VALID_PAGES.includes(h) ? h : "home";
}

/** Hindari satu frame "payment" + booking kosong (Vercel / refresh) sebelum baca draft. */
function initialBookingFromStorage(): BookingData {
  if (typeof window === "undefined") return emptyBooking;
  const h = window.location.hash.replace("#", "");
  const payFlow = h === "payment" || h === "payment-failed" || h === "payment-success";
  if (!payFlow) return emptyBooking;
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return emptyBooking;
    const parsed = JSON.parse(raw) as Partial<BookingData>;
    return { ...emptyBooking, ...parsed };
  } catch {
    return emptyBooking;
  }
}

function PageLoadFallback() {
  return <div className="min-h-[40vh] w-full bg-surface" aria-hidden />;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageName>(initialPageFromHash);
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingFromStorage);

  const restoreBookingDraft = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<BookingData>;
      setBookingData((prev) => ({ ...emptyBooking, ...prev, ...parsed }));
    } catch {
      /* ignore */
    }
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  const navigate = useCallback((page: PageName) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
    window.history.replaceState(null, "", `#${page}`);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as PageName;
    const validPages = VALID_PAGES;
    if (validPages.includes(hash)) {
      setCurrentPage(hash);
    }
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, []);

  useEffect(() => {
    if (currentPage !== "payment" && currentPage !== "payment-failed") return;
    if (bookingData.checkIn && bookingData.checkOut) return;
    restoreBookingDraft();
  }, [currentPage, bookingData.checkIn, bookingData.checkOut, restoreBookingDraft]);

  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace("#", "") as PageName;
      if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const startBooking = useCallback(
    (propertyId?: number, propertyName?: string, price?: number, image?: string) => {
      clearFullPaymentSession();
      setBookingData({
        ...emptyBooking,
        propertyId: propertyId || null,
        propertyName: propertyName || "",
        propertyPrice: price || 0,
        propertyImage: image || "",
      });
      navigate("book");
    },
    [navigate]
  );

  const proceedToPayment = useCallback(
    (data: BookingData) => {
      clearPaymentOrderState();
      sessionStorage.setItem("wolio_pay_session", String(Date.now()));
      try {
        sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
      setBookingData(data);
      navigate("payment");
    },
    [navigate]
  );

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage navigate={navigate} startBooking={startBooking} />;
      case "about":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <AboutPage />
          </Suspense>
        );
      case "book":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <BookingFormPage
              bookingData={bookingData}
              setBookingData={setBookingData}
              proceedToPayment={proceedToPayment}
              navigate={navigate}
            />
          </Suspense>
        );
      case "payment":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <PaymentPage bookingData={bookingData} navigate={navigate} />
          </Suspense>
        );
      case "payment-success":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <PaymentSuccessPage navigate={navigate} />
          </Suspense>
        );
      case "payment-failed":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <PaymentFailurePage navigate={navigate} />
          </Suspense>
        );
      case "contact":
        return (
          <Suspense fallback={<PageLoadFallback />}>
            <ContactPage navigate={navigate} />
          </Suspense>
        );
      default:
        return <HomePage navigate={navigate} startBooking={startBooking} />;
    }
  };

  return (
    <div className="min-h-screen relative">
      <Navbar currentPage={currentPage} navigate={navigate} />
      <Suspense fallback={null}>
        <FloatingButtons />
      </Suspense>

      <AnimatePresence mode="wait">
        <m.div
          key={currentPage}
          className="min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {renderPage()}
        </m.div>
      </AnimatePresence>

      <Suspense fallback={null}>
        <Footer navigate={navigate} />
      </Suspense>
    </div>
  );
}
