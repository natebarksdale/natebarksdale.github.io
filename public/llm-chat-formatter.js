// Completely restructured llm-chat-formatter.js
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

    if ((llmMatch && llmMatch[1]) || hasQAFormat) {
      // Determine LLM name
      let llmName = "Generic";
      if (llmMatch && llmMatch[1]) {
        llmName = llmMatch[1].trim();
      }

      // Set LLM attribute
      blockquote.setAttribute("data-llm", llmName);

      // Create a completely new structure
      restructureChatContent(blockquote, llmName);

      console.log(`Processed LLM chat: ${llmName}`);
    }

    // Mark as processed to avoid repeated processing
    blockquote.setAttribute("data-processed", "true");
  });
}

function restructureChatContent(blockquote, llmName) {
  // Get all content
  const originalContent = blockquote.innerHTML;

  // Clear the blockquote
  blockquote.innerHTML = "";

  // Create header
  const header = document.createElement("div");
  header.className = `llm-header llm-header-${llmName.toLowerCase()}`;
  header.textContent = llmName;
  blockquote.appendChild(header);

  // Create message container
  const messageContainer = document.createElement("div");
  messageContainer.className = "message-container";
  blockquote.appendChild(messageContainer);

  // Parse content into messages
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = originalContent;

  // Get paragraphs from the temp container
  const paragraphs = tempDiv.querySelectorAll("p");

  // Skip first paragraph if it's the LLM identifier
  let startIndex = 0;
  if (
    paragraphs.length > 0 &&
    paragraphs[0].textContent.trim().match(/^{[^}]+}$/)
  ) {
    startIndex = 1;
  }

  let currentMessage = null;
  let currentRole = null;

  for (let i = startIndex; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    const text = p.textContent.trim();

    // Check for Q/A markers
    const qaMatch = text.match(/^{([QA])}/);

    if (qaMatch) {
      // New message section
      currentRole = qaMatch[1];

      // Create new message div
      currentMessage = document.createElement("div");
      currentMessage.className = "message";
      currentMessage.setAttribute("data-role", currentRole);
      messageContainer.appendChild(currentMessage);

      // Remove the {Q} or {A} marker and add the content
      const content = p.innerHTML.replace(/^{[QA]}/, "").trim();

      // Check if there's a code block
      if (p.querySelector("pre")) {
        // Handle special case with code block
        const parts = content.split(/<pre/);
        if (parts.length > 1) {
          // Add text before code block
          const textPart = document.createElement("div");
          textPart.innerHTML = parts[0];
          currentMessage.appendChild(textPart);

          // Add code block
          const codeBlock = document.createElement("pre");
          codeBlock.innerHTML = "<pre" + parts.slice(1).join("<pre");
          currentMessage.appendChild(codeBlock);
        } else {
          currentMessage.innerHTML = content;
        }
      } else {
        currentMessage.innerHTML = content;
      }
    } else if (currentMessage) {
      // This is a continuation of the previous message or a code block

      // Check if it's a code block
      if (p.querySelector("pre")) {
        // It's a code block, add it directly
        currentMessage.appendChild(p.querySelector("pre"));
      } else if (p.textContent.trim() !== "") {
        // Regular text, append with spacing
        const spacer = document.createElement("br");
        currentMessage.appendChild(spacer);

        // Add a small gap before appending more text
        const spacerDiv = document.createElement("div");
        spacerDiv.style.height = "0.5em";
        currentMessage.appendChild(spacerDiv);

        // Append the content
        const contentDiv = document.createElement("div");
        contentDiv.innerHTML = p.innerHTML;
        currentMessage.appendChild(contentDiv);
      }
    }
  }

  // Fix code blocks to ensure they're properly contained
  messageContainer.querySelectorAll("pre").forEach(pre => {
    const parent = pre.parentElement;

    // If pre is not directly in a message div, move it
    if (!parent.classList.contains("message")) {
      // Find closest message ancestor
      const messageParent = pre.closest(".message");
      if (messageParent) {
        messageParent.appendChild(pre);
      }
    }

    // Ensure code within pre is properly styled
    const code = pre.querySelector("code");
    if (code) {
      code.style.backgroundColor = "transparent";
    }
  });
}
