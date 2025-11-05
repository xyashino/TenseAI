import type { TenseName } from "@/types";

export const TENSE_ICONS: Record<TenseName, string> = {
  "Present Simple": "🎯",
  "Past Simple": "⏮️",
  "Present Perfect": "✅",
  "Future Simple": "🔮",
};

export function getTenseIcon(tense: TenseName): string {
  return TENSE_ICONS[tense];
}

export function getTenseSlug(tense: TenseName): string {
  return tense.toLowerCase().replace(/\s+/g, "-");
}
