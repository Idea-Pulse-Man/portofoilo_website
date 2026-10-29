"use client";

import { useState } from "react";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import Title from "@/components/Title";
import { budgets, needs, site } from "@/lib/content";

const STATUS_TEXT = {
  sending: "Sending…",
  sent: "Thanks! Your message is on its way. We will reply within one working day.",
  mailto: "Your mail app should open with your message ready to send.",
  error: "Something went wrong. Please email us directly.",
};

function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <>
      <button type="button" className="copy-btn" onClick={copy} aria-label={`Copy ${site.email}`} data-magnetic="">
        <Icon name={copied ? "check" : "copy"} />
        <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
      </button>

      <span className="sr-only" role="status">
        {copied ? "Email address copied" : ""}
      </span>
    </>
  );
}

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
      budget: data.get("budget") || "",
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
        const body = `Hi ${site.name},\n\n${payload.message}\n\nI need help with: ${payload.needs.join(", ") || "Not sure yet"}\nBudget: ${payload.budget || "Not sure yet"}\n\n${payload.name}\n${payload.email}`;
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
    <section className="contact" id="contact">
      <div className="contact-cta on-blue">
        <p className="section-subtitle">
          <span className="section-index">(07)</span> Contact
        </p>

        <Title text="Got an idea? Let's give it a *pulse.*" className="contact-title" />

        <div className="contact-email">
          <a href={`mailto:${site.email}`} className="contact-email-link" data-cursor="Write">
            {site.email}
          </a>
          <CopyEmail />
        </div>
      </div>

      <Reveal className="contact-panel panel">
        <div className="contact-content section-content">
          <h3 className="h3 contact-panel-title">Tell us about your project</h3>

          <p className="section-text">
            A few lines are enough. We reply within one working day with next steps and a rough plan.
          </p>

          <ul className="contact-list">
            <li className="contact-list-item">
              <div className="contact-item-icon">
                <Icon name="location" />
              </div>

              <div className="wrapper">
                <h4 className="h4 contact-item-title">Studio:</h4>
                <address className="contact-info">{site.address}</address>
              </div>
            </li>

            <li className="contact-list-item">
              <div className="contact-item-icon">
                <Icon name="call" />
              </div>

              <div className="wrapper">
                <h4 className="h4 contact-item-title">Phone:</h4>
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
                <h4 className="h4 contact-item-title">Email:</h4>
                <a href={`mailto:${site.email}`} className="contact-info">
                  {site.email}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <form className="contact-form" onSubmit={onSubmit}>
          <div className="form-row">
            <div className="form-wrapper">
              <label htmlFor="name" className="form-label">
                Name
              </label>

              <div className="input-wrapper">
                <input type="text" name="name" id="name" required maxLength={120} autoComplete="name" placeholder="e.g. Sam Carter" className="input-field" />
                <Icon name="person" />
              </div>
            </div>

            <div className="form-wrapper">
              <label htmlFor="email" className="form-label">
                Email
              </label>

              <div className="input-wrapper">
                <input type="email" name="email" id="email" required maxLength={200} autoComplete="email" placeholder="e.g. sam@company.com" className="input-field" />
                <Icon name="mail" />
              </div>
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

          <fieldset className="form-wrapper">
            <legend className="form-label">Budget</legend>

            <div className="chip-group">
              {budgets.map((budget) => (
                <label className="chip" key={budget}>
                  <input type="radio" name="budget" value={budget} /> {budget}
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

          <Button type="submit" icon="arrow" disabled={status === "sending"}>
            Send message
          </Button>

          <p className="form-status" role="status">
            {STATUS_TEXT[status] || ""}
          </p>
        </form>
      </Reveal>
    </section>
  );
}
