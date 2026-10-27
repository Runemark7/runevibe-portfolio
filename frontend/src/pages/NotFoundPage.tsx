import { TextLink } from "../ui";

export function NotFoundPage() {
  return (
    <section className="rv-section">
      <h1 className="rv-heading rv-heading--title">Page not found</h1>
      <p>
        <TextLink href="/">Back to the portfolio</TextLink>
      </p>
    </section>
  );
}
