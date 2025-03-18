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
    // Get all paragraphs
    const paragraphs = blockquote.querySelectorAll("p");
    if (!paragraphs.length) return;

    // Check first paragraph for LLM identifier pattern
    const firstP = paragraphs[0];
    const textContent = firstP.textContent.trim();

    // Match the format "{ChatGPT}" exactly as you showed
    const llmMatch = textContent.match(/^{([^}]+)}$/);

    let hasQAFormat = false;

    // Check if any paragraph has Q/A format even without LLM specified
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

      // Process Q/A format including code blocks
      processQAFormat(blockquote);

      console.log(`Processed LLM chat: ${llmName}`);
    } else if (hasQAFormat) {
      // This is a Q/A format without specified LLM - apply Generic style
      blockquote.setAttribute("data-llm", "Generic");

      // Create a header for Generic LLM
      const header = document.createElement("div");
      header.className = "llm-header llm-header-generic";
      header.textContent = "Chat";

      // Insert the header at the beginning of the blockquote
      blockquote.insertBefore(header, blockquote.firstChild);

      // Process Q/A format including code blocks
      processQAFormat(blockquote);

      console.log("Processed Generic LLM chat");
    }
  });
}

// Enhanced function to process Q/A format that handles code blocks properly
function processQAFormat(blockquote) {
  // Process paragraphs for Q/A patterns
  const paragraphs = blockquote.querySelectorAll("p");
  let currentRole = null;
  let currentParagraph = null;

  paragraphs.forEach(p => {
    const pText = p.textContent.trim();

    // Match the format "{Q}Text" or "{A}Text" exactly
    const qaMatch = pText.match(/^{([QA])}(.*)/);

    if (qaMatch) {
      // Start of a new Q or A section
      currentRole = qaMatch[1];
      currentParagraph = p;

      p.setAttribute("data-role", currentRole);
      // Remove the {Q} or {A} from the beginning
      p.innerHTML = p.innerHTML.replace(/^{[QA]}/, "");
    } else if (currentRole && currentParagraph) {
      // This paragraph continues the previous Q/A section and isn't a role marker
      // Check if this is a non-code paragraph that should be merged
      if (!p.querySelector("pre") && !currentParagraph.querySelector("pre")) {
        // Merge with previous paragraph of same role
        currentParagraph.innerHTML += "<br><br>" + p.innerHTML;
        p.remove();
      } else {
        // This paragraph contains a code block or follows one
        // Set the same role as the current Q/A section
        p.setAttribute("data-role", currentRole);
      }
    }
  });

  // Make sure code blocks are properly contained within their parent Q/A paragraphs
  blockquote.querySelectorAll("pre").forEach(pre => {
    const parentP = pre.closest("p");
    if (parentP && !parentP.hasAttribute("data-role")) {
      // Find the nearest previous paragraph with a role
      let prevP = parentP.previousElementSibling;
      while (prevP && !prevP.hasAttribute("data-role")) {
        prevP = prevP.previousElementSibling;
      }

      if (prevP) {
        // Set the same role as the previous paragraph
        const role = prevP.getAttribute("data-role");
        parentP.setAttribute("data-role", role);
      }
    }
  });
}
