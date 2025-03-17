// public/llm-chat-formatter.js
document.addEventListener("DOMContentLoaded", function () {
  processLLMChats();

  // Re-run on page transitions if using Astro's view transitions
  document.addEventListener("astro:page-load", processLLMChats);
});

function processLLMChats() {
  // Find all blockquotes
  const blockquotes = document.querySelectorAll("blockquote");

  blockquotes.forEach(blockquote => {
    // Get all paragraphs
    const paragraphs = blockquote.querySelectorAll("p");
    if (!paragraphs.length) return;

    // Check first paragraph for LLM identifier pattern
    const firstP = paragraphs[0];

    // The > character might be rendered as &gt; or > depending on the markdown processor
    // So we check for both possibilities
    const textContent = firstP.textContent.trim();
    const htmlContent = firstP.innerHTML.trim();

    // Try different pattern matches for the LLM identifier
    const llmMatch =
      textContent.match(/^>{([^}]+)}$/) ||
      textContent.match(/^>\s*{([^}]+)}$/) ||
      htmlContent.match(/^&gt;{([^}]+)}$/) ||
      htmlContent.match(/^&gt;\s*{([^}]+)}$/);

    if (llmMatch && llmMatch[1]) {
      const llmName = llmMatch[1].trim();
      blockquote.setAttribute("data-llm", llmName);

      // Remove the first paragraph with the LLM name
      firstP.remove();

      // Process remaining paragraphs for Q/A patterns
      blockquote.querySelectorAll("p").forEach(p => {
        const pText = p.textContent.trim();
        const pHtml = p.innerHTML.trim();

        // Check for Q/A patterns with various possible formats
        const qaMatch =
          pText.match(/^>{([QA])}(.*)/) ||
          pText.match(/^>\s*{([QA])}\s*(.*)/) ||
          pHtml.match(/^&gt;{([QA])}(.*)/) ||
          pHtml.match(/^&gt;\s*{([QA])}\s*(.*)/);

        if (qaMatch) {
          const role = qaMatch[1];
          p.setAttribute("data-role", role);

          // Replace the marker in the HTML content
          if (pHtml.includes("&gt;")) {
            p.innerHTML = p.innerHTML.replace(/^&gt;\s*{[QA]}\s*/, "");
          } else {
            p.innerHTML = p.innerHTML.replace(/^>\s*{[QA]}\s*/, "");
          }
        }
      });

      // Add debug info if needed (remove this in production)
      console.log(`Processed LLM chat: ${llmName}`);
    }
  });
}
