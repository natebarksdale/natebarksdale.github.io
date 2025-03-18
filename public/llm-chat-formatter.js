// Simple, direct LLM Chat formatter
document.addEventListener("DOMContentLoaded", function () {
  formatLLMChats();

  // Also handle Astro view transitions
  document.addEventListener("astro:page-load", formatLLMChats);
});

function formatLLMChats() {
  console.log("Formatting LLM chats...");
  // Find all blockquotes that might be LLM chats
  const blockquotes = document.querySelectorAll("blockquote");

  blockquotes.forEach(blockquote => {
    // Skip if already processed
    if (blockquote.hasAttribute("data-processed")) return;

    // Store all original content
    const originalContent = blockquote.innerHTML;
    const paragraphs = blockquote.querySelectorAll("p");

    // Check if this is an LLM chat by looking for {LLM} and {Q}/{A} markers
    let isLLMChat = false;
    let llmName = "Generic";

    // Check first paragraph for LLM name
    if (paragraphs.length > 0) {
      const firstPText = paragraphs[0].textContent.trim();
      const llmMatch = firstPText.match(/^{([^}]+)}$/);

      if (llmMatch) {
        llmName = llmMatch[1];
        isLLMChat = true;
      }
    }

    // Also check for Q/A patterns if LLM name not found
    if (!isLLMChat) {
      for (let i = 0; i < paragraphs.length; i++) {
        if (paragraphs[i].textContent.trim().match(/^{[QA]}/)) {
          isLLMChat = true;
          break;
        }
      }
    }

    if (!isLLMChat) return;

    console.log(`Found LLM chat: ${llmName}`);

    // Mark this as an LLM chat
    blockquote.setAttribute("data-llm", llmName);
    blockquote.setAttribute("data-processed", "true");

    // Clear blockquote content to rebuild it
    blockquote.innerHTML = "";

    // Add the header
    const header = document.createElement("div");
    header.className = "llm-header";
    header.textContent = llmName;
    blockquote.appendChild(header);

    // Create chat container for messages
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";
    blockquote.appendChild(chatContainer);

    // Parse the original content
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalContent, "text/html");
    const elements = doc.body.children;

    // Skip the first paragraph if it's the LLM name
    let startIndex = 0;
    if (
      elements.length > 0 &&
      elements[0].tagName === "P" &&
      elements[0].textContent.trim().match(/^{[^}]+}$/)
    ) {
      startIndex = 1;
    }

    // Process content elements
    let currentBubble = null;
    let currentRole = null;
    let inCodeBlock = false;
    let codeContent = "";
    let codeLanguage = "";

    for (let i = startIndex; i < elements.length; i++) {
      const element = elements[i];

      // Skip empty paragraphs
      if (element.tagName === "P" && element.textContent.trim() === "") {
        continue;
      }

      // Handle code blocks specially
      if (element.tagName === "PRE") {
        if (currentBubble) {
          currentBubble.appendChild(element.cloneNode(true));
        } else {
          // Orphaned code block - create a generic bubble
          const bubble = document.createElement("div");
          bubble.className = "chat-bubble a-bubble";
          bubble.appendChild(element.cloneNode(true));
          chatContainer.appendChild(bubble);
        }
        continue;
      }

      // Handle regular paragraphs
      if (element.tagName === "P") {
        const text = element.textContent.trim();
        const qaMatch = text.match(/^{([QA])}/);

        if (qaMatch) {
          // This is a new Q or A message
          currentRole = qaMatch[1];

          // Create a new chat bubble
          currentBubble = document.createElement("div");
          currentBubble.className = `chat-bubble ${currentRole.toLowerCase()}-bubble`;
          chatContainer.appendChild(currentBubble);

          // Add content without the {Q} or {A} marker
          const cleanContent = element.innerHTML.replace(/^{[QA]}/, "").trim();

          // Handle possible code inside paragraph
          if (cleanContent.includes("<pre")) {
            // Split at the pre tag
            const parts = cleanContent.split(/<pre/);
            if (parts[0]) {
              const textPart = document.createElement("div");
              textPart.innerHTML = parts[0];
              currentBubble.appendChild(textPart);
            }
            // The code part will be added separately
            const preElement = element.querySelector("pre");
            if (preElement) {
              currentBubble.appendChild(preElement.cloneNode(true));
            }
          } else {
            // Regular text
            const textPart = document.createElement("div");
            textPart.innerHTML = cleanContent;
            currentBubble.appendChild(textPart);
          }
        } else if (currentBubble) {
          // This is a continuation of the previous message
          const spacer = document.createElement("br");
          currentBubble.appendChild(spacer);

          // Add the content
          const contentDiv = document.createElement("div");
          contentDiv.innerHTML = element.innerHTML;
          currentBubble.appendChild(contentDiv);
        }
      }
    }

    console.log("Completed formatting LLM chat!");
  });
}
