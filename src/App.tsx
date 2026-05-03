import { useEffect } from "react";
// ADMIN DESHABILITADO TEMPORAL (sprint 0 pre-Astro). Reconstruir en server-side post-migración.
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// ADMIN DESHABILITADO TEMPORAL (sprint 0 pre-Astro). Reconstruir en server-side post-migración.
// import Login from "./pages/admin/Login.tsx";
// import AdminLayout from "./components/admin/AdminLayout.tsx";
// import ProtectedRoute from "./components/admin/ProtectedRoute.tsx";
// import Overview from "./pages/admin/Overview.tsx";
// import Instagram from "./pages/admin/Instagram.tsx";
// import LinkedIn from "./pages/admin/LinkedIn.tsx";
// import YouTube from "./pages/admin/YouTube.tsx";
// import Oportunidades from "./pages/admin/Oportunidades.tsx";
// import Ventas from "./pages/admin/Ventas.tsx";
// import Sesiones from "./pages/admin/Sesiones.tsx";
// import BlogEditor from "./pages/admin/BlogEditor.tsx";

// const queryClient = new QueryClient();

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

        {/* ── ADMIN DESHABILITADO TEMPORAL (sprint 0 pre-Astro) ───────────
            Reconstruir en server-side post-migración a Astro.
            Código fuente intacto en src/pages/admin/ y src/components/admin/.
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="instagram" element={<Instagram />} />
          <Route path="linkedin" element={<LinkedIn />} />
          <Route path="youtube" element={<YouTube />} />
          <Route path="oportunidades" element={<Oportunidades />} />
          <Route path="ventas" element={<Ventas />} />
          <Route path="sesiones" element={<Sesiones />} />
          <Route path="blog" element={<BlogEditor />} />
        </Route>
        ─────────────────────────────────────────────────────────────── */}

        {/* ── Catch-all ─────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
