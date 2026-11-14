import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Madrasa Majmaul Bahrain Bijol",
    short_name: "MMBB Madrasa",
    description: "Official Madrasa Majmaul Bahrain Bijol app for students, parents and staff.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#ffffff",
    theme_color: "#064e3b",
    orientation: "portrait-primary",
    icons: [
      { src: "/pwa-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }
    ],
    categories: ["education"],
    lang: "en-IN"
  };
}
