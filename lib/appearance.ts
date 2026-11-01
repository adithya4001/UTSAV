export function readAppearance(): {
  theme: "light" | "dark";
  brightness: number;
  tutorialDone: boolean;
} {
  const defaults = {
    theme: "light" as const,
    brightness: 100,
    tutorialDone: false,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const value = JSON.parse(
      localStorage.getItem("utsavops-appearance") || "{}",
    ) as { theme?: unknown; brightness?: unknown };
    return {
      theme: value.theme === "dark" ? "dark" : "light",
      brightness: Math.max(70, Math.min(110, Number(value.brightness) || 100)),
      tutorialDone: localStorage.getItem("utsavops-tutorial") === "done",
    };
  } catch {
    return defaults;
  }
}
