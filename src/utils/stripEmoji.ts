/**
 * Utility function to extract plain text from a tag by removing any emoji characters
 * and variation selectors at the beginning of the string.
 *
 * @param text The text to process
 * @returns The plain text with emoji removed
 */
export const stripEmoji = (text: string): string => {
  if (!text) return "";

  // First strip emoji and variation selectors at the beginning, then remove any spaces
  const plainText = text
    .replace(
      /^[\p{Emoji}\p{Emoji_Component}\p{Emoji_Modifier}\p{Emoji_Presentation}\u{FE00}-\u{FE0F}]+/gu,
      ""
    )
    .trim();

  // If the result is empty (e.g., the string was just an emoji), return the original
  return plainText || text;
};
