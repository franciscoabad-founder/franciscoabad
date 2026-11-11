export const prerender = false;

import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../lib/supabase';
import type { OpportunityType } from '../../lib/supabase';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return json({ error: 'Nombre, email y mensaje son requeridos' }, 400);
    }

    let type: OpportunityType = 'consulting';
    if (subject === 'Speaking') {
      type = 'speaking';
    } else if (subject === 'Productos' || subject === 'Otro') {
      type = 'consulting';
    }

    const sb = getSupabaseServer();
    const { data, error } = await sb
      .from('opportunities')
      .insert([
        {
          title: `Contacto Website: ${name}`,
          type,
          status: 'prospecting',
          contact_name: name,
          contact_email: email,
          notes: `Asunto: ${subject}\n\nMensaje:\n${message}`,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('[contacto API] Supabase error:', error);
      throw error;
    }

    // Call N8N webhook for notifications and additional processing (newsletter, etc.)
    const n8nWebhookUrl = import.meta.env.N8N_CONTACT_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const osToken = import.meta.env.OS_API_TOKEN ?? import.meta.env.OS_AUTH_TOKEN;
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(osToken ? { 'X-OS-Token': osToken } : {}),
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            message,
            opportunity_id: data.id,
          }),
        });
      } catch (n8nErr) {
        console.error('[contacto API] N8N Webhook error:', n8nErr);
        // We don't fail the request if just the webhook fails, since data is already in CRM
      }
    }

    // Use Resend to send a confirmation email
    const resendApiKey = import.meta.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        // dynamic import so it doesn't fail if resend is missing or something
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: "Francisco Abad <francisco@franciscoabad.com>",
          to: [email],
          subject: 'He recibido tu mensaje',
          html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mensaje Recibido</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px;width:100%;">
          <tr>
            <td style="background:#0E1738;padding:28px 40px;">
              <span style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:700;font-size:15px;color:#ffffff;letter-spacing:0.04em;">
                FRANCISCO <span style="color:#6B7AE8;">ABAD</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2D3748;">
                Hola, ${name}.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#2D3748;">
                He recibido tu mensaje sobre <strong>${subject}</strong>.
                Lo leeré con atención y te responderé en las próximas 48 horas.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 32px;">
              <hr style="border:none;border-top:1px solid #E8EAF0;margin-bottom:24px;" />
              <p style="margin:0;font-size:14px;color:#2D3748;font-weight:600;">Francisco Abad</p>
              <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">
                <a href="https://franciscoabad.com" style="color:#3B4ED9;text-decoration:none;">franciscoabad.com</a>
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
      } catch (emailErr) {
        console.error('[contacto API] Resend email error:', emailErr);
      }
    }

    return json({ ok: true, opportunity: data }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[contacto API] Error:', msg);
    return json({ ok: false, error: 'Hubo un error procesando la solicitud' }, 502);
  }
};
