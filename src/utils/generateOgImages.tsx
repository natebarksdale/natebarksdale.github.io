import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import fs from "node:fs/promises";
import path from "node:path";

const fetchFonts = async () => {
  // DovesType Text Font - Load from local file system
  const dovesTypeWoff2Path = path.resolve(
    "./public/fonts/DovesType-Text.woff2"
  );
  const fauneDisplayBlackPath = path.resolve(
    "./public/fonts/Faune-Display_Black.woff"
  );

  // Read the font file contents
  const dovesTypeFont = await fs.readFile(dovesTypeWoff2Path);
  const fauneDisplayBlack = await fs.readFile(fauneDisplayBlackPath);

  // We'll still need a fallback font for non-English characters
  // Regular Font
  const fontFileRegular = await fetch(
    "https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf"
  );
  const fontRegular: ArrayBuffer = await fontFileRegular.arrayBuffer();

  return {
    dovesTypeFont,
    fauneDisplayBlack,
    fontRegular,
  };
};

const { dovesTypeFont, fauneDisplayBlack, fontRegular } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "DovesType",
      data: dovesTypeFont,
      weight: 400,
      style: "normal",
    },
    {
      name: "Faune",
      data: fauneDisplayBlack,
      weight: 900,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: fontRegular,
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
