import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import fs from "fs";
import path from "path";

const fetchFonts = async () => {
  // Define paths to local font files
  const fontRegularPath = path.resolve("./public/fonts/Faune-Text_Regular.ttf");
  const fontBoldPath = path.resolve("./public/fonts/Faune-Display_Black.ttf");

  // Read font files
  const fontRegularBuffer = fs.readFileSync(fontRegularPath);
  const fontBoldBuffer = fs.readFileSync(fontBoldPath);

  // Convert Buffer to ArrayBuffer
  const fontRegular = fontRegularBuffer.buffer.slice(
    fontRegularBuffer.byteOffset,
    fontRegularBuffer.byteOffset + fontRegularBuffer.byteLength
  );

  const fontBold = fontBoldBuffer.buffer.slice(
    fontBoldBuffer.byteOffset,
    fontBoldBuffer.byteOffset + fontBoldBuffer.byteLength
  );

  return { fontRegular, fontBold };
};

const { fontRegular, fontBold } = await fetchFonts();

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "Faune", // Updated font name to match your font
      data: fontRegular,
      weight: 400,
      style: "italic",
    },
    {
      name: "Faune", // Updated font name to match your font
      data: fontBold,
      weight: 900, // Assuming "Display_Black" is weight 900 or similar
      style: "normal",
    },
  ],
};

function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await satori(postOgImage(post), options);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await satori(siteOgImage(), options);
  return svgBufferToPngBuffer(svg);
}
