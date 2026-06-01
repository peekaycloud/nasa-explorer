"use client";

import type { IconType } from "react-icons";
import {
  FaCloudBolt,
  FaFlask,
  FaGlobe,
  FaImage,
  FaMeteor,
  FaRocket,
  FaSatellite,
  FaSun,
} from "react-icons/fa6";
import { BiSolidPlanet } from "react-icons/bi";

import { cn } from "@/lib/utils";

/** NASA module icons — Font Awesome 6 + Bootstrap Icons (MIT / SIL OFL). */
export const SPACE_ICON_NAMES = [
  "rocket",
  "apod",
  "mars",
  "earth",
  "asteroid",
  "events",
  "weather",
  "satellite",
  "lab",
] as const;

export type SpaceIconName = (typeof SPACE_ICON_NAMES)[number];

const ICONS: Record<SpaceIconName, IconType> = {
  rocket: FaRocket,
  apod: FaImage,
  mars: BiSolidPlanet,
  earth: FaGlobe,
  asteroid: FaMeteor,
  events: FaCloudBolt,
  weather: FaSun,
  satellite: FaSatellite,
  lab: FaFlask,
};

const TONE_CLASS: Record<"accent" | "white" | "muted", string> = {
  accent: "text-[var(--matrix-green)]",
  white: "text-white",
  muted: "text-neutral-400",
};

export function SpaceIcon({
  name,
  size = 32,
  className,
  label,
  tone = "accent",
}: {
  name: SpaceIconName;
  size?: number;
  className?: string;
  label?: string;
  tone?: "accent" | "white" | "muted";
}) {
  const Icon = ICONS[name];

  return (
    <Icon
      size={size}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      className={cn(
        "shrink-0",
        name === "mars" ? "text-orange-500" : TONE_CLASS[tone],
        className
      )}
    />
  );
}

export function getModuleIcon(href: string): SpaceIconName {
  const map: Record<string, SpaceIconName> = {
    "/": "apod",
    "/mars": "mars",
    "/earth": "earth",
    "/asteroids": "asteroid",
    "/events": "events",
    "/weather": "weather",
    "/imagery": "satellite",
    "/patents": "lab",
  };
  return map[href] ?? "rocket";
}
