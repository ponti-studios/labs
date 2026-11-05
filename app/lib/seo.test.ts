import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { projects } from "~/data/projects";
import { pageMeta, projectOgImage, SITE_URL } from "~/lib/seo";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe("project OG previews", () => {
  it("points each project at its own share card", () => {
    for (const project of projects) {
      expect(projectOgImage(project.slug)).toBe(`${SITE_URL}/og/projects/${project.slug}.png`);
    }
  });

  it("emits the card as the og:image and twitter:image", () => {
    const tags = pageMeta({
      title: "Kernel | Ponti Studios",
      description: "desc",
      path: "/projects/kernel",
      image: projectOgImage("kernel"),
    });
    const byProp = (property: string) =>
      tags.find((tag) => "property" in tag && tag.property === property);
    expect(byProp("og:image")).toMatchObject({
      content: `${SITE_URL}/og/projects/kernel.png`,
    });
    expect(tags.find((tag) => "name" in tag && tag.name === "twitter:image")).toMatchObject({
      content: `${SITE_URL}/og/projects/kernel.png`,
    });
  });

  it("has a real PNG card for every project slug", () => {
    for (const project of projects) {
      const file = join(process.cwd(), "public/og/projects", `${project.slug}.png`);
      expect(existsSync(file), `missing OG card for ${project.slug}`).toBe(true);
      const bytes = readFileSync(file);
      expect(bytes.subarray(0, 8).equals(PNG_SIGNATURE), `not a PNG: ${project.slug}`).toBe(
        true,
      );
      expect(bytes.length, `empty OG card: ${project.slug}`).toBeGreaterThan(10_000);
    }
  });
});
