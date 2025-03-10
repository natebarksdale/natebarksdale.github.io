export function wrapEmojis(text: string): string {
  const emojiRegex =
    /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Extended_Pictographic})/gu;

  return text.replace(emojiRegex, match => {
    // Skip wrapping if the match is just a digit
    if (/^[0-9]$/.test(match)) {
      return match;
    }
    return `<span class="emojii">${match}</span>`;
  });
}
