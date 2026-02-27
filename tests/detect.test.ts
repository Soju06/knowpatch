import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import {
  buildMessage,
  extractEntries,
  filterEntries,
  findMatchedKeywords,
  loadCorrections,
  parseFrontmatterTags,
} from "../src/hooks/detect.js";

describe("findMatchedKeywords", () => {
  const keywords = ["shadcn", "tailwind", "react", "node"];

  test("returns empty array for empty prompt", () => {
    expect(findMatchedKeywords("", keywords)).toEqual([]);
  });

  test("matches keywords in prompt", () => {
    const result = findMatchedKeywords("setup shadcn with react", keywords);
    expect(result).toContain("shadcn");
    expect(result).toContain("react");
  });

  test("returns empty for unrelated prompt", () => {
    expect(findMatchedKeywords("hello world", keywords)).toEqual([]);
  });

  test("case insensitive matching", () => {
    const result = findMatchedKeywords("Install REACT", keywords);
    expect(result).toContain("react");
  });
});

describe("parseFrontmatterTags", () => {
  test("extracts tags from valid frontmatter", () => {
    const content = [
      "---",
      'ecosystem: "test"',
      "tags: [shadcn, tailwind, eslint]",
      '  last_updated: "2026-01-01"',
      "---",
      "# Content",
    ].join("\n");
    expect(parseFrontmatterTags(content)).toEqual([
      "shadcn",
      "tailwind",
      "eslint",
    ]);
  });

  test("handles quoted tags", () => {
    const content = ["---", 'tags: ["open-source", "self-hosted"]', "---"].join(
      "\n",
    );
    expect(parseFrontmatterTags(content)).toEqual([
      "open-source",
      "self-hosted",
    ]);
  });

  test("returns empty for content without frontmatter", () => {
    expect(parseFrontmatterTags("# Just a heading")).toEqual([]);
  });

  test("returns empty for frontmatter without tags", () => {
    const content = ["---", 'ecosystem: "test"', "---"].join("\n");
    expect(parseFrontmatterTags(content)).toEqual([]);
  });
});

describe("extractEntries", () => {
  test("extracts ### entries", () => {
    const content = [
      "---",
      "tags: [test]",
      "---",
      "# Title",
      "## TOC",
      "---",
      "### Entry One — 2025-01",
      "- Wrong: old",
      "- Correct: new",
      "",
      "### Entry Two — 2025-02",
      "- Wrong: old2",
      "- Correct: new2",
    ].join("\n");
    const entries = extractEntries(content);
    expect(entries).toHaveLength(2);
    expect(entries[0].header).toBe("Entry One — 2025-01");
    expect(entries[0].body).toContain("Wrong: old");
    expect(entries[1].header).toBe("Entry Two — 2025-02");
  });

  test("## sections are NOT absorbed into preceding entry body", () => {
    const content = [
      "### Entry — 2025",
      "- Wrong: old",
      "",
      "## Meta Section",
      "Some reference content",
      "",
      "### Another Entry — 2025",
      "- Wrong: old2",
    ].join("\n");
    const entries = extractEntries(content);
    expect(entries).toHaveLength(2);
    expect(entries[0].header).toBe("Entry — 2025");
    expect(entries[0].body).not.toContain("Meta Section");
    expect(entries[1].header).toBe("Another Entry — 2025");
  });

  test("returns empty for content without ### headers", () => {
    const content = "# Title\n## Section\nSome text";
    expect(extractEntries(content)).toEqual([]);
  });
});

describe("filterEntries", () => {
  const corrections = [
    {
      tags: ["shadcn", "tailwind"],
      entries: [
        { header: "shadcn — 2025-10", body: "### shadcn — 2025-10\ncontent" },
        {
          header: "Tailwind CSS v4 — 2025-03",
          body: "### Tailwind CSS v4\ncontent",
        },
      ],
    },
    {
      tags: ["react", "zod"],
      entries: [
        { header: "React 19 — 2024-12", body: "### React 19\ncontent" },
        { header: "Zod 4 — 2025", body: "### Zod 4\ncontent" },
      ],
    },
  ];

  test("filters by tag and header match", () => {
    const result = filterEntries(corrections, ["shadcn"]);
    expect(result).toHaveLength(1);
    expect(result[0].header).toBe("shadcn — 2025-10");
  });

  test("skips files with no tag overlap", () => {
    const result = filterEntries(corrections, ["django"]);
    expect(result).toEqual([]);
  });

  test("matches multiple entries across files", () => {
    const result = filterEntries(corrections, ["shadcn", "react"]);
    expect(result).toHaveLength(2);
  });
});

describe("buildMessage", () => {
  test("returns empty string for no entries", () => {
    expect(buildMessage([], [])).toBe("");
  });

  test("includes technical context header, topics, and skill note", () => {
    const entries = [
      {
        header: "shadcn — 2025-10",
        body: "### shadcn — 2025-10\n- Outdated: old",
      },
    ];
    const msg = buildMessage(entries, ["shadcn"]);
    expect(msg).toContain("[knowpatch] Technical context");
    expect(msg).toContain("topics: shadcn");
    expect(msg).toContain("### shadcn — 2025-10");
    expect(msg).toContain('Skill("knowpatch")');
  });

  test("joins multiple entries and lists all topics", () => {
    const entries = [
      { header: "A", body: "### A\n- content a" },
      { header: "B", body: "### B\n- content b" },
    ];
    const msg = buildMessage(entries, ["react", "zod"]);
    expect(msg).toContain("topics: react, zod");
    expect(msg).toContain("### A");
    expect(msg).toContain("### B");
  });
});

describe("loadCorrections (integration)", () => {
  test("loads real correction files and collects tags", () => {
    const correctionsDir = resolve(
      import.meta.dir,
      "../skills/knowpatch/corrections",
    );
    const corrections = loadCorrections(correctionsDir);
    expect(corrections.length).toBeGreaterThan(0);

    const allTags = corrections.flatMap((c) => c.tags);
    expect(allTags).toContain("shadcn");
    expect(allTags).toContain("react");
    expect(allTags).toContain("supabase");
  });

  test("tags can be used as keywords to find matching entries", () => {
    const correctionsDir = resolve(
      import.meta.dir,
      "../skills/knowpatch/corrections",
    );
    const corrections = loadCorrections(correctionsDir);
    const allTags = [...new Set(corrections.flatMap((c) => c.tags))];

    const keywords = findMatchedKeywords("setup shadcn project", allTags);
    expect(keywords).toContain("shadcn");

    const entries = filterEntries(corrections, keywords);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some((e) => e.header.toLowerCase().includes("shadcn"))).toBe(
      true,
    );
  });
});
