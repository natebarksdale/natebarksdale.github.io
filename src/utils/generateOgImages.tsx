import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
const fetchFonts = async () => {
  try {
    // Load reliable Google Fonts with direct TTF links
    const regularFont = await fetch(
      "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3i54rwlxdu.ttf"
    ).then(res => res.arrayBuffer());

    const boldFont = await fetch(
      "https://fonts.gstatic.com/s/sourcesanspro/v22/6xKydSBYKcSV-LCoeQqfX1RYOo3ig4vwlxdu.ttf"
    ).then(res => res.arrayBuffer());

    const monoFont = await fetch(
      "https://fonts.gstatic.com/s/robotomono/v22/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vq_ROW4.ttf"
    ).then(res => res.arrayBuffer());

    console.log("Successfully loaded web fonts");
    return { regularFont, boldFont, monoFont };
  } catch (error) {
    console.error("Error loading web fonts:", error);

    // Empty buffers as last resort
    return {
      regularFont: new ArrayBuffer(0),
      boldFont: new ArrayBuffer(0),
      monoFont: new ArrayBuffer(0),
    };
  }
};

const { regularFont, boldFont, monoFont } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Source Sans Pro",
      data: regularFont,
      weight: 400,
      style: "normal",
    },
    {
      name: "Source Sans Pro",
      data: boldFont,
      weight: 700,
      style: "normal",
    },
    {
      name: "Roboto Mono",
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
