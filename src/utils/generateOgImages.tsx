import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

const fetchFonts = async () => {
  // Instead of local WOFF/WOFF2 files, use TTF files from Google Fonts or other CDNs
  // These are specifically supported by Satori

  // Serif font (instead of DovesType, which has compatibility issues)
  const serifFontRegular = await fetch(
    "https://fonts.cdnfonts.com/s/18783/LibreBaskerville-Regular.woff"
  ).then(res => res.arrayBuffer());

  // Bold font for headers
  const serifFontBold = await fetch(
    "https://fonts.cdnfonts.com/s/18783/LibreBaskerville-Bold.woff"
  ).then(res => res.arrayBuffer());

  // Monospace font (for coordinate display)
  const monoFont = await fetch(
    "https://www.1001fonts.com/download/font/ibm-plex-mono.regular.ttf"
  ).then(res => res.arrayBuffer());

  return {
    serifFontRegular,
    serifFontBold,
    monoFont,
  };
};

const { serifFontRegular, serifFontBold, monoFont } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Libre Baskerville",
      data: serifFontRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "Libre Baskerville",
      data: serifFontBold,
      weight: 700,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: monoFont,
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
