document.addEventListener("DOMContentLoaded", function () {
  // Process LLM chat blockquotes
  function processLLMChatBlockquotes() {
    const blockquotes = document.querySelectorAll("blockquote");

    blockquotes.forEach(blockquote => {
      const firstLine = blockquote.innerHTML
        .trim()
        .match(/^<p>\s*>\s*{([^}]+)}/);

      if (firstLine && firstLine[1]) {
        const llmName = firstLine[1];
        blockquote.setAttribute("data-llm", llmName);

        // Remove the first line (LLM indicator)
        blockquote.innerHTML = blockquote.innerHTML.replace(
          /^<p>\s*>\s*{[^}]+}<\/p>/,
          ""
        );

        // Process the content
        const paragraphs = blockquote.querySelectorAll("p");
        paragraphs.forEach(p => {
          const content = p.innerHTML;
          const roleMatch = content.match(/^\s*>\s*{([QA])}\s*(.*)/);

          if (roleMatch) {
            const role = roleMatch[1];
            const text = roleMatch[2];

            p.setAttribute("data-role", role);
            p.innerHTML = text;
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
