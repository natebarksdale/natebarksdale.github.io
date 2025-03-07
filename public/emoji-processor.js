// Global Emoji Processor - Enhanced Debug Version
// This script handles proper styling and rendering of emoji characters in headings and other elements
(function () {
  // Create a debug logger that can be toggled
  const DEBUG = true;
  const log = (...args) => {
    if (DEBUG) console.log("[EmojiProcessor]", ...args);
  };

  // Different emoji detection methods
  const DETECTION_METHODS = {
    // Unicode property escapes for emoji
    unicodeProperty: /^(\p{Emoji}+)/u,
    // Extended pictographic (more comprehensive)
    extendedPictographic: /^(\p{Extended_Pictographic}+)/u,
    // Specific emoji ranges
    specificRanges: /^([\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}]+)/u,
    // Fallback with common emojis
    fallback: /^([🏺🌍📚🧠💭🔬🎓✍️📜🕰️📖]+)/,
  };

  function detectEmoji(text) {
    log("Trying to detect emoji in:", text);

    // Try each detection method
    for (const [methodName, regex] of Object.entries(DETECTION_METHODS)) {
      const match = text.match(regex);
      if (match && match[1]) {
        log(`Emoji detected using ${methodName}:`, match[1]);
        return {
          emoji: match[1],
          text: text.slice(match[1].length).trim(),
        };
      }
    }

    log("No emoji detected");
    return null;
  }

  function processElement(element) {
    if (!element) {
      log("No element provided to process");
      return;
    }

    // Log the element for debugging
    log(
      "Processing element:",
      element.tagName,
      element.id ? `#${element.id}` : "",
      element.textContent
    );

    // Get the content
    const content = element.textContent || "";
    // Skip if empty content
    if (!content.trim()) {
      log("Empty content, skipping");
      return;
    }

    // Try to detect emoji
    const result = detectEmoji(content);
    if (!result) {
      log("No emoji found in element content");
      return;
    }

    // Log the detected emoji
    log(`Found emoji: "${result.emoji}" followed by text: "${result.text}"`);

    try {
      // Store original attributes
      const attribs = {};
      Array.from(element.attributes).forEach(attr => {
        attribs[attr.name] = attr.value;
      });

      // Create a new element to replace the old one to avoid transition scope issues
      const newElement = document.createElement(element.tagName);

      // Copy all attributes
      Object.entries(attribs).forEach(([name, value]) => {
        newElement.setAttribute(name, value);
      });

      // Create emoji span
      const emojiSpan = document.createElement("span");
      emojiSpan.className = "emoji";
      emojiSpan.textContent = result.emoji;
      log("Created emoji span with class 'emoji'");

      // Apply styling directly to ensure it takes effect
      emojiSpan.style.cssText = `
        float: left;
        margin-left: -1.75em; 
        margin-right: 0.25em;
        color: rgba(0,0,0,0.25);
        font-size: 1.5em;
        font-family: 'Noto Emoji', sans-serif;
      `;

      // Add the emoji span and remaining text
      newElement.appendChild(emojiSpan);
      newElement.appendChild(document.createTextNode(result.text));

      // Replace the original element
      if (element.parentNode) {
        element.parentNode.replaceChild(newElement, element);
        log("Successfully replaced element with emoji-wrapped version");
      } else {
        log("Element has no parent, cannot replace");
      }
    } catch (error) {
      log("Error during emoji processing:", error);
    }
  }

  function processAllEmojis() {
    log("Starting emoji processing");

    // Process tag title specifically (high priority)
    const tagTitle = document.getElementById("tag-title");
    if (tagTitle) {
      log("Found #tag-title element, processing with high priority");
      processElement(tagTitle);
    } else {
      log("No #tag-title element found");
    }

    // Process all headings
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    log(`Found ${headings.length} heading elements to process`);

    headings.forEach(heading => {
      // Skip if it's the tag title (already processed)
      if (heading.id === "tag-title") return;
      processElement(heading);
    });

    log("Emoji processing complete");
  }

  // Process on initial load
  function init() {
    log("Initializing emoji processor");
    setTimeout(processAllEmojis, 300); // Increased delay for better reliability
  }

  // Register events
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
    log("Registered DOMContentLoaded handler");
  } else {
    log("Document already loaded, initializing immediately");
    init();
  }

  // Handle Astro view transitions
  document.addEventListener("astro:after-swap", function () {
    log("View transition detected (astro:after-swap)");
    setTimeout(processAllEmojis, 300);
  });

  // Also try on window load as a fallback
  window.addEventListener("load", function () {
    log("Window load event triggered");
    setTimeout(processAllEmojis, 300);
  });

  // Expose the processor to the global scope for debugging
  window.emojiProcessor = {
    process: processAllEmojis,
    debug: function () {
      return {
        tagTitle:
          document.getElementById("tag-title")?.textContent || "Not found",
        headings: Array.from(
          document.querySelectorAll("h1, h2, h3, h4, h5, h6")
        ).map(el => ({
          tagName: el.tagName,
          id: el.id,
          content: el.textContent,
          hasEmoji: detectEmoji(el.textContent || "") !== null,
        })),
      };
    },
  };

  log("Emoji processor setup complete");
})();
