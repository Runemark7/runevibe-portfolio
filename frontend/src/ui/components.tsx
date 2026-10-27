import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button as PfButton, Card as PfCard, CardBody, Label, Spinner, Title } from "@patternfly/react-core";
import { applyTheme, currentTheme, type ThemeName } from "./theme";

export function Mark() {
  return (
    <svg className="rv-mark" viewBox="0 0 48 48" role="img" aria-label="Runevibe">
      <rect width="48" height="48" rx="12" className="rv-mark-bg" />
      <path d="M16 10v28M24 10l12 28M24 10L12 38" className="rv-mark-stroke" />
    </svg>
  );
}

export function Heading({
  level,
  size = "title",
  children,
  id,
}: {
  level: "h1" | "h2" | "h3";
  size?: "display" | "title" | "section";
  children: ReactNode;
  id?: string;
}) {
  const pfSize = size === "display" ? "4xl" : size === "title" ? "2xl" : "xl";
  return (
    <Title headingLevel={level} size={pfSize} id={id} className={`rv-heading rv-heading--${size}`}>
      {children}
    </Title>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  ariaLabel,
  ariaPressed,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  ariaLabel?: string;
  ariaPressed?: boolean;
}) {
  return (
    <PfButton
      variant={variant}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={`rv-button rv-button--${variant}`}
    >
      {children}
    </PfButton>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "flagship" | "main" | "smaller";
}) {
  return (
    <Label className={`rv-badge rv-badge--${tone}`} isCompact>
      {children}
    </Label>
  );
}

export function Panel({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <PfCard component="article" className={className ? `rv-card ${className}` : "rv-card"} aria-label={label}>
      <CardBody className="rv-card-body">{children}</CardBody>
    </PfCard>
  );
}

export function TextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  if (!external && href.startsWith("/")) {
    return (
      <RouterLink className="rv-link" to={href}>
        {children}
      </RouterLink>
    );
  }
  return (
    <a
      className="rv-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      {children}
      {external ? <span className="rv-sr"> (opens in a new tab)</span> : null}
    </a>
  );
}

export function LinkedInPlaceholder({ url }: { url?: string | null }) {
  if (url) {
    return (
      <TextLink href={url} external>
        LinkedIn
      </TextLink>
    );
  }
  return (
    <span className="rv-todo">
      LinkedIn <span className="rv-todo-mark">TODO</span>
    </span>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(() => currentTheme());
  const dark = theme === "dark";
  return (
    <Button
      variant="secondary"
      ariaLabel={dark ? "Switch to light theme" : "Switch to dark theme"}
      ariaPressed={dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
    >
      {dark ? "Light" : "Dark"}
    </Button>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="rv-status" role="status">
      <Spinner diameter="2.5rem" aria-label={label} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rv-status rv-status--error" role="alert">
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function Section({
  id,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  kicker: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section className="rv-section" id={id} aria-labelledby={headingId}>
      <p className="rv-kicker">{kicker}</p>
      <Heading level="h2" size="title" id={headingId}>
        {title}
      </Heading>
      {intro ? <p className="rv-intro">{intro}</p> : null}
      {children}
    </section>
  );
}
