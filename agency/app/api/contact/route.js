// Contact form endpoint. Sends the brief by email through Resend (https://resend.com).
// Configure RESEND_API_KEY, CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL in .env.local (see .env.example).
// Until then it answers 503 and the form falls back to the visitor's mail app.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // honeypot filled in → pretend success, send nothing
  if (clean(body.website, 200)) return Response.json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const needs = Array.isArray(body.needs) ? body.needs.map((n) => clean(n, 40)).filter(Boolean).slice(0, 10) : [];

  if (!name || !message || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    return Response.json({ error: "Email delivery is not configured" }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `New project: ${name}`,
      text: `${message}\n\nNeeds: ${needs.join(", ") || "Not sure yet"}\n\n${name}\n${email}`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text());
    return Response.json({ error: "Could not send the message" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
