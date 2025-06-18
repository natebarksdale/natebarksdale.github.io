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
    text: "Templeton",
    description:
      "The [John Templeton Foundation](https://www.templeton.org) exists to support interdisciplinary research and catalyze conversations that inspire awe and wonder, working to create a world where people are curious about the wonders of the universe, free to pursue lives of meaning and purpose, and motivated by great and selfless love. I've been a frequent contributer to their website and online newsletters since 2017.",
  },
  "culture-makingcom": {
    emoji: "🌍",
    text: "Culture Making",
    description:
      "From 2008 to 2012, I worked with my longtime mentor and collaborator Andy Crouch on Culture-Making.com, a link blog he launched in conjunction with his book. I was the lead writer for the site, posting links and commentary several times a week about the true, the beautiful, the interesting relating to human cultural output. The old site is on ice, but I’ve resurrected the bulk of my posts on this site.",
  },
  historycom: {
    emoji: "🇭",
    text: "History.com",
    description:
      "Since 2012, I've worked with editors, producers and executives at History Channel and History.com on various editorial and fact-checking projects, including bylined encyclopedia articles and behind-the-scenes work on editorial and visual fact-checking for website content and the occasional TV project. My largest single project with History was the (alas, now defunct) History Here app. I began as a copywriter but was soon assigned effective oversight of content strategy and implementation for the full app, writing about thousands of historic points of interest in the U.S. and ranking and assigning thousands more for other writers on the team. The app was twice nominated for a Webby Award, and [won in 2015](https://winners.webbyawards.com/2015/apps-dapps-and-software/handheld-devices/travel-handheld-devices/159568/history-here). ",
  },
  "what-comes-next_": {
    emoji: "➿",
    text: "What Comes Next_",
    description:
      "Thoughts on AI, predictive text, technological metaphors, and the string of thought.",
  },
  // Add more mappings as needed for other tag categories
};

export const SITE: Site = {
  website: "https://natebarksdale.xyz/", // replace this with your deployed domain
  author: "Nate Barksdale",
  desc: "I’m currently looking for new clients and partners for one-off or long-term projects spanning writing, editing, fact-checking, and exploring AI tools and use cases.",
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
