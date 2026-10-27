import { TextLink } from "../ui";

export function NotFoundPage() {
  return (
    <section className="rv-wrap rv-missing">
      <p className="rv-missing-code">404</p>
      <h1 className="rv-missing-title">Page not found</h1>
      <p>
        <TextLink href="/" arrow="left">
          Back to the home page
        </TextLink>
      </p>
    </section>
  );
}
