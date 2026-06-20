export const prerender = false;

import type { APIRoute } from "astro";
import { Resend } from "resend";

export const POST: APIRoute = async ({ request }) => {
  const fail = (msg: string, status = 400) =>
    new Response(JSON.stringify({ ok: false, error: msg }), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  const ok = (data = {}) =>
    new Response(JSON.stringify({ ok: true, ...data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  // Validar Content-Type
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return fail("Content-Type debe ser application/json");
  }

  // Leer y validar body
  let nombre: string;
  let email: string;
  try {
    const body = await request.json();
    nombre = (body.nombre ?? "").toString().trim();
    email = (body.email ?? "").toString().trim().toLowerCase();
  } catch {
    return fail("JSON inválido");
  }

  if (!nombre) return fail("El campo nombre es obligatorio");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("Email inválido");
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) return fail("Configuración de servidor incompleta", 500);

  const downloadUrl =
    import.meta.env.KIT_DOWNLOAD_URL ?? "https://franciscoabad.com/kit";

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: "Francisco Abad <francisco@franciscoabad.com>",
    to: [email],
    subject: 'Tu kit "IA para tus finanzas, en simple" está aquí',
    html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu kit está aquí</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0E1738;padding:28px 40px;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#ffffff;letter-spacing:0.04em;">
                FRANCISCO <span style="color:#6B7AE8;">ABAD</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2D3748;">
                Hola, ${nombre}.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2D3748;">
                Tu kit <strong>IA para tus finanzas, en simple</strong> está listo para descargar.
                Dentro encuentras los prompts, el workbook de Excel, los skills para Claude y
                los checklists de cierre. Todo lo que necesitas para empezar esta semana.
              </p>

              <!-- Botón de descarga -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#3B4ED9;border-radius:6px;">
                    <a
                      href="${downloadUrl}"
                      style="display:inline-block;padding:14px 32px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#ffffff;text-decoration:none;letter-spacing:0.02em;"
                    >
                      Descargar el kit
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#6B7280;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <a href="${downloadUrl}" style="color:#3B4ED9;word-break:break-all;">${downloadUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Firma -->
          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #E8EAF0;margin-bottom:24px;" />
              <p style="margin:0;font-size:14px;color:#2D3748;font-weight:600;">Francisco Abad</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
                <a href="https://franciscoabad.com" style="color:#3B4ED9;text-decoration:none;">franciscoabad.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F7F8FA;padding:20px 40px;border-top:1px solid #E8EAF0;">
              <p style="margin:0;font-size:12px;color:#9AA1AD;line-height:1.5;">
                Recibiste este correo porque lo solicitaste en
                <a href="https://franciscoabad.com/kit" style="color:#6B7280;">franciscoabad.com/kit</a>.
                Si no fuiste tú, puedes ignorarlo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  // TODO: agregar Beehiiv aquí (suscribir el email a la lista)

  if (error) {
    console.error("[kit-signup] Resend error:", error);
    return fail("No se pudo enviar el correo. Intenta de nuevo.", 500);
  }

  console.log("[kit-signup] Correo enviado:", data?.id, "→", email);
  return ok({ id: data?.id });
};
