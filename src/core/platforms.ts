export interface PlatformConfig {
  id: string;
  displayName: string;
  configDir: string;
  skillsSubpath: string;
  supportsHooks: boolean;
  hookType: "claude-settings-json" | "none";
}

export const PLATFORMS: readonly PlatformConfig[] = [
  {
    id: "claude",
    displayName: "Claude Code",
    configDir: ".claude",
    skillsSubpath: "skills/knowpatch",
    supportsHooks: true,
    hookType: "claude-settings-json",
  },
  {
    id: "codex",
    displayName: "Codex",
    configDir: ".codex",
    skillsSubpath: "skills/knowpatch",
    supportsHooks: false,
    hookType: "none",
  },
  {
    id: "gemini",
    displayName: "Gemini CLI",
    configDir: ".gemini",
    skillsSubpath: "skills/knowpatch",
    supportsHooks: false,
    hookType: "none",
  },
] as const;
