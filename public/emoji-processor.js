// Global Emoji Processor
// This script handles proper styling and rendering of emoji characters in headings and other elements
document.addEventListener("DOMContentLoaded", function () {
  // Process all heading elements that might contain emojis
  function processEmojis() {
    // First, let's handle specific tag page titles
    const tagTitleElement = document.getElementById("tag-title");
    if (tagTitleElement) {
      processTagHeading(tagTitleElement);
    }

    // Process all heading elements with emojis
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach(heading => {
      const text = heading.textContent || "";
      // Regex to detect emoji at the start of the string
      const emojiRegex = /^(\p{Emoji}+)/u;
      const match = text.match(emojiRegex);

      if (match && match[1]) {
        wrapEmoji(heading, match[1], text.slice(match[1].length).trim());
      }
    });

    console.log("Global emoji processing complete");
  }

  // Process a specific tag heading
  function processTagHeading(element) {
    if (!element) return;

    const titleText = element.textContent || "";
    const emojiRegex = /^(\p{Emoji}+)/u;
    const match = titleText.match(emojiRegex);

    if (match && match[1]) {
      const emoji = match[1];
      const text = titleText.slice(emoji.length).trim();
      wrapEmoji(element, emoji, text);
      console.log("Processed tag title emoji:", emoji, "and text:", text);
    }
  }

  // Helper function to wrap emoji in a styled span
  function wrapEmoji(element, emoji, text) {
    // Clear current content
    element.innerHTML = "";

    // Add the emoji in a styled span
    const emojiSpan = document.createElement("span");
    emojiSpan.className = "emoji";
    emojiSpan.textContent = emoji;

    // Apply the styling only if it's an h1-h6 element
    if (/^h[1-6]$/i.test(element.tagName)) {
      emojiSpan.style.cssText =
        "float: left; margin-left: -1.75em; margin-right: -0.5em; color: rgba(0,0,0,0.2); font-size: 1.5em;";
    }

    // Add the emoji and remaining text
    element.appendChild(emojiSpan);
    element.appendChild(document.createTextNode(text));
  }

  // Run the processor after a slight delay to ensure the DOM is fully ready
  setTimeout(processEmojis, 100);

  // Also run the processor after ViewTransitions navigate
  document.addEventListener("astro:after-swap", function () {
    setTimeout(processEmojis, 100);
  });
});
