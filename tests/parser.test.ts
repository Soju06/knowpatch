import { describe, test, expect } from "bun:test";
import { parseFrontmatter, parseCorrectionFile } from "../src/core/parser.js";

const sampleContent = `---
ecosystem: test-ecosystem
description: Test corrections file
tags: [react, typescript, test]
last_updated: "2026-02-24"
entries:
  - id: react
    package: "react"
    lookup: "npm view react version"
    cached_version: "19.2.4"
    last_checked: "2026-02-24"
  - id: typescript
    package: "typescript"
    lookup: "npm view typescript version"
    cached_version: null
    last_checked: "2026-02-24"
---

# Test Corrections

Some markdown body content here.

### React — 2026-02
- **Wrong (training data)**: React 18 is the latest
- **Correct (current)**: React 19.2.4
`;

const noFrontmatterContent = `# Plain Markdown

No YAML frontmatter here.
`;

describe("parseFrontmatter", () => {
  test("extracts YAML frontmatter and markdown body", () => {
    const { frontmatter, body } = parseFrontmatter(sampleContent);

    expect(frontmatter).not.toBeNull();
    expect(frontmatter!.ecosystem).toBe("test-ecosystem");
    expect(frontmatter!.description).toBe("Test corrections file");
    expect(frontmatter!.tags).toEqual(["react", "typescript", "test"]);
    expect(frontmatter!.last_updated).toBe("2026-02-24");
    expect(frontmatter!.entries).toHaveLength(2);
    expect(body).toContain("# Test Corrections");
  });

  test("parses entry fields correctly", () => {
    const { frontmatter } = parseFrontmatter(sampleContent);

    const react = frontmatter!.entries[0]!;
    expect(react.id).toBe("react");
    expect(react.package).toBe("react");
    expect(react.lookup).toBe("npm view react version");
    expect(react.cached_version).toBe("19.2.4");
    expect(react.last_checked).toBe("2026-02-24");

    const ts = frontmatter!.entries[1]!;
    expect(ts.id).toBe("typescript");
    expect(ts.cached_version).toBeNull();
  });

  test("returns null frontmatter for content without frontmatter", () => {
    const { frontmatter, body } = parseFrontmatter(noFrontmatterContent);

    expect(frontmatter).toBeNull();
    expect(body).toBe(noFrontmatterContent);
  });
});

describe("parseCorrectionFile", () => {
  test("parses a file with frontmatter into CorrectionFile", () => {
    const result = parseCorrectionFile("test.md", sampleContent);

    expect(result.ecosystem).toBe("test-ecosystem");
    expect(result.file).toBe("test.md");
    expect(result.tags).toEqual(["react", "typescript", "test"]);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]!.file).toBe("test.md");
    expect(result.entries[0]!.id).toBe("react");
    expect(result.body).toContain("# Test Corrections");
  });

  test("handles file without frontmatter gracefully", () => {
    const result = parseCorrectionFile("plain.md", noFrontmatterContent);

    expect(result.ecosystem).toBe("plain");
    expect(result.entries).toHaveLength(0);
    expect(result.tags).toEqual([]);
    expect(result.body).toBe(noFrontmatterContent);
  });

  test("handles empty entries array", () => {
    const content = `---
ecosystem: platforms
description: Platforms
tags: [supabase]
last_updated: "2026-02-25"
entries: []
---

# Platforms
`;
    const result = parseCorrectionFile("platforms.md", content);

    expect(result.entries).toHaveLength(0);
    expect(result.ecosystem).toBe("platforms");
  });
});
