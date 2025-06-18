import type { CollectionEntry } from "astro:content";
import getSortedPosts from "./getSortedPosts";
import { slugifyAll } from "./slugify";

const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  getSortedPosts(
    posts.filter(post => {
      // Convert both the post tags and the search tag to lowercase for case-insensitive comparison
      const slugTags = slugifyAll(post.data.tags).map(t => t.toLowerCase());
      return slugTags.includes(tag.toLowerCase());
    })
  );

export default getPostsByTag;
