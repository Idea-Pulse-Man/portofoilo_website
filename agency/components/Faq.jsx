import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { faqs } from "@/lib/content";

// FAQPage structured data, so search engines can show the answers
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

// Native <details> accordion: one open at a time (shared name), animated where ::details-content is supported
export default function Faq() {
  return (
    <Reveal as="section" className="faq panel" id="faq">
      <div className="faq-head">
        <SectionHead index="06" label="FAQ" title="Questions, *answered.*" />

        <p className="section-text">
          Something else on your mind? <a href="#contact">Ask us directly</a>, we reply within one working day.
        </p>
      </div>

      <div className="faq-list">
        {faqs.map((item, i) => (
          <details className="faq-item" name="faq" open={i === 0} key={item.q}>
            <summary>
              <span className="faq-q">{item.q}</span>
              <span className="faq-icon" aria-hidden="true" />
            </summary>

            <p className="faq-a">{item.a}</p>
          </details>
        ))}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Reveal>
  );
}
