import type { TenseName } from "@/types";

export function getTenseSlug(tense: TenseName) {
  return tense.toLowerCase().replace(/\s+/g, "-");
}
