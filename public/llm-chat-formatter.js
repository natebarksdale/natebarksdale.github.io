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
    const paragraphs = blockquote.querySelectorAll("p");
    if (!paragraphs.length) return;

    // Try to find an LLM identifier in the first paragraph
    const firstP = paragraphs[0];
    if (!firstP.textContent.startsWith(">{")) return;

    // Extract LLM name
    const llmNameMatch = firstP.textContent.match(/^>{([^}]+)}/);
    if (!llmNameMatch) return;

    const llmName = llmNameMatch[1].trim();
    blockquote.setAttribute("data-llm", llmName);

    // Remove the first paragraph with LLM name
    firstP.remove();

    // Process all paragraphs for Q/A markers
    blockquote.querySelectorAll("p").forEach(p => {
      // Look for Q/A markers at start of paragraph
      const qaMatch = p.textContent.match(/^>{([QA])}\s*(.*)/);
      if (qaMatch) {
        const role = qaMatch[1];
        const originalHTML = p.innerHTML;

        // Set the role attribute
        p.setAttribute("data-role", role);

        // Replace the >{X} marker in the HTML
        const markerRegex = /^>{[QA]}\s*/;
        p.innerHTML = originalHTML.replace(markerRegex, "");
      }
    });
  });
}
