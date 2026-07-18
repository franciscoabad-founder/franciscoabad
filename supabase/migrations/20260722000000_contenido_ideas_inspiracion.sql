-- Banco de inspiracion de contenido: link del video original + guion extraido
-- por la tuberia de transcripcion (yt-dlp + Whisper en el VPS via n8n).
-- No toca columnas existentes. idea_madre guarda el angulo de Pancho.

alter table public.os_contenido_ideas add column if not exists url_referencia text;
alter table public.os_contenido_ideas add column if not exists transcript text;

comment on column public.os_contenido_ideas.url_referencia is 'Link del video original (reel/tiktok/short) que inspiro la idea';
comment on column public.os_contenido_ideas.transcript is 'Guion transcrito del video de referencia';

notify pgrst, 'reload schema';
