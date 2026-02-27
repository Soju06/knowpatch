import { describe, expect, test } from "bun:test";
import { parseCorrectionFile, parseFrontmatter } from "../src/core/parser.js";

const sampleContent = `---
ecosystem: test-ecosystem
description: Test corrections file
tags: [react, typescript, test]
last_updated: "2026-02-24"
---

# Test Corrections

Some markdown body content here.

### React — 2026-02
- **Wrong (training data)**: React 18 is the latest
- **Correct (current)**: React 19
`;

const noFrontmatterContent = `# Plain Markdown

No YAML frontmatter here.
`;

describe("parseFrontmatter", () => {
  test("extracts YAML frontmatter and markdown body", () => {
    const { frontmatter, body } = parseFrontmatter(sampleContent);

    expect(frontmatter).not.toBeNull();
    expect(frontmatter?.ecosystem).toBe("test-ecosystem");
    expect(frontmatter?.description).toBe("Test corrections file");
    expect(frontmatter?.tags).toEqual(["react", "typescript", "test"]);
    expect(frontmatter?.last_updated).toBe("2026-02-24");
    expect(body).toContain("# Test Corrections");
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
    expect(result.body).toContain("# Test Corrections");
  });

  test("handles file without frontmatter gracefully", () => {
    const result = parseCorrectionFile("plain.md", noFrontmatterContent);

    expect(result.ecosystem).toBe("plain");
    expect(result.tags).toEqual([]);
    expect(result.body).toBe(noFrontmatterContent);
  });
});
