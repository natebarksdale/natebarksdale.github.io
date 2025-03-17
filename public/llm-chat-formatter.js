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
    const textContent = firstP.textContent.trim();

    // Match the format "{ChatGPT}" exactly as you showed
    const llmMatch = textContent.match(/^{([^}]+)}$/);

    if (llmMatch && llmMatch[1]) {
      const llmName = llmMatch[1].trim();
      blockquote.setAttribute("data-llm", llmName);

      // Create a header element for the LLM name
      const header = document.createElement("div");
      header.className = `llm-header llm-header-${llmName.toLowerCase()}`;
      header.textContent = llmName;

      // Remove the first paragraph with the LLM name
      firstP.remove();

      // Insert the header at the beginning of the blockquote
      blockquote.insertBefore(header, blockquote.firstChild);

      // Process remaining paragraphs for Q/A patterns
      blockquote.querySelectorAll("p").forEach(p => {
        const pText = p.textContent.trim();

        // Match the format "{Q}Text" or "{A}Text" exactly as shown in your example
        const qaMatch = pText.match(/^{([QA])}(.*)/);

        if (qaMatch) {
          const role = qaMatch[1];
          const content = qaMatch[2];

          p.setAttribute("data-role", role);

          // Remove the {Q} or {A} from the beginning
          p.innerHTML = p.innerHTML.replace(/^{[QA]}/, "");
        }
      });

      console.log(`Processed LLM chat: ${llmName}`);
    }
  });
}
