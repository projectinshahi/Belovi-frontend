import {
  Ban,
  CircleSlash,
  CloudSun,
  DropletOff,
  Hand,
  Layers,
  Sparkles,
  ThermometerSnowflake,
  ThermometerSun,
  WashingMachine,
  type LucideIcon,
} from "lucide-react";

/**
 * The closed care vocabulary. Mirrors `CARE_ICONS` in the backend's
 * src/models/Product.ts, which is the source of truth (the schema enums on it).
 * Keep the two lists identical — the admin writes these keys, the storefront
 * renders them, and anything the backend accepts must have a row in the map below.
 */
export const CARE_ICONS = [
  "hand-wash",
  "machine-wash",
  "dont-bleach",
  "iron-low",
  "iron-medium",
  "dont-iron",
  "dry-in-shade",
  "dry-flat",
  "dont-tumble-dry",
  "dry-clean",
] as const;

export type CareIcon = (typeof CARE_ICONS)[number];

/**
 * One row per care symbol: the mark we draw and the caption beneath it.
 *
 * Typed as a total `Record<CareIcon, …>` on purpose — adding a key to
 * `CARE_ICONS` without giving it an icon and caption is a type error, so the
 * storefront can't silently drop a symbol the admin is already offering.
 *
 * Lucide has no laundry-symbol set, so these are readable stand-ins: heat marks
 * for iron temperatures, a struck droplet for bleach, a slash for prohibitions.
 * The caption is what actually carries the meaning; the icon is the glance.
 */
export const CARE_ICON_MAP: Record<CareIcon, { icon: LucideIcon; caption: string }> = {
  "hand-wash": { icon: Hand, caption: "Hand Wash" },
  "machine-wash": { icon: WashingMachine, caption: "Machine Wash" },
  "dont-bleach": { icon: DropletOff, caption: "Don't Bleach" },
  "iron-low": { icon: ThermometerSnowflake, caption: "Iron Low" },
  "iron-medium": { icon: ThermometerSun, caption: "Iron Medium" },
  "dont-iron": { icon: CircleSlash, caption: "Don't Iron" },
  "dry-in-shade": { icon: CloudSun, caption: "Dry in Shade" },
  "dry-flat": { icon: Layers, caption: "Dry Flat" },
  "dont-tumble-dry": { icon: Ban, caption: "Don't Tumble Dry" },
  "dry-clean": { icon: Sparkles, caption: "Dry Clean" },
};

/** Narrow an arbitrary backend string to a known care key (older rows may hold anything). */
export function isCareIcon(value: unknown): value is CareIcon {
  return typeof value === "string" && (CARE_ICONS as readonly string[]).includes(value);
}
