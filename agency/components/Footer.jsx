import { Logo } from "@/components/Header";
import { site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-wordmark" aria-hidden="true">
          {site.name}
          <span>.</span>
        </p>

        <div className="footer-bottom">
          <Logo />

          <p className="copyright">
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
