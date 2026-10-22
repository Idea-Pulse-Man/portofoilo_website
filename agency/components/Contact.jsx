"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import { needs, site } from "@/lib/content";

const STATUS_TEXT = {
  sending: "Sending…",
  sent: "Thanks! Your message is on its way. We will reply within one working day.",
  mailto: "Your mail app should open with your message ready to send.",
  error: "Something went wrong. Please email us directly.",
};

export default function Contact() {
  const [status, setStatus] = useState("idle");

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      needs: data.getAll("need"),
      website: data.get("website"), // honeypot
    };

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      // email delivery not configured yet → open the visitor's mail app instead
      if (res.status === 503) {
        const body = `Hi ${site.name},\n\n${payload.message}\n\nI need help with: ${payload.needs.join(", ") || "Not sure yet"}\n\n${payload.name}\n${payload.email}`;
        window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`New project: ${payload.name}`)}&body=${encodeURIComponent(body)}`;
        setStatus("mailto");
        return;
      }

      setStatus("error");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <Reveal as="section" className="contact panel" id="contact">
      <div className="contact-content section-content">
        <p className="section-subtitle">Contact</p>

        <h2 className="h3 section-title">Got an idea? Let&apos;s give it a pulse.</h2>

        <p className="section-text">
          Tell us a little about your project. We reply within one working day with next steps and a rough plan.
        </p>

        <ul className="contact-list">
          <li className="contact-list-item">
            <div className="contact-item-icon">
              <Icon name="location" />
            </div>

            <div className="wrapper">
              <h3 className="h4 contact-item-title">Studio:</h3>
              <address className="contact-info">{site.address}</address>
            </div>
          </li>

          <li className="contact-list-item">
            <div className="contact-item-icon">
              <Icon name="call" />
            </div>

            <div className="wrapper">
              <h3 className="h4 contact-item-title">Phone:</h3>
              <a href={site.phone.href} className="contact-info">
                {site.phone.label}
              </a>
            </div>
          </li>

          <li className="contact-list-item">
            <div className="contact-item-icon">
              <Icon name="mail-outline" />
            </div>

            <div className="wrapper">
              <h3 className="h4 contact-item-title">Email:</h3>
              <a href={`mailto:${site.email}`} className="contact-info">
                {site.email}
              </a>
            </div>
          </li>
        </ul>
      </div>

      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-wrapper">
          <label htmlFor="name" className="form-label">
            Name
          </label>

          <div className="input-wrapper">
            <input type="text" name="name" id="name" required maxLength={120} placeholder="e.g. Sam Carter" className="input-field" />
            <Icon name="person" />
          </div>
        </div>

        <div className="form-wrapper">
          <label htmlFor="email" className="form-label">
            Email
          </label>

          <div className="input-wrapper">
            <input type="email" name="email" id="email" required maxLength={200} placeholder="e.g. sam@company.com" className="input-field" />
            <Icon name="mail" />
          </div>
        </div>

        <fieldset className="form-wrapper">
          <legend className="form-label">I need help with</legend>

          <div className="chip-group">
            {needs.map((need) => (
              <label className="chip" key={need}>
                <input type="checkbox" name="need" value={need} /> {need}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-wrapper">
          <label htmlFor="message" className="form-label">
            Message
          </label>

          <div className="input-wrapper">
            <textarea name="message" id="message" required maxLength={5000} placeholder="Tell us about your idea..." className="input-field" />
            <Icon name="chat" />
          </div>
        </div>

        {/* honeypot: hidden from people, bots fill it in */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp-field" aria-hidden="true" />

        <button type="submit" className="btn btn-secondary" disabled={status === "sending"}>
          Send
        </button>

        <p className="form-status" role="status">
          {STATUS_TEXT[status] || ""}
        </p>
      </form>
    </Reveal>
  );
}
