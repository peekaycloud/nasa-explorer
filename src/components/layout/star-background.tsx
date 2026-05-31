"use client";

import { useMemo } from "react";
import Particles from "@tsparticles/react";
import { useParticlesProvider } from "@tsparticles/react";

export function StarBackground() {
  const { loaded } = useParticlesProvider();

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      particles: {
        color: { value: ["#ffffff", "#a5b4fc", "#818cf8"] },
        move: {
          enable: true,
          speed: 0.15,
          direction: "none" as const,
          random: true,
          straight: false,
        },
        number: {
          value: 120,
          density: { enable: true },
        },
        opacity: {
          value: { min: 0.1, max: 0.7 },
          animation: { enable: true, speed: 0.5, minimumValue: 0.1 },
        },
        size: {
          value: { min: 0.5, max: 2 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!loaded) return null;

  return (
    <Particles
      id="star-particles"
      className="pointer-events-none fixed inset-0 -z-10"
      options={options}
    />
  );
}
