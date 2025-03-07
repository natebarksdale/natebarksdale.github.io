import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import fs from "node:fs/promises";
import path from "node:path";

const fetchFonts = async () => {
  try {
    // Load local TTF fonts - these should work reliably with Satori
    const fauneRegularPath = path.resolve(
      "./public/fonts/Faune-Text_Regular.ttf"
    );
    const fauneBoldPath = path.resolve("./public/fonts/Faune-Text_Bold.ttf");
    const fauneMonoPath = path.resolve("./public/fonts/Faune-Text_Regular.ttf"); // Using regular as mono fallback

    // Read font files
    const fauneRegular = await fs.readFile(fauneRegularPath);
    const fauneBold = await fs.readFile(fauneBoldPath);
    const fauneMono = await fs.readFile(fauneMonoPath);

    return {
      fauneRegular,
      fauneBold,
      fauneMono,
    };
  } catch (error) {
    console.error("Error loading local fonts:", error);

    // If local fonts fail, use a simple fallback
    try {
      // Try loading a reliable web font as fallback
      const fallbackFont = await fetch(
        "https://fonts.gstatic.com/s/sourcesanspro/v21/6xK3dSBYKcSV-LCoeQqfX1RYOo3aPw.ttf"
      ).then(res => res.arrayBuffer());

      return {
        fauneRegular: fallbackFont,
        fauneBold: fallbackFont,
        fauneMono: fallbackFont,
      };
    } catch (fallbackError) {
      console.error("Fallback font failed too:", fallbackError);

      // Empty buffers as last resort
      return {
        fauneRegular: new ArrayBuffer(0),
        fauneBold: new ArrayBuffer(0),
        fauneMono: new ArrayBuffer(0),
      };
    }
  }
};

const { fauneRegular, fauneBold, fauneMono } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Faune",
      data: fauneRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "Faune",
      data: fauneBold,
      weight: 700,
      style: "normal",
    },
    {
      name: "FauneMono",
      data: fauneMono,
      weight: 400,
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

// Function to fetch map background if coordinates are available
async function fetchMapBackground(post: CollectionEntry<"blog">) {
  if (!post.data.coordinates) return null;

  // Astro's environment variables are available through import.meta.env
  const mapboxToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) return null;

  // Format coordinates and create Mapbox static image URL
  const [lat, lon] = post.data.coordinates;
  const zoom = 8;
  const width = 1200;
  const height = 630;
  const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lon},${lat},${zoom},0,0/${width}x${height}?access_token=${mapboxToken}`;

  try {
    const response = await fetch(mapUrl);
    if (!response.ok) return null;

    const mapImageBuffer = await response.arrayBuffer();
    // Convert ArrayBuffer to Base64 string
    const mapImageBase64 = Buffer.from(mapImageBuffer).toString("base64");
    return `data:image/png;base64,${mapImageBase64}`;
  } catch (error) {
    console.error("Error fetching map background:", error);
    return null;
  }
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  // Get map background if coordinates are available
  const mapBackground = post.data.coordinates
    ? await fetchMapBackground(post)
    : null;

  const svg = await satori(postOgImage(post, mapBackground), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options);
  return svgBufferToPngBuffer(svg);
}
