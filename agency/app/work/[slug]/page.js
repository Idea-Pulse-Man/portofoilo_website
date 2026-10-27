import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import Title from "@/components/Title";
import { testimonials, work } from "@/lib/content";

// One page per project in lib/content.js, built at compile time; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return work.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = work.find((item) => item.slug === slug);
  if (!project) return {};

  return {
    title: `${project.title}: ${project.tag}`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title}: ${project.tag}`, description: project.summary, type: "article" },
  };
}

export default async function CaseStudy({ params }) {
  const { slug } = await params;
  const index = work.findIndex((item) => item.slug === slug);
  if (index === -1) notFound();

  const project = work[index];
  const next = work[(index + 1) % work.length];
  const quote = testimonials.find((item) => item.slug === slug);

  return (
    <main id="main" tabIndex={-1} className="case">
      <section className="case-hero container on-blue">
        <div className="case-intro">
          <Link href="/#work" className="case-back">
            <Icon name="arrow-back" /> All work
          </Link>

          <p className="section-subtitle">
            {project.tag} · {project.year}
          </p>

          <Title as="h1" text={project.title} className="case-title" />

          <p className="case-summary">{project.summary}</p>
        </div>

        <figure className="case-cover">
          <Image
            src={project.image}
            width={1000}
            height={1250}
            priority
            sizes="(min-width: 992px) 520px, 100vw"
            unoptimized={project.image.endsWith(".svg")}
            alt={project.alt}
          />
        </figure>
      </section>

      <article className="container">
        <Reveal as="dl" className="case-meta panel">
          <div>
            <dt>Client</dt>
            <dd>{project.title}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{project.duration}</dd>
          </div>
          <div>
            <dt>Services</dt>
            <dd>{project.services.join(", ")}</dd>
          </div>
        </Reveal>

        <Reveal as="section" className="case-story panel" aria-label="The story">
          <div className="case-block">
            <h2 className="h3 case-block-title">The challenge</h2>
            <p className="section-text">{project.challenge}</p>
          </div>

          <div className="case-block">
            <h2 className="h3 case-block-title">Our approach</h2>
            <p className="section-text">{project.approach}</p>
          </div>
        </Reveal>

        <section className="case-results on-blue" aria-labelledby="results-title">
          <h2 className="section-subtitle" id="results-title">
            The results
          </h2>

          <ul className="case-results-list">
            {project.results.map((item) => (
              <Reveal as="li" className="case-result" key={item.label}>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        {/* placeholder visuals: give real project images a descriptive alt text */}
        <div className="case-gallery">
          {project.gallery.map((src) => (
            <Reveal as="figure" className="case-shot" key={src}>
              <Image src={src} width={1200} height={900} sizes="(min-width: 992px) 600px, 100vw" unoptimized={src.endsWith(".svg")} alt="" />
            </Reveal>
          ))}
        </div>

        {quote && (
          <Reveal as="figure" className="case-quote on-blue">
            <blockquote>
              <p>{quote.quote}</p>
            </blockquote>
            <figcaption>
              <strong>{quote.name}</strong>
              <span>{quote.role}</span>
            </figcaption>
          </Reveal>
        )}
      </article>

      <Link href={`/work/${next.slug}`} className="case-next on-blue" data-cursor="Next">
        <span className="container case-next-inner">
          <span className="section-subtitle">Next project</span>
          <span className="case-next-title">{next.title}</span>
          <span className="case-next-tag">
            {next.tag} · {next.year}
          </span>
        </span>
      </Link>

      <section className="case-cta container on-blue">
        <Title text="Have an idea like *this?*" className="case-cta-title" />

        <Button href="/#contact" icon="arrow">
          Start a project
        </Button>
      </section>
    </main>
  );
}
