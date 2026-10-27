import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button as PfButton, Label, Spinner, Title } from "@patternfly/react-core";
import { applyTheme, currentTheme, type ThemeName } from "./theme";

export function Mark() {
  return (
    <svg className="rv-mark" viewBox="0 0 48 48" aria-hidden="true">
      <rect width="48" height="48" className="rv-mark-bg" />
      <path d="M17 11v26M24 11l9 26M24 11l-9 26" className="rv-mark-stroke" />
    </svg>
  );
}

export type ArrowDirection = "right" | "down" | "up" | "out" | "left";

const ARROW_PATHS: Record<ArrowDirection, string> = {
  right: "M2 8h11M9 4l4 4-4 4",
  left: "M14 8H3M7 4L3 8l4 4",
  down: "M8 2v11M4 9l4 4 4-4",
  up: "M8 14V3M4 7l4-4 4 4",
  out: "M4 12l8-8M5.5 4H12v6.5",
};

export function Arrow({ direction }: { direction: ArrowDirection }) {
  return (
    <svg className={`rv-arrow rv-arrow--${direction}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={ARROW_PATHS[direction]} />
    </svg>
  );
}

export function Heading({
  level,
  size = "title",
  children,
  id,
}: {
  level: "h1" | "h2" | "h3" | "h4";
  size?: "display" | "title" | "section" | "entry";
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
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "plain";
  ariaLabel?: string;
  ariaPressed?: boolean;
  className?: string;
}) {
  return (
    <PfButton
      variant={variant}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={["rv-button", `rv-button--${variant}`, className].filter(Boolean).join(" ")}
    >
      {children}
    </PfButton>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: ArrowDirection;
  external?: boolean;
}) {
  return (
    <PfButton
      component="a"
      href={href}
      variant={variant}
      className={`rv-button rv-button--${variant}`}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
    >
      <span>{children}</span>
      {arrow ? <Arrow direction={arrow} /> : null}
      {external ? <span className="rv-sr"> (opens in a new tab)</span> : null}
    </PfButton>
  );
}

export function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <PfButton variant="plain" onClick={onClick} aria-pressed={pressed} className="rv-toggle">
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

export function TextLink({
  href,
  children,
  external = false,
  arrow,
  className,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  arrow?: ArrowDirection;
  className?: string;
}) {
  const classes = ["rv-link", arrow ? "rv-link--arrow" : null, className].filter(Boolean).join(" ");
  const icon = arrow ? <Arrow direction={arrow} /> : null;
  if (!external && href.startsWith("/")) {
    return (
      <RouterLink className={classes} to={href}>
        {arrow === "left" ? icon : null}
        <span>{children}</span>
        {arrow && arrow !== "left" ? icon : null}
      </RouterLink>
    );
  }
  return (
    <a className={classes} href={href} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
      {arrow === "left" ? icon : null}
      <span>{children}</span>
      {arrow && arrow !== "left" ? icon : null}
      {external ? <span className="rv-sr"> (opens in a new tab)</span> : null}
    </a>
  );
}

export function LinkedInPlaceholder({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <TextLink href={url} external arrow="out">
      LinkedIn
    </TextLink>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(() => currentTheme());
  const dark = theme === "dark";
  return (
    <Button
      variant="plain"
      className="rv-theme-toggle"
      ariaLabel={dark ? "Switch to light theme" : "Switch to dark theme"}
      ariaPressed={dark}
      onClick={() => {
        const next = dark ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
    >
      <svg className="rv-theme-glyph" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="6.25" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" />
      </svg>
      <span>{dark ? "Light" : "Dark"}</span>
    </Button>
  );
}

export function Loading({ label }: { label: string }) {
  return (
    <div className="rv-wrap rv-status" role="status">
      <Spinner diameter="1.5rem" aria-label={label} />
      <p>{label}</p>
    </div>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rv-wrap rv-status rv-status--error" role="alert">
      <p>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

export function Section({
  id,
  index,
  kicker,
  title,
  intro,
  children,
}: {
  id: string;
  index?: string;
  kicker: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section className="rv-section" id={id} aria-labelledby={headingId}>
      <div className="rv-wrap">
        <header className="rv-section-head">
          <p className="rv-section-index">
            {index ? <span className="rv-section-num">{index}</span> : null}
            <span>{kicker}</span>
          </p>
          <div className="rv-section-title">
            <Heading level="h2" size="title" id={headingId}>
              {title}
            </Heading>
            {intro ? <p className="rv-intro">{intro}</p> : null}
          </div>
        </header>
        {children}
      </div>
    </section>
  );
}

export type FrameImage = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
};

function FrameImg({ image, sizes, priority }: { image: FrameImage; sizes: string; priority: boolean }) {
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}

export function Frame({
  image,
  label,
  sizes = "100vw",
  priority = false,
  className,
}: {
  image: FrameImage;
  label: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={className ? `rv-frame ${className}` : "rv-frame"}>
      <div className="rv-frame-bar" aria-hidden="true">
        <span className="rv-frame-lock" />
        <span className="rv-frame-url">{label}</span>
      </div>
      <FrameImg image={image} sizes={sizes} priority={priority} />
    </figure>
  );
}

export function PhoneFrame({ image, className }: { image: FrameImage; className?: string }) {
  return (
    <figure className={className ? `rv-phone ${className}` : "rv-phone"}>
      <FrameImg image={image} sizes="12rem" priority={false} />
    </figure>
  );
}

export function Sheet({ label, caption, children }: { label: string; caption: string; children: ReactNode }) {
  return (
    <figure className="rv-sheet">
      <div className="rv-sheet-bar" aria-hidden="true">
        <span>{label}</span>
      </div>
      <div className="rv-sheet-body">{children}</div>
      <figcaption className="rv-sheet-caption">{caption}</figcaption>
    </figure>
  );
}
