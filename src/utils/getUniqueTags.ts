import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
  count?: number;
}

const getUniqueTags = (posts: CollectionEntry<"blog">[], minCount = 0) => {
  const filteredPosts = posts.filter(postFilter);
  const tagOccurrences: Record<string, number> = {};

  // Count occurrences of each tag
  filteredPosts.forEach(post => {
    post.data.tags?.forEach(tag => {
      const slugTag = slugifyStr(tag);
      tagOccurrences[slugTag] = (tagOccurrences[slugTag] || 0) + 1;
    });
  });

  const tags: Tag[] = filteredPosts
    .flatMap(post => post.data.tags || [])
    .map(tag => ({
      tag: slugifyStr(tag),
      tagName: tag,
      count: tagOccurrences[slugifyStr(tag)] || 0,
    }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .filter(tag => tag.count >= minCount) // Filter by minimum count if provided
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));

  return tags;
};

export default getUniqueTags;
