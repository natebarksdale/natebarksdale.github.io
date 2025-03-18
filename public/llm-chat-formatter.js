// Enhanced llm-chat-formatter.js with better code block handling
document.addEventListener("DOMContentLoaded", function () {
  processLLMChats();

  // Re-run on page transitions if using Astro's view transitions
  document.addEventListener("astro:page-load", processLLMChats);
});

function processLLMChats() {
  // Find all blockquotes
  const blockquotes = document.querySelectorAll("blockquote");

  blockquotes.forEach(blockquote => {
    // Skip if already processed
    if (blockquote.hasAttribute("data-processed")) return;

    // Get all paragraphs
    const paragraphs = blockquote.querySelectorAll("p");
    if (!paragraphs.length) return;

    // Check first paragraph for LLM identifier pattern
    const firstP = paragraphs[0];
    const textContent = firstP.textContent.trim();

    // Match the format "{ChatGPT}" exactly
    const llmMatch = textContent.match(/^{([^}]+)}$/);

    let hasQAFormat = false;

    // Check if any paragraph has Q/A format
    for (let i = 0; i < paragraphs.length; i++) {
      const pText = paragraphs[i].textContent.trim();
      if (pText.match(/^{[QA]}/)) {
        hasQAFormat = true;
        break;
      }
    }

    if (llmMatch && llmMatch[1]) {
      // Process specified LLM format
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

      // Process Q/A format
      processQAFormat(blockquote);

      console.log(`Processed LLM chat: ${llmName}`);
    } else if (hasQAFormat) {
      // Generic LLM style
      blockquote.setAttribute("data-llm", "Generic");

      // Create a header for Generic LLM
      const header = document.createElement("div");
      header.className = "llm-header llm-header-generic";
      header.textContent = "Chat";

      // Insert the header at the beginning of the blockquote
      blockquote.insertBefore(header, blockquote.firstChild);

      // Process Q/A format
      processQAFormat(blockquote);

      console.log("Processed Generic LLM chat");
    }

    // Mark as processed to avoid repeated processing
    blockquote.setAttribute("data-processed", "true");
  });
}

// Process Q/A format with improved code block handling
function processQAFormat(blockquote) {
  const paragraphs = Array.from(blockquote.querySelectorAll("p"));

  let currentRole = null;

  // First pass: identify roles
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const text = p.textContent.trim();

    // Check for Q/A markers
    const qaMatch = text.match(/^{([QA])}/);

    if (qaMatch) {
      // New Q/A section
      currentRole = qaMatch[1];
      p.setAttribute("data-role", currentRole);

      // Remove the {Q} or {A} prefix
      p.innerHTML = p.innerHTML.replace(/^{[QA]}/, "").trim();
    }
  }

  // Second pass: ensure code blocks are inside their parent Q/A paragraph
  const codeBlocks = blockquote.querySelectorAll("pre");

  codeBlocks.forEach(codeBlock => {
    const parentP = codeBlock.closest("p");

    // If code block's parent doesn't have a role, it might be a standalone block
    if (parentP && !parentP.hasAttribute("data-role")) {
      // Find the nearest preceding paragraph with a role
      let prevSibling = parentP.previousElementSibling;
      while (prevSibling && !prevSibling.hasAttribute("data-role")) {
        prevSibling = prevSibling.previousElementSibling;
      }

      if (prevSibling) {
        const role = prevSibling.getAttribute("data-role");

        // Move this code block into the previous role paragraph
        prevSibling.appendChild(document.createElement("br"));
        prevSibling.appendChild(codeBlock);

        // Remove the now-empty paragraph
        if (parentP.textContent.trim() === "") {
          parentP.remove();
        }
      }
    }
  });

  // Final cleanup: remove empty paragraphs and set width
  blockquote.querySelectorAll("p").forEach(p => {
    if (p.textContent.trim() === "" && !p.querySelector("pre")) {
      p.remove();
    }

    // Make Q bubbles fit their content
    if (p.getAttribute("data-role") === "Q") {
      // Count number of line breaks to determine if multi-line
      const textContent = p.innerHTML;
      const lineBreakCount = (textContent.match(/<br>/g) || []).length;

      if (lineBreakCount === 0 && !p.querySelector("pre")) {
        p.style.width = "max-content";
      }
    }
  });
}
