import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TFTdle",
    short_name: "TFTdle",
    description: "Daily Standard and Wild TFT champion guessing games.",
    start_url: "/",
    display: "standalone",
    background_color: "#101722",
    theme_color: "#101722",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
