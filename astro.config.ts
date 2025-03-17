import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";
import { remarkLLMChat } from "./src/utils/remarkLLMChat.mjs";

const MAPBOX_ACCESS_TOKEN = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;
const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(33.9734,28.5418)/33.9734,28.5418,14,0,0/800x400?access_token=${MAPBOX_ACCESS_TOKEN}`;

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
    sitemap(),
  ],
  markdown: {
    smartypants: true,
    remarkPlugins: [
      remarkToc,
      remarkLLMChat,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-light",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
