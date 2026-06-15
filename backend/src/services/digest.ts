import nodemailer from "nodemailer";
import { config } from "../config";
import { Discovery } from "../types";

/** Send the daily digest email. Returns true if sent, false if SMTP not configured. */
export async function sendDigest(matches: Discovery[]): Promise<boolean> {
  if (!config.hasSmtp()) return false;
  if (matches.length === 0) return false;

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  const top = matches.slice(0, 15);
  const rows = top
    .map(
      (m) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;">
          <a href="${m.url}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${escape(
        m.title
      )}</a>
          <div style="color:#555;font-size:13px;">${escape(m.company)} · ${escape(
        m.location || "Remote"
      )}${m.salary ? " · " + escape(m.salary) : ""}</div>
          <div style="color:#777;font-size:12px;margin-top:4px;">
            Match ${m.match_score ?? "?"} · AI-driven ${m.ai_driven_score ?? "?"} · AI-resistant ${
        m.ai_resist_score ?? "?"
      }
          </div>
          ${m.reason ? `<div style="color:#444;font-size:13px;margin-top:4px;">${escape(m.reason)}</div>` : ""}
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:auto;">
    <h2 style="color:#111;">${matches.length} new remote matches today</h2>
    <p style="color:#555;">Top picks scored against your profile. Open ApplyTrack to add them to your board.</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="margin-top:20px;">
      <a href="${config.appUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;">Open ApplyTrack</a>
    </p>
  </div>`;

  await transporter.sendMail({
    from: config.smtp.user,
    to: config.smtp.to,
    subject: `ApplyTrack: ${matches.length} new remote matches`,
    html,
  });
  return true;
}

function escape(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
