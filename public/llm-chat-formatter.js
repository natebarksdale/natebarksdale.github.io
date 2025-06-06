// Improved LLM Chat Formatter with Model-Specific Styling
// and Simplified Case-Insensitive Implementation

document.addEventListener("DOMContentLoaded", function () {
  formatLLMChats();
  // Support Astro's partial page hydration
  document.addEventListener("astro:page-load", formatLLMChats);
});

// Standardize LLM name formatting
function normalizeLLMName(name) {
  // Map of lowercase keys to proper capitalized display format for data attributes
  const llmNameMap = {
    chatgpt: "ChatGPT",
    claude: "Claude",
    mistral: "Mistral",
    gemini: "Gemini",
    llama: "Llama",
    deepseek: "DeepSeek",
    generic: "Generic",
  };

  // Normalize to lowercase for matching
  const normalizedName = name.trim().toLowerCase();

  // Return the mapped name with proper capitalization or fallback to Generic
  return llmNameMap[normalizedName] || "Generic";
}

function formatLLMChats() {
  console.log("Formatting LLM chats...");

  // First inject the styles to ensure they take precedence
  injectLLMChatStyles();

  // Find all blockquotes that haven't been processed yet
  const blockquotes = document.querySelectorAll(
    "blockquote:not([data-processed])"
  );

  blockquotes.forEach(blockquote => {
    let isLLMChat = false;
    let llmName = "Generic";

    // Look for LLM markers in the first paragraph
    const paragraphs = blockquote.querySelectorAll("p");

    // Check first paragraph for LLM name
    if (paragraphs.length > 0) {
      const firstPText = paragraphs[0].textContent.trim();
      const llmMatch = firstPText.match(/^{([^}]+)}$/);

      if (llmMatch) {
        // Normalize the LLM name with proper capitalization
        llmName = normalizeLLMName(llmMatch[1]);
        isLLMChat = true;
      }
    }

    // Also check for Q/A markers if no LLM name was found
    if (!isLLMChat) {
      for (const p of paragraphs) {
        if (p.textContent.trim().match(/^{[QA]}/)) {
          isLLMChat = true;
          break;
        }
      }
    }

    // Skip if not an LLM chat
    if (!isLLMChat) return;

    console.log(`Processing LLM chat: ${llmName}`);

    // Mark as LLM chat and processed
    blockquote.setAttribute("data-llm", llmName);
    blockquote.setAttribute("data-processed", "true");

    // Step 1: Save code blocks for later reinsertion
    const savedCodeBlocks = [];
    blockquote.querySelectorAll("pre").forEach((pre, index) => {
      savedCodeBlocks.push({
        id: `code-${index}`,
        element: pre.cloneNode(true),
      });
    });

    // Step 2: Create the new structure
    const originalHTML = blockquote.innerHTML;
    blockquote.innerHTML = "";

    // Create chat container
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";

    // Add header (with lowercase display for aesthetic reasons)
    const header = document.createElement("div");
    header.className = "llm-header";
    header.textContent = llmName.toLowerCase();

    // Step 3: Parse content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalHTML;

    let currentRole = null;
    let currentBubble = null;
    let firstMessageRole = null;

    // Track the paragraph elements and their positions
    const elements = [];
    let skipFirst = false;

    // Skip first paragraph if it's the LLM name
    if (
      paragraphs.length > 0 &&
      paragraphs[0].textContent.trim().match(/^{[^}]+}$/)
    ) {
      skipFirst = true;
    }

    // First gather all elements in sequence
    for (let i = 0; i < tempDiv.children.length; i++) {
      const el = tempDiv.children[i];
      if (skipFirst && i === 0 && el.tagName === "P") continue;
      elements.push(el);
    }

    // Process elements in sequence
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];

      if (el.tagName === "P") {
        const text = el.textContent.trim();
        const qaMatch = text.match(/^{([QA])}/);

        if (qaMatch) {
          // New Q/A section
          currentRole = qaMatch[1];

          // Track first message role
          if (firstMessageRole === null) {
            firstMessageRole = currentRole;
          }

          currentBubble = document.createElement("div");
          currentBubble.className = `chat-bubble ${currentRole.toLowerCase()}-bubble`;
          chatContainer.appendChild(currentBubble);

          // Add content without marker
          const contentDiv = document.createElement("div");
          contentDiv.innerHTML = el.innerHTML.replace(/^{[QA]}/, "");
          currentBubble.appendChild(contentDiv);
        } else if (currentBubble) {
          // Continue existing section
          const contentDiv = document.createElement("div");
          contentDiv.innerHTML = el.innerHTML;

          // Add a line break before appending if needed
          if (currentBubble.childNodes.length > 0) {
            currentBubble.appendChild(document.createElement("br"));
          }

          currentBubble.appendChild(contentDiv);
        }
      } else if (el.tagName === "PRE" && currentBubble) {
        // Add code block to current message
        const codeBlock = el.cloneNode(true);

        // Add copy button to code blocks
        addCopyButtonToCodeBlock(codeBlock);

        currentBubble.appendChild(codeBlock);
      }
    }

    // Step 4: Handle any code blocks that weren't properly processed
    const processedCodeBlocks = chatContainer.querySelectorAll("pre");

    for (const block of savedCodeBlocks) {
      let wasProcessed = false;

      for (const processedBlock of processedCodeBlocks) {
        // Check if this code block was already added
        const processedContent = processedBlock.innerHTML.replace(
          /<button.*?<\/button>/g,
          ""
        );
        const blockContent = block.element.innerHTML;

        if (processedContent === blockContent) {
          wasProcessed = true;
          break;
        }
      }

      // If not processed and we have a current bubble, add it
      if (!wasProcessed && currentBubble) {
        const codeBlock = block.element.cloneNode(true);
        addCopyButtonToCodeBlock(codeBlock);
        currentBubble.appendChild(codeBlock);
      }
    }

    // Step 5: Determine header position based on first message
    if (firstMessageRole === "Q") {
      // Create a wrapper for Q-first chats to position header correctly
      const headerWrapper = document.createElement("div");
      headerWrapper.className = "header-wrapper q-first";
      headerWrapper.appendChild(header);
      blockquote.appendChild(headerWrapper);
    } else {
      // For A-first or no messages, use standard header position
      blockquote.appendChild(header);
    }

    // Finally add the chat container
    blockquote.appendChild(chatContainer);

    console.log("Completed formatting chat");
  });
}

// Helper function to add copy button to code blocks
function addCopyButtonToCodeBlock(codeBlock) {
  // First, remove any existing copy buttons
  const existingButtons = codeBlock.querySelectorAll(
    ".copy-code, .copy-code-btn"
  );
  existingButtons.forEach(btn => btn.remove());

  // Create new copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-code-btn";
  copyBtn.textContent = "Copy";
  copyBtn.setAttribute("aria-label", "Copy code to clipboard");

  // Add click event to copy the code
  copyBtn.addEventListener("click", function () {
    // Get the code text (excluding the button)
    let code = "";
    for (const node of codeBlock.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        code += node.textContent;
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !node.classList.contains("copy-code") &&
        !node.classList.contains("copy-code-btn")
      ) {
        code += node.textContent;
      }
    }

    // Copy to clipboard
    navigator.clipboard
      .writeText(code)
      .then(() => {
        // Success feedback
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy code: ", err);
        copyBtn.textContent = "Error";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      });
  });

  // Add to the beginning of the code block so it appears at the top
  codeBlock.insertBefore(copyBtn, codeBlock.firstChild);
}

// Style injector function with fixed CSS syntax
function injectLLMChatStyles() {
  const styleEl = document.createElement("style");
  styleEl.id = "llm-chat-forced-styles";

  styleEl.textContent = `
      /* Foundation styles for the chat container */
      blockquote[data-llm] {
        padding: 0 !important;
        margin: 1.5rem 0 !important;
        border-radius: 0.75rem !important;
        overflow: hidden !important;
        font-family: 'Faune', sans-serif !important;
        font-style: normal !important;
        font-size: 80% !important;
        font-weight: normal !important;
        border-left: none !important;
        opacity: 1 !important;
        background-color: rgba(250, 250, 250, 0.5) !important;
      }
      
      /* Model-specific backgrounds */
      blockquote[data-llm="ChatGPT"] {
        background-color: rgba(229, 231, 235, 0.25) !important;
      }
      
      blockquote[data-llm="Claude"] {
        background-color: rgba(218, 119, 86, 0.1) !important;
      }
      
      blockquote[data-llm="Mistral"] {
        background-color: rgba(209, 69, 59, 0.1) !important;
      }
      
      blockquote[data-llm="Gemini"] {
        background-color: rgba(75, 135, 226, 0.1) !important;
      }
      
      blockquote[data-llm="Llama"] {
        background-color: rgba(153, 102, 255, 0.1) !important;
      }
      
      blockquote[data-llm="DeepSeek"] {
        background-color: rgba(87, 112, 199, 0.1) !important;
      }
      
      blockquote[data-llm="Generic"] {
        background-color: rgba(240, 240, 245, 0.25) !important;
      }
      
      /* Header styling - no background */
      blockquote[data-llm] .llm-header {
        font-family: 'IBM Plex Mono', monospace !important;
        font-size: 80% !important;
        font-weight: normal !important;
        text-transform: lowercase !important;
        text-align: left !important;
        padding: 8px 4px 8px 14px !important;
        margin: 0 !important;
        line-height: 1.2 !important;
      }
      
      /* Header wrapper for Q-first chats */
      blockquote[data-llm] .header-wrapper.q-first {
        position: relative !important;
        height: 0 !important;
        overflow: visible !important;
        z-index: 1 !important;
      }
      
      blockquote[data-llm] .header-wrapper.q-first .llm-header {
        position: absolute !important;
        top: 8px !important;
        left: 14px !important;
        padding: 4px 8px !important;
        border-radius: 12px !important;
      }
      
      /* LLM-specific header colors */
      blockquote[data-llm="ChatGPT"] .llm-header {
        color: rgb(60, 60, 61) !important;
      }
      
      blockquote[data-llm="Claude"] .llm-header {
        color: rgb(218, 119, 86) !important;
      }
      
      blockquote[data-llm="Mistral"] .llm-header {
        color: rgb(209, 69, 59) !important;
      }
      
      blockquote[data-llm="Gemini"] .llm-header {
        color: rgb(75, 135, 226) !important;
      }
      
      blockquote[data-llm="Llama"] .llm-header {
        color: rgb(153, 102, 255) !important;
      }
      
      blockquote[data-llm="DeepSeek"] .llm-header {
        color: rgb(87, 112, 199) !important;
      }
      
      blockquote[data-llm="Generic"] .llm-header {
        color: rgb(80, 80, 95) !important;
      }
      
      /* Critical: chat container must be flex */
      blockquote[data-llm] .chat-container {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        padding: 8px !important;
        border: none;
      }
      
      /* Basic chat bubble styles */
      blockquote[data-llm] .chat-bubble {
        display: block !important;
        position: relative !important;
        margin: 8px 12px !important;
        padding: 12px 16px !important;
        border-radius: 18px !important;
        box-sizing: border-box !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      
      /* Q bubbles - RIGHT aligned with model-specific colors */
      blockquote[data-llm] .chat-bubble.q-bubble {
        align-self: flex-end !important;
        margin-left: auto !important; 
        max-width: 70% !important;
        border-radius: 18px !important;
        color: rgb(30, 30, 30) !important;
        background-color: rgba(229, 231, 235, 0.9) !important;
        width: auto !important;
      }
      
      /* Model-specific Q bubble colors - darker for better contrast */
      blockquote[data-llm="ChatGPT"] .chat-bubble.q-bubble {
        background-color: rgba(229, 231, 235, 0.9) !important;
      }
      
      blockquote[data-llm="Claude"] .chat-bubble.q-bubble {
        background-color: rgba(230, 190, 175, 0.9) !important;
      }
      
      blockquote[data-llm="Mistral"] .chat-bubble.q-bubble {
        background-color: rgba(230, 180, 180, 0.9) !important;
      }
      
      blockquote[data-llm="Gemini"] .chat-bubble.q-bubble {
        background-color: rgba(180, 210, 240, 0.9) !important;
      }
      
      blockquote[data-llm="Llama"] .chat-bubble.q-bubble {
        background-color: rgba(220, 200, 255, 0.9) !important;
      }
      
      blockquote[data-llm="DeepSeek"] .chat-bubble.q-bubble {
        background-color: rgba(200, 210, 240, 0.9) !important;
      }
      
      blockquote[data-llm="Generic"] .chat-bubble.q-bubble {
        background-color: rgba(210, 210, 225, 0.9) !important;
      }
      
      /* A bubbles - LEFT aligned, full width for long content */
      blockquote[data-llm] .chat-bubble.a-bubble {
        align-self: flex-start !important;
        margin-right: auto !important;
        background-color: white !important;
        border-radius: 18px !important;
        color: rgb(30, 30, 30) !important;
        width: auto !important;
        max-width: calc(100% - 24px) !important; /* Full width minus margins */
      }
      
      /* Inline code */
      blockquote[data-llm] .chat-bubble code {
        background-color: rgba(0, 0, 0, 0.05) !important;
        padding: 0.1em 0.3em !important;
        border-radius: 3px !important;
        font-size: 0.9em !important;
      }
      
      /* Code blocks */
      blockquote[data-llm] .chat-bubble pre {
        display: block !important;
        margin: 12px 0 4px 0 !important;
        padding: 12px !important;
        border-radius: 8px !important;
        overflow-x: auto !important;
        background-color: rgba(30, 30, 30, 0.05) !important;
        width: 100% !important;
        position: relative !important;
      }
      
      /* Model-specific code block styling */
      blockquote[data-llm="ChatGPT"] .chat-bubble pre {
        background-color: rgba(240, 240, 240, 0.7) !important;
        border-color: rgba(200, 200, 200, 0.8) !important;
      }
      
      blockquote[data-llm="Claude"] .chat-bubble pre {
        background-color: rgba(245, 242, 240, 0.7) !important;
        border-color: rgba(218, 119, 86, 0.2) !important;
      }
      
      blockquote[data-llm="Mistral"] .chat-bubble pre {
        background-color: rgba(250, 240, 240, 0.7) !important;
        border-color: rgba(209, 69, 59, 0.2) !important;
      }
      
      blockquote[data-llm="Gemini"] .chat-bubble pre {
        background-color: rgba(240, 245, 250, 0.7) !important;
        border-color: rgba(75, 135, 226, 0.2) !important;
      }
      
      blockquote[data-llm="Llama"] .chat-bubble pre {
        background-color: rgba(245, 240, 255, 0.7) !important;
        border-color: rgba(153, 102, 255, 0.2) !important;
      }
      
      blockquote[data-llm="DeepSeek"] .chat-bubble pre {
        background-color: rgba(240, 245, 255, 0.7) !important;
        border-color: rgba(87, 112, 199, 0.2) !important;
      }
      
      blockquote[data-llm="Generic"] .chat-bubble pre {
        background-color: rgba(245, 245, 250, 0.7) !important;
        border-color: rgba(200, 200, 230, 0.4) !important;
      }
      
      /* Fix code inside pre */
      blockquote[data-llm] .chat-bubble pre code {
        background-color: transparent !important;
        padding: 0 !important;
        border: none !important;
        font-size: 0.85em !important;
        line-height: 1.5 !important;
        white-space: pre !important;
        font-family: monospace !important;
      }
      
      /* Copy button styling - directly on the code block */
      blockquote[data-llm] .chat-bubble pre .copy-code-btn {
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        padding: 2px 8px !important;
        font-size: 11px !important;
        background-color: rgba(255, 255, 255, 0.8) !important;
        border-radius: 4px !important;
        color: rgba(0, 0, 0, 0.7) !important;
        cursor: pointer !important;
        opacity: 0 !important;
        transition: opacity 0.2s ease !important;
      }
      
      blockquote[data-llm] .chat-bubble pre:hover .copy-code-btn {
        opacity: 1 !important;
      }
      
      blockquote[data-llm] .chat-bubble pre .copy-code-btn:hover {
        background-color: rgba(255, 255, 255, 0.95) !important;
      }
      
      /* Override default blockquote styling */
      blockquote[data-llm]::before,
      blockquote[data-llm]::after {
        content: none !important;
      }
      
      /* Ensure bubbles are properly positioned in flex container */
      @media screen and (min-width: 100px) {
        blockquote[data-llm] .chat-container {
          display: flex !important;
        }
        
        blockquote[data-llm] .chat-bubble.q-bubble {
          align-self: flex-end !important;
        }
        
        blockquote[data-llm] .chat-bubble.a-bubble {
          align-self: flex-start !important;
        }
      }
      
      /* Hide any original copy buttons */
      blockquote[data-llm] .chat-bubble pre .copy-code {
        display: none !important;
      }
    `;

  // Remove any existing version
  const existing = document.getElementById("llm-chat-forced-styles");
  if (existing) {
    existing.remove();
  }

  // Add to head
  document.head.appendChild(styleEl);

  console.log("LLM Chat styles injected!");
  return "LLM Chat styles injected!";
}

// Add a debug helper for troubleshooting
function debugLLMChats() {
  console.group("LLM Chat Debug Information");

  // Find all blockquotes
  const blockquotes = document.querySelectorAll("blockquote");
  console.log(`Found ${blockquotes.length} blockquotes on page`);

  // Count LLM chats
  const llmChats = document.querySelectorAll("blockquote[data-llm]");
  console.log(`Found ${llmChats.length} LLM chat blockquotes`);

  // Analyze each LLM chat
  llmChats.forEach((chat, index) => {
    console.group(`LLM Chat #${index + 1}`);

    // Basic info
    const llmType = chat.getAttribute("data-llm");
    console.log(`LLM Type: ${llmType}`);

    // Check header
    const header = chat.querySelector(".llm-header");
    console.log(`Header: ${header ? "Found" : "MISSING"}`);
    if (header) {
      console.log(`Header text: "${header.textContent}"`);
    }

    // Check bubbles and their computed styles
    const qBubbles = chat.querySelectorAll(".q-bubble");
    const aBubbles = chat.querySelectorAll(".a-bubble");

    console.log(`Q bubbles: ${qBubbles.length}`);
    console.log(`A bubbles: ${aBubbles.length}`);

    // Check bubble styling
    if (qBubbles.length > 0) {
      const firstQ = qBubbles[0];
      const qStyle = window.getComputedStyle(firstQ);
      console.log("Q bubble styles:", {
        "background-color": qStyle.backgroundColor,
        "align-self": qStyle.alignSelf,
        "max-width": qStyle.maxWidth,
        width: qStyle.width,
      });
    }

    console.groupEnd();
  });

  console.groupEnd();
  return "Debug complete. Check browser console for details.";
}

// Expose the debug function globally
window.debugLLMChats = debugLLMChats;

// Ensure original copy buttons stay hidden (as a safeguard)
setInterval(() => {
  document
    .querySelectorAll("blockquote[data-llm] .chat-bubble pre .copy-code")
    .forEach(btn => {
      btn.style.display = "none";
    });
}, 1000);
