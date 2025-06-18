// Quote Formatter - Automatically formats quote attributions
// This script finds lines starting with em dash (—) and applies styling

document.addEventListener("DOMContentLoaded", function () {
  // Process all paragraphs and blockquotes
  function processQuoteAttributions() {
    // Select all paragraphs in prose areas, including those in blockquotes
    const paragraphs = document.querySelectorAll(
      ".prose p, .prose blockquote p"
    );

    paragraphs.forEach(paragraph => {
      const html = paragraph.innerHTML;

      // Check if the paragraph starts with an em dash
      if (html.trim().startsWith("—") || html.trim().startsWith("&mdash;")) {
        // Replace the em dash text with a span that has the attribution marker
        paragraph.innerHTML = html.replace(
          /^(\s*)(&mdash;|—)(.+)$/,
          '$1<span data-quote-attribution="true">$2$3</span>'
        );

        console.log("Formatted quote attribution:", paragraph.textContent);
      }
    });
  }

  // Run on initial load
  processQuoteAttributions();

  // Run when view transitions occur
  document.addEventListener("astro:after-swap", function () {
    setTimeout(processQuoteAttributions, 300);
  });
});
