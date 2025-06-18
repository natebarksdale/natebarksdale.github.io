import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
  count?: number;
  lastUsed?: Date; // Add lastUsed property to track recency
}

const getUniqueTags = (
  posts: CollectionEntry<"blog">[],
  minCount = 0,
  sortByRecent = true
) => {
  const filteredPosts = posts.filter(postFilter);
  const tagOccurrences: Record<string, number> = {};
  const tagLastUsed: Record<string, Date> = {}; // Track the most recent date for each tag

  // Count occurrences of each tag and track most recent date
  filteredPosts.forEach(post => {
    // Convert the post date to a Date object
    const postDate = new Date(
      post.data.pubDatetime || post.data.pubDate || post.data.date || 0
    );

    post.data.tags?.forEach(tag => {
      // First strip emoji, then slugify, then convert to lowercase for consistency
      const slugTag = slugifyStr(tag).toLowerCase();
      tagOccurrences[slugTag] = (tagOccurrences[slugTag] || 0) + 1;

      // Update the last used date if this post is more recent
      if (!tagLastUsed[slugTag] || postDate > tagLastUsed[slugTag]) {
        tagLastUsed[slugTag] = postDate;
      }
    });
  });

  // Create tags array with count and lastUsed date
  const tags: Tag[] = filteredPosts
    .flatMap(post => post.data.tags || [])
    .map(tag => ({
      tag: slugifyStr(tag).toLowerCase(),
      tagName: tag,
      count: tagOccurrences[slugifyStr(tag).toLowerCase()] || 0,
      lastUsed: tagLastUsed[slugifyStr(tag).toLowerCase()] || new Date(0),
    }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .filter(tag => tag.count >= minCount); // Filter by minimum count if provided

  // Sort by most recent usage or alphabetically based on parameter
  if (sortByRecent) {
    tags.sort((tagA, tagB) => {
      // Sort by most recent date (descending)
      return (tagB.lastUsed?.getTime() || 0) - (tagA.lastUsed?.getTime() || 0);
    });
  } else {
    // Original alphabetical sort
    tags.sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  }

  return tags;
};

export default getUniqueTags;
