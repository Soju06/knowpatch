import { describe, test, expect } from "bun:test";
import { serializeCorrectionFile } from "../src/core/writer.js";
import { parseFrontmatter, type CorrectionFile } from "../src/core/parser.js";

describe("serializeCorrectionFile", () => {
  test("round-trips a CorrectionFile through serialize → parse", () => {
    const file: CorrectionFile = {
      ecosystem: "test",
      description: "Test file",
      tags: ["react", "typescript"],
      last_updated: "2026-02-24",
      entries: [
        {
          id: "react",
          package: "react",
          lookup: "npm view react version",
          cached_version: "19.2.4",
          last_checked: "2026-02-24",
          file: "test.md",
        },
      ],
      body: "\n# Test Markdown\n\nBody content here.\n",
      file: "test.md",
    };

    const serialized = serializeCorrectionFile(file);

    // Verify it starts with frontmatter
    expect(serialized.startsWith("---\n")).toBe(true);

    // Parse it back
    const { frontmatter, body } = parseFrontmatter(serialized);

    expect(frontmatter).not.toBeNull();
    expect(frontmatter!.ecosystem).toBe("test");
    expect(frontmatter!.description).toBe("Test file");
    expect(frontmatter!.tags).toEqual(["react", "typescript"]);
    expect(frontmatter!.last_updated).toBe("2026-02-24");
    expect(frontmatter!.entries).toHaveLength(1);
    expect(frontmatter!.entries[0]!.id).toBe("react");
    expect(frontmatter!.entries[0]!.cached_version).toBe("19.2.4");
    expect(body).toContain("# Test Markdown");
  });

  test("handles entries with null cached_version", () => {
    const file: CorrectionFile = {
      ecosystem: "test",
      description: "Test",
      tags: ["test"],
      last_updated: "2026-02-24",
      entries: [
        {
          id: "pkg",
          package: "pkg",
          lookup: "npm view pkg version",
          cached_version: null,
          last_checked: "2026-02-24",
          file: "test.md",
        },
      ],
      body: "\n# Body\n",
      file: "test.md",
    };

    const serialized = serializeCorrectionFile(file);
    const { frontmatter } = parseFrontmatter(serialized);

    expect(frontmatter!.entries[0]!.cached_version).toBeNull();
  });

  test("handles empty entries array", () => {
    const file: CorrectionFile = {
      ecosystem: "platforms",
      description: "Platforms",
      tags: ["supabase"],
      last_updated: "2026-02-25",
      entries: [],
      body: "\n# Platforms\n",
      file: "platforms.md",
    };

    const serialized = serializeCorrectionFile(file);
    const { frontmatter } = parseFrontmatter(serialized);

    expect(frontmatter!.entries).toEqual([]);
  });

  test("preserves markdown body content exactly", () => {
    const bodyContent = "\n# Heading\n\nParagraph with **bold** and `code`.\n\n- List item 1\n- List item 2\n";
    const file: CorrectionFile = {
      ecosystem: "test",
      description: "Test",
      tags: ["test"],
      last_updated: "2026-02-24",
      entries: [],
      body: bodyContent,
      file: "test.md",
    };

    const serialized = serializeCorrectionFile(file);
    const { body } = parseFrontmatter(serialized);

    expect(body).toBe(bodyContent);
  });
});
