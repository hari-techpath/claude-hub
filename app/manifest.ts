import { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Claude Hub",
    short_name: "ClaudeHub",
    description: "Claude resources for data professionals",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
