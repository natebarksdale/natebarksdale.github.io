import { slug as slugger } from "github-slugger";

export const slugifyStr = (str: string) => {
  const slugified = slugger(str);
  // Remove any leading hyphens (common with emoji tags like "😃 Title" -> "-title")
  return slugified.replace(/^-+/, "");
};

export const slugifyAll = (arr: string[]) => arr.map(str => slugifyStr(str));
