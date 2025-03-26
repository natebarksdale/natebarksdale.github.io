/**
 * Simple utility to parse markdown links in text
 * Converts [link text](url) to <a href="url">link text</a>
 */
export function parseMarkdownLinks(text: string): string {
  if (!text) return "";

  // Regular expression to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  // Replace all markdown links with HTML anchor tags
  return text.replace(
    linkRegex,
    '<a href="$2" class="text-skin-accent hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );
}
