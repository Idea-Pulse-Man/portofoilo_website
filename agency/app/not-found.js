import Button from "@/components/Button";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="not-found on-blue">
      <div className="container">
        <p className="not-found-code" aria-hidden="true">
          404
        </p>

        <h1 className="not-found-title">
          This idea has no <em className="accent">pulse</em> yet.
        </h1>

        <p className="not-found-text">The page you are looking for has moved, or never existed.</p>

        <div className="btn-group">
          <Button href="/" icon="arrow">
            Back to home
          </Button>

          <Button href="/#work" variant="primary">
            See our work
          </Button>
        </div>
      </div>
    </main>
  );
}
