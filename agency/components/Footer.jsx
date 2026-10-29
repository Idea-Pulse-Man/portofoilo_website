import Clock from "@/components/Clock";
import { Logo } from "@/components/Header";
import Icon from "@/components/Icon";
import SiteLink from "@/components/SiteLink";
import { nav, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer on-blue">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />

            <p className="footer-text">
              We give ideas a pulse. Brand, web, 3D and product design for teams who want to stand out.
            </p>

            <SiteLink href="#contact" className="footer-cta" data-magnetic="">
              Start a project <Icon name="arrow" />
            </SiteLink>
          </div>

          <nav className="footer-col" aria-label="Footer">
            <p className="footer-col-title">Menu</p>

            <ul className="footer-links">
              {nav.map((item) => (
                <li key={item.href}>
                  <SiteLink href={item.href}>{item.label}</SiteLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <p className="footer-col-title">Follow</p>

            <ul className="footer-links">
              {site.social.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>
                    <Icon name={item.icon} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Studio</p>

            <ul className="footer-links">
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.phone.href}>{site.phone.label}</a>
              </li>
              <li>
                <address>{site.address}</address>
              </li>
              <li>
                <Clock />
              </li>
            </ul>
          </div>
        </div>

        <p className="footer-wordmark" aria-hidden="true">
          {site.name}
          <span>.</span>
        </p>

        <div className="footer-bottom">
          <p className="copyright">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved
          </p>

          <a href="#top" className="footer-top-link">
            Back to top <Icon name="arrow-up" />
          </a>
        </div>
      </div>
    </footer>
  );
}
