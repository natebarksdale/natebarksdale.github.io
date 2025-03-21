import { slug as slugger } from "github-slugger";

export const slugifyStr = (str: string) => {
  // First, strip out any emoji characters at the beginning of the string
  // This regex matches emoji characters at the start of the string
  const strippedEmoji = str.replace(
    /^[\p{Emoji}|\p{Emoji_Presentation}|\p{Extended_Pictographic}]+\s*/u,
    ""
  );

  // Now slugify the string
  const slugified = slugger(strippedEmoji);

  // Remove any leading hyphens
  return slugified.replace(/^-+/, "");
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
