/**
 * Script de prueba para Resend.
 * Uso: node --env-file=.env scripts/test-resend.mjs
 * Debe correrse desde apps/web/.
 */

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("Error: RESEND_API_KEY no está definida en .env");
  process.exit(1);
}

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from: "Francisco Abad <francisco@franciscoabad.com>",
  to: ["f.abad.ecu@gmail.com"],
  subject: "Prueba de Resend",
  html: `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="font-size: 24px; color: #0E1738; margin-bottom: 16px;">Resend funciona.</h1>
      <p style="color: #6B7280; line-height: 1.6;">
        Este correo confirma que la integración de Resend con
        <strong>franciscoabad.com</strong> está operativa.
      </p>
      <p style="color: #6B7280; line-height: 1.6; margin-top: 16px;">
        Dominio remitente verificado. Listo para correos transaccionales.
      </p>
    </div>
  `,
});

if (error) {
  console.error("Fallo al enviar:");
  console.error(error);
  process.exit(1);
}

console.log("Correo enviado correctamente.");
console.log("ID:", data.id);
