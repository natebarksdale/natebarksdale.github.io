import type { Site, SocialObjects } from "./types";

// Interface for tag data
export interface TagData {
  emoji: string;
  text: string;
  description?: string;
}

// Define a centralized tag data map with descriptions
export const tagDataMap: Record<string, TagData> = {
  templeton: {
    emoji: "🌀",
    text: "The John Templeton Foundation",
    description:
      "The John Templeton Foundation exists to support interdisciplinary research and catalyze conversations that inspire awe and wonder, working to create a world where people are curious about the wonders of the universe, free to pursue lives of meaning and purpose, and motivated by great and selfless love. I've been a frequent contributer to their website and online newsletters since 2017.",
  },
  technology: {
    emoji: "⚙️",
    text: "Technology",
    description:
      "Posts examining the interplay between technological innovation and human culture, focusing on both historical and contemporary perspectives.",
  },
  travel: {
    emoji: "✈️",
    text: "Travel",
    description:
      "Journeys across continents and cultures, with observations on local customs, architecture, food, and the human experience of place.",
  },
  history: {
    emoji: "📜",
    text: "History",
    description:
      "Delving into lesser-known historical narratives, moments of cultural significance, and the threads that connect past to present.",
  },
  art: {
    emoji: "🎨",
    text: "Art",
    description:
      "Reflections on visual art, music, literature and other creative expressions across cultures and time periods.",
  },
  // Add more mappings as needed for other tag categories
};

export const SITE: Site = {
  website: "https://natebarksdale.github.io/", // replace this with your deployed domain
  author: "Nate Barksdale",
  desc: "Nate Barksdale Writing + Design",
  title: "Nate Barksdale Writing + Design",
  ogImage: "natebarksdale-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 50,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/natebarksdale",
    linkTitle: ` ${SITE.title} on Github`,
    active: false,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/nate-barksdale-57674a31/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:info@natebarksdale.xyz",
    linkTitle: `Send an email to ${SITE.title}`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitter`,
    active: false,
  },
  {
    name: "Twitch",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Twitch`,
    active: false,
  },
  {
    name: "YouTube",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on YouTube`,
    active: false,
  },
  {
    name: "WhatsApp",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on WhatsApp`,
    active: false,
  },
  {
    name: "Snapchat",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Snapchat`,
    active: false,
  },
  {
    name: "Pinterest",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Pinterest`,
    active: false,
  },
  {
    name: "TikTok",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on TikTok`,
    active: false,
  },
  {
    name: "CodePen",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on CodePen`,
    active: false,
  },
  {
    name: "Discord",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Discord`,
    active: false,
  },
  {
    name: "GitLab",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on GitLab`,
    active: false,
  },
  {
    name: "Reddit",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
  {
    name: "Skype",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Skype`,
    active: false,
  },
  {
    name: "Steam",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Steam`,
    active: false,
  },
  {
    name: "Telegram",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Telegram`,
    active: false,
  },
  {
    name: "Mastodon",
    href: "https://github.com/satnaing/astro-paper",
    linkTitle: `${SITE.title} on Mastodon`,
    active: false,
  },
  {
    name: "Bluesky",
    href: "https://bsky.app/profile/nblinks.bsky.social",
    linkTitle: `nblinks.bsky.social on Bluesky`,
    active: true,
  },
];
