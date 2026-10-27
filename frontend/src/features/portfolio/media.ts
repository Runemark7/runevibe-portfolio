import type { FrameImage } from "../../ui";

export type Shot = FrameImage & { path: string };

export type ProjectMedia =
  | { kind: "screens"; primary: Shot; secondary?: Shot }
  | { kind: "schematic" };

function responsive(name: string, width: number, height: number): Omit<FrameImage, "alt"> {
  const half = Math.round(width / 2);
  return {
    src: `/projects/${name}-${width}.webp`,
    srcSet: `/projects/${name}-${half}.webp ${half}w, /projects/${name}-${width}.webp ${width}w`,
    width,
    height,
  };
}

const MEDIA: Record<string, ProjectMedia> = {
  riksdagskollen: {
    kind: "screens",
    primary: {
      ...responsive("riksdagskollen", 1440, 900),
      path: "/",
      alt: "Riksdagskollen home page: the question of what parliament decides and whether it keeps its promises, followed by a list of upcoming committee reports.",
    },
    secondary: {
      ...responsive("riksdagskollen-parties", 1440, 900),
      path: "/parties",
      alt: "Riksdagskollen party page: each party with its stated goals and topic tags, next to how it voted.",
    },
  },
  dealradar: { kind: "schematic" },
  "paper-trading-bot": {
    kind: "screens",
    primary: {
      ...responsive("paper-trading-bot", 1264, 530),
      path: "/discovery",
      alt: "Paper trading bot discovery view: counts of strategies tested, qualified, and rejected, and the strategy currently being backtested.",
    },
  },
  "halmstad-homes": {
    kind: "screens",
    primary: {
      ...responsive("halmstad-homes", 1440, 900),
      path: "/",
      alt: "Halmstad homes map: a list of homes for sale beside a Leaflet map of Halmstad with price pins.",
    },
  },
};

export function mediaFor(slug: string): ProjectMedia | null {
  return MEDIA[slug] ?? null;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function frameLabel(liveUrl: string | null | undefined, path: string): string {
  if (!liveUrl) return path;
  const host = hostOf(liveUrl);
  return path === "/" ? host : `${host}${path}`;
}
