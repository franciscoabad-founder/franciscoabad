-- ============================================================
-- Francisco Abad — Add quiz_leads table
-- 2026-05-02
--
-- Backfill: la tabla ya estaba siendo usada por src/pages/GrowthLab.tsx
-- pero nunca se incluyó en la migración inicial. Esta migración la
-- agrega al schema con RLS para que anónimos puedan insertar (quiz)
-- y solo authenticated pueda leer (admin).
-- ============================================================

CREATE TABLE quiz_leads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email       text NOT NULL,
  diagnosis   jsonb,
  answers     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_leads_created_at ON quiz_leads (created_at DESC);
CREATE INDEX idx_quiz_leads_email      ON quiz_leads (email);

ALTER TABLE quiz_leads ENABLE ROW LEVEL SECURITY;

-- Anon: solo INSERT (el quiz público inserta leads sin autenticarse)
CREATE POLICY "quiz_leads_anon_insert"
  ON quiz_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated: lectura completa para el admin
CREATE POLICY "quiz_leads_auth_read"
  ON quiz_leads FOR SELECT
  TO authenticated
  USING (true);
