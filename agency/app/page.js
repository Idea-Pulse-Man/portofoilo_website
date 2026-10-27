import About from "@/components/About";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Process from "@/components/Process";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import Work from "@/components/Work";

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <Hero />

      <Clients />

      <article className="container">
        <About />
      </article>

      <Work />

      <article className="container">
        <Services />
      </article>

      <Marquee />

      <article className="container">
        <Process />
        <Testimonials />
        <Faq />
        <Contact />
      </article>
    </main>
  );
}
