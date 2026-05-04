import { useEffect, useState } from "react";

/**
 * Comportamiento cliente del Navbar:
 *  - aplica clase `is-scrolled` al <nav> después de scrollear 40px
 *  - controla el menú mobile con clases en el body
 *
 * Toda la estructura visual vive en Navbar.astro. Este island se monta
 * una sola vez con client:load para enganchar listeners.
 */
export default function NavbarIsland() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nav = document.querySelector<HTMLElement>("[data-navbar]");
    if (nav) nav.classList.toggle("is-scrolled", scrolled);
  }, [scrolled]);

  useEffect(() => {
    const overlay = document.querySelector<HTMLElement>("[data-navbar-mobile]");
    if (overlay) overlay.classList.toggle("is-open", menuOpen);
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    const openBtn = document.querySelector<HTMLButtonElement>("[data-navbar-open]");
    const closeBtn = document.querySelector<HTMLButtonElement>("[data-navbar-close]");
    const links = document.querySelectorAll<HTMLAnchorElement>("[data-navbar-mobile] a");

    const open = () => setMenuOpen(true);
    const close = () => setMenuOpen(false);

    openBtn?.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);
    links.forEach((a) => a.addEventListener("click", close));

    return () => {
      openBtn?.removeEventListener("click", open);
      closeBtn?.removeEventListener("click", close);
      links.forEach((a) => a.removeEventListener("click", close));
    };
  }, []);

  return null;
}
