import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function walk(dir: string, visit: (file: string) => void) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, visit);
    } else {
      visit(full);
    }
  }
}

describe("design system boundary", () => {
  it("imports PatternFly only from src/ui", () => {
    const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const offenders: string[] = [];
    walk(src, (file) => {
      if (!/\.(ts|tsx)$/.test(file) || file.endsWith(".d.ts")) return;
      if (file.includes(`${path.sep}ui${path.sep}`)) return;
      const text = readFileSync(file, "utf8");
      if (text.includes("@patternfly/")) offenders.push(path.relative(src, file));
    });
    expect(offenders).toEqual([]);
  });
});
