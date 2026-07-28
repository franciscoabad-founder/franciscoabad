CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_messages_anon_insert"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "contact_messages_auth_read"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);
