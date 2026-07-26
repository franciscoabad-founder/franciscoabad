import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// Public pages
import Index from "./pages/Index.tsx";
import SobreMi from "./pages/SobreMi.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Contacto from "./pages/Contacto.tsx";
import TrabajaConmigo from "./pages/TrabajaConmigo.tsx";
import GrowthLab from "./pages/GrowthLab.tsx";
import NotFound from "./pages/NotFound.tsx";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public routes ─────────────────────────────── */}
        <Route path="/" element={<Index />} />
        <Route path="/sobre-mi" element={<SobreMi />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/trabaja-conmigo" element={<TrabajaConmigo />} />
        <Route path="/growth-lab" element={<GrowthLab />} />

        {/* ── Catch-all ─────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
