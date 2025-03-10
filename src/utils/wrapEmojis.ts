/**
 * Wraps emojis in custom spans for better styling/font control
 *
 * @param text String to process
 * @returns String with emojis wrapped in <span class="emoji">
 */
export function wrapEmojis(text: string): string {
  // More specific emoji regex that doesn't include digits
  const emojiRegex =
    /(\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)/gu;
  return text.replace(emojiRegex, '<span class="emoji">$1</span>');
}
export default wrapEmojis;
