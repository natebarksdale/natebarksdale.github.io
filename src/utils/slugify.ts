import { slug as slugger } from "github-slugger";

import { stripEmoji } from "./stripEmoji";

export const slugifyStr = (str: string) => {
  if (!str) return "";

  // Extract plain text by removing emoji
  const plainText = stripEmoji(str);

  // Now slugify the plain text
  const slugified = slugger(plainText);

  // Remove any leading hyphens
  return slugified.replace(/^-+/, "");
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
