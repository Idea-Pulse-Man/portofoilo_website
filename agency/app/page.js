import AnimationLine from "@/components/AnimationLine";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import About from "@/components/About";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Marquee from "@/components/Marquee";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import GoTop from "@/components/GoTop";

export default function Home() {
  return (
    <>
      <AnimationLine />

      <Header />

      <main>
        <Hero />

        <article className="container">
          <Stats />
          <About />
          <Services />
          <Work />
        </article>

        <Marquee />

        <article className="container">
          <Process />
          <Contact />
        </article>
      </main>

      <Footer />

      <GoTop />
    </>
  );
}
