import type { CollectionEntry } from "astro:content";
import postFilter from "./postFilter";

/**
 * Get random archive posts that are not featured or recent
 * @param allPosts All blog posts
 * @param featuredPosts Featured posts to exclude
 * @param recentPosts Recent posts to exclude
 * @param count Number of archive posts to return
 * @returns Array of random archive posts
 */
const getRandomArchivePosts = (
  allPosts: CollectionEntry<"blog">[],
  featuredPosts: CollectionEntry<"blog">[],
  recentPosts: CollectionEntry<"blog">[],
  count: number = 4
): CollectionEntry<"blog">[] => {
  // Get all eligible posts (not featured or in recent posts)
  const featuredSlugs = new Set(featuredPosts.map(post => post.slug));
  const recentSlugs = new Set(recentPosts.slice(0, 4).map(post => post.slug));

  const eligiblePosts = allPosts
    .filter(postFilter)
    .filter(
      post => !featuredSlugs.has(post.slug) && !recentSlugs.has(post.slug)
    );

  // If no eligible posts, return empty array
  if (eligiblePosts.length === 0) return [];

  // Shuffle the eligible posts
  const shuffled = [...eligiblePosts].sort(() => 0.5 - Math.random());

  // Return the requested number of posts (or all if fewer are available)
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default getRandomArchivePosts;
