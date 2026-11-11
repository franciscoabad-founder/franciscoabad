I'll review the screenshots and source against the English/Spanish jobs you described, then give ranked feedback in your format. No files will be changed.The English rebuild dropped the institutional logos strip that the live site still has. Checking Spanish copy and the shared section components next.**1. Verdict**

Would not place at Awwwards or CSSDA yet. Credible founder site with a strong photo and clear Rafik story, but the English rebuild is a competent dark template (bordered cards, champagne labels, Montserrat 900) and Spanish is still a different product: light institutional brochure with old hero and services. Two languages, two jobs, zero shared craft system.

**2. Top 7 changes (by impact)**

1. **What:** Put `LogosInstitucionales` on English `/` under the hero (keep Education / Track record / Speaking rows).  
   **Why:** You asked to keep it; English currently drops the strongest trust strip investors and partners scan in 3 seconds.  
   **How:** White or linen band under the navy hero; logos at ~56px, opacity 0.88, same 3 labeled rows as ES.

2. **What:** Rewrite the English hero for a fundable operator, not a slogan.  
   **Why:** "I'm building the legal hub for the future" is category poetry. Partners hear vaporware; investors want what ships and who signs.  
   **How:** Headline + subline in section 3; proof chips as three short metrics under the subline, 14px Montserrat, champagne separators.

3. **What:** Rebuild Spanish `/es/` on the same dark system as EN, with formal LATAM voice.  
   **Why:** Split aesthetic (linen brochure vs ink founder) reads as unfinished bilingual, not two audiences.  
   **How:** Same layout skeleton as `index.astro`; swap copy only. Drop Services / "Trabajemos juntos" from the home hero; CTA becomes "Invítame a hablar" + "Ver trayectoria".

4. **What:** Fix portfolio density and hierarchy.  
   **Why:** Eight equal bordered tiles with no visuals feel like a Notion dump; "Live" vs "In progress" barely reads.  
   **How:** 2-col desktop, featured Rafik + Nerio at 1.4× type and a product still or diagram; status as a 10px pill (champagne Live, ultramarine In progress); one-line "what it does" max 90 chars.

5. **What:** Break the card monoculture on English home.  
   **Why:** Track + Built + Speaking all use the same 14px radius bordered box; judges call this "component wallpaper."  
   **How:** Track as a vertical timeline with a 2px champagne rule and year markers; Built as product cards with thumbnails; Speaking as a short list with one primary CTA.

6. **What:** Sharpen type and color roles.  
   **Why:** Champagne labels on every section flatten hierarchy; H1 at ~4.6rem competes with secondary heads.  
   **How:** Eyebrows in ultra-light 11px tracking 0.2em; champagne only for years and Live; H1 clamp 2.75–4rem; body 17/28; secondary max-width 42ch.

7. **What:** One motion moment on scroll (see section 5).  
   **Why:** `data-reveal` fade alone is table stakes; nothing owns the visit.  
   **How:** CSS-only, no GSAP: see signature idea below.

**3. English home (investors + law firm partners)**

Headline: Agents take the repetitive work. An attorney signs everything.  
Subline: Co-founder at Rafik. Building the legal hub for the future in public from San Francisco.  
Proof points:  
1. Former Director General, Ecuador Social Security: 32,000 people, $10B+ under management  
2. Founder, CODEIS: 15 countries, 18,000+ entrepreneurs trained  
3. Co-founder is a corporate attorney with 16+ years; every workflow is attorney-reviewed before a firm uses it

**4. Spanish home (thought leader / speaker / advisor)**

Headline: Construyo sistemas que escalan personas e instituciones.  
Subline: Cofundador de Rafik. Ex Director General del IESS. Fundador de CODEIS en más de 15 países. Conferencista y asesor para líderes y organizaciones en América Latina.

**5. Signature interaction**

**Credential orbit under the English hero:** as the logos band enters view, each logo fades in on a staggered 40ms delay along a single horizontal baseline, then a thin champagne underline draws under the active row label (Education → Track record → Speaking) on hover/focus via CSS `transition` + `scroll-driven` or IntersectionObserver toggle of a class. Feels institutional and precise, stays Astro + Tailwind, zero heavy libraries, and makes the logo section you want to keep the memorable beat of the page.
