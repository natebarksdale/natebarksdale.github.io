/**
 * Wraps emojis in custom spans for better styling/font control
 *
 * @param text String to process
 * @returns String with emojis wrapped in <span class="emoji">
 */
export function wrapEmojis(text: string): string {
  // Comprehensive regex for emoji detection - matches full range of Unicode emojis
  const emojiRegex =
    /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Extended_Pictographic})/gu;

  return text.replace(emojiRegex, '<span class="emoji">$1</span>');
}

export default wrapEmojis;
