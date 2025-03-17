document.addEventListener("DOMContentLoaded", function () {
  // Process LLM chat blockquotes
  function processLLMChatBlockquotes() {
    const blockquotes = document.querySelectorAll("blockquote");

    blockquotes.forEach(blockquote => {
      // Check if the first paragraph contains an LLM identifier
      const paragraphs = blockquote.querySelectorAll("p");
      if (paragraphs.length === 0) return;

      const firstParagraph = paragraphs[0];
      const llmMatch = firstParagraph.textContent.match(/^>\s*{([^}]+)}\s*$/);

      if (llmMatch && llmMatch[1]) {
        const llmName = llmMatch[1];
        blockquote.setAttribute("data-llm", llmName);

        // Remove the first paragraph (LLM indicator)
        firstParagraph.remove();

        // Process the remaining paragraphs for Q/A format
        blockquote.querySelectorAll("p").forEach(p => {
          const content = p.textContent;
          const roleMatch = content.match(/^>\s*{([QA])}\s*(.*)$/);

          if (roleMatch) {
            const role = roleMatch[1];
            const text = roleMatch[2];

            p.setAttribute("data-role", role);
            p.textContent = text; // Use textContent to preserve any HTML inside

            // If there's HTML content, we need to parse it back
            if (roleMatch[2].includes("<") && roleMatch[2].includes(">")) {
              p.innerHTML = text;
            }
          }
        });
      }
    });
  }

  // Run the processor
  processLLMChatBlockquotes();

  // Re-run after any client-side navigation or updates
  document.addEventListener("astro:page-load", processLLMChatBlockquotes);
});
