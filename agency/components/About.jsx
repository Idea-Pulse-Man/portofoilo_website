import Image from "next/image";
import Reveal from "@/components/Reveal";

// Replace with a studio/team photo; SVG placeholders skip Next image optimisation
const image = "/images/studio.svg";

export default function About() {
  return (
    <Reveal as="section" className="about panel" id="about">
      <figure className="about-banner">
        <Image
          src={image}
          width={1400}
          height={1000}
          sizes="(min-width: 992px) 560px, 100vw"
          unoptimized={image.endsWith(".svg")}
          alt="Glass and gold geodesic sphere glowing on a dark background"
          className="w-100"
        />
      </figure>

      <div className="about-content section-content">
        <p className="section-subtitle">About us</p>

        <h2 className="h3 section-title">A small studio with many facets.</h2>

        <p className="section-text">
          Like our logo, every project we take on is made of many faces: strategy, brand, interface, code and motion. We
          are a compact team of designers and developers who care about each one, and about how they fit together. No
          hand-offs between strangers. The people you meet are the people who build your product.
        </p>

        <div className="btn-group">
          <a href="#contact" className="btn btn-secondary">
            Work with us
          </a>

          <a href="#process" className="btn btn-primary">
            Our process
          </a>
        </div>
      </div>
    </Reveal>
  );
}
