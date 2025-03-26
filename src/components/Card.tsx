import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, description, emoji, haiku } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "font-medium hover:fancyunderline",
  };

  return (
    <li className="mb-6">
      <a
        href={href}
        title={haiku}
        className="inline-block text-xl font-medium text-skin-accent focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>
            <span class="emoji">{emoji}</span>
            {title}
          </h2>
        ) : (
          <h3 {...headerProps}>
            <span class="emoji">{emoji}</span>
            {title}
          </h3>
        )}
      </a>
      <p>{description}</p>
    </li>
  );
}
