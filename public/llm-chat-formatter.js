// Refined LLM Chat Formatter with Model-Specific Q Bubbles
// and Improved Layout Flexibility - Case Insensitive Version

document.addEventListener("DOMContentLoaded", function () {
  formatLLMChats();
  document.addEventListener("astro:page-load", formatLLMChats);
});

// Standardize LLM name formatting
function normalizeLLMName(name) {
  // Map of lowercase keys to proper display format
  const llmNameMap = {
    chatgpt: "chatgpt",
    claude: "claude",
    mistral: "mistral",
    gemini: "gemini",
    llama: "llama",
    deepseek: "deepseek",
    generic: "generic",
  };

  // Normalize to lowercase for matching
  const normalizedName = name.trim().toLowerCase();

  // Return the mapped name or the original in lowercase if no mapping exists
  return llmNameMap[normalizedName] || normalizedName;
}

function formatLLMChats() {
  console.log("Formatting LLM chats...");

  // First inject the styles
  injectLLMChatStyles();

  // Find all blockquotes
  const blockquotes = document.querySelectorAll("blockquote");

  blockquotes.forEach(blockquote => {
    // Skip if already processed or not an LLM chat
    if (blockquote.hasAttribute("data-processed")) return;

    let isLLMChat = false;
    let llmName = "generic";

    // Look for LLM markers
    const paragraphs = blockquote.querySelectorAll("p");

    // Check first paragraph for LLM name
    if (paragraphs.length > 0) {
      const firstPText = paragraphs[0].textContent.trim();
      const llmMatch = firstPText.match(/^{([^}]+)}$/);

      if (llmMatch) {
        // Normalize the LLM name for case-insensitivity
        llmName = normalizeLLMName(llmMatch[1]);
        isLLMChat = true;
      }
    }

    // Also check for Q/A markers
    if (!isLLMChat) {
      for (const p of paragraphs) {
        if (p.textContent.trim().match(/^{[QA]}/)) {
          isLLMChat = true;
          break;
        }
      }
    }

    if (!isLLMChat) return;

    console.log(`Processing LLM chat: ${llmName}`);

    // Capitalize first letter for data attribute (for consistency with CSS selectors)
    const llmAttribute = llmName.charAt(0).toUpperCase() + llmName.slice(1);

    // Mark as LLM chat
    blockquote.setAttribute("data-llm", llmAttribute);
    blockquote.setAttribute("data-processed", "true");

    // Step 1: Grab all content & save code blocks
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

    // Add header (we'll position it later based on first message)
    const header = document.createElement("div");
    header.className = "llm-header";
    header.textContent = llmName.toLowerCase(); // Always lowercase display

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

          // Add a line break before appending
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

    // Step 4: Handle loose code blocks
    // Find all pre elements in the chat container
    const processedCodeBlocks = chatContainer.querySelectorAll("pre");

    // Check if any code blocks weren't processed
    for (const block of savedCodeBlocks) {
      let wasProcessed = false;

      for (const processedBlock of processedCodeBlocks) {
        // Check if the content matches (excluding the copy button)
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

      if (!wasProcessed && currentBubble) {
        // Add this code block to the most recent bubble
        const codeBlock = block.element.cloneNode(true);
        addCopyButtonToCodeBlock(codeBlock);
        currentBubble.appendChild(codeBlock);
      }
    }

    // Step 5: Determine header position based on first message
    if (firstMessageRole === "Q") {
      // Create a special header wrapper for Q-first chats
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
  const existingButtons = codeBlock.querySelectorAll(".copy-code");
  existingButtons.forEach(btn => btn.remove());

  // Create new copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-code-btn";
  copyBtn.textContent = "Copy";
  copyBtn.setAttribute("aria-label", "Copy code to clipboard");

  // Add click event to copy the code
  copyBtn.addEventListener("click", function () {
    // Get the code text (get the textContent of each non-button element)
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
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copied!";

        // Reset after 2 seconds
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to copy code: ", err);
        copyBtn.textContent = "Error";

        // Reset after 2 seconds
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 2000);
      });
  });

  // Add to the beginning of the code block so it appears at the top
  codeBlock.insertBefore(copyBtn, codeBlock.firstChild);
}

// Add this CSS rule to hide the original copy button
function addHideCopyButtonStyle() {
  const style = document.createElement("style");
  style.id = "hide-original-copy-button";
  style.textContent = `
        blockquote[data-llm] .chat-bubble pre .copy-code {
          display: none !important;
        }
      `;
  document.head.appendChild(style);
}

// Call this function in your main formatter
addHideCopyButtonStyle();

// Style injector function
function injectLLMChatStyles() {
  const styleEl = document.createElement("style");
  styleEl.id = "llm-chat-forced-styles";

  styleEl.textContent = `
    /* Forced Chat Styles with !important flags */
    
    /* LLM Chat Styling - Header Text Always Lowercase */
blockquote[data-llm] .llm-header {
  font-family: 'IBM Plex Mono', monospace !important;
  font-size: 80% !important;
  font-weight: normal !important;
  text-transform: lowercase !important; /* Force lowercase display */
  text-align: left !important;
  padding: 8px 4px 8px 14px !important;
  margin: 0 !important;
  line-height: 1.2 !important;
}

/* Header styling for each LLM type - case insensitive via CSS attribute selectors */
blockquote[data-llm="ChatGPT"] .llm-header,
blockquote[data-llm="Chatgpt"] .llm-header {
  color: rgb(60, 60, 61) !important;
}

blockquote[data-llm="Claude"] .llm-header,
blockquote[data-llm="claude"] .llm-header {
  color: rgb(218, 119, 86) !important;
}

blockquote[data-llm="Mistral"] .llm-header,
blockquote[data-llm="mistral"] .llm-header {
  color: rgb(209, 69, 59) !important;
}

blockquote[data-llm="Gemini"] .llm-header,
blockquote[data-llm="gemini"] .llm-header {
  color: rgb(75, 135, 226) !important;
}

blockquote[data-llm="Llama"] .llm-header,
blockquote[data-llm="llama"] .llm-header {
  color: rgb(153, 102, 255) !important;
}

blockquote[data-llm="DeepSeek"] .llm-header,
blockquote[data-llm="Deepseek"] .llm-header,
blockquote[data-llm="deepseek"] .llm-header {
  color: rgb(87, 112, 199) !important;
}

blockquote[data-llm="Generic"] .llm-header,
blockquote[data-llm="generic"] .llm-header {
  color: rgb(80, 80, 95) !important;
}

/* Background colors for different LLM chat types - case insensitive */
blockquote[data-llm="ChatGPT"],
blockquote[data-llm="Chatgpt"],
blockquote[data-llm="chatgpt"] {
  background-color: rgba(229, 231, 235, 0.25) !important;
}

blockquote[data-llm="Claude"],
blockquote[data-llm="claude"] {
  background-color: rgba(218, 119, 86, 0.1) !important;
}

blockquote[data-llm="Mistral"],
blockquote[data-llm="mistral"] {
  background-color: rgba(209, 69, 59, 0.1) !important;
}

blockquote[data-llm="Gemini"],
blockquote[data-llm="gemini"] {
  background-color: rgba(75, 135, 226, 0.1) !important;
}

blockquote[data-llm="Llama"],
blockquote[data-llm="llama"] {
  background-color: rgba(153, 102, 255, 0.1) !important;
}

blockquote[data-llm="DeepSeek"],
blockquote[data-llm="Deepseek"],
blockquote[data-llm="deepseek"] {
  background-color: rgba(87, 112, 199, 0.1) !important;
}

blockquote[data-llm="Generic"],
blockquote[data-llm="generic"] {
  background-color: rgba(240, 240, 245, 0.25) !important;
}

/* Q bubble colors for each LLM - case insensitive */
blockquote[data-llm="ChatGPT"] .chat-bubble.q-bubble,
blockquote[data-llm="Chatgpt"] .chat-bubble.q-bubble,
blockquote[data-llm="chatgpt"] .chat-bubble.q-bubble {
  background-color: rgba(229, 231, 235, 0.9) !important;
}

blockquote[data-llm="Claude"] .chat-bubble.q-bubble,
blockquote[data-llm="claude"] .chat-bubble.q-bubble {
  background-color: rgba(230, 190, 175, 0.9) !important;
}

blockquote[data-llm="Mistral"] .chat-bubble.q-bubble,
blockquote[data-llm="mistral"] .chat-bubble.q-bubble {
  background-color: rgba(230, 180, 180, 0.9) !important;
}

blockquote[data-llm="Gemini"] .chat-bubble.q-bubble,
blockquote[data-llm="gemini"] .chat-bubble.q-bubble {
  background-color: rgba(180, 210, 240, 0.9) !important;
}

blockquote[data-llm="Llama"] .chat-bubble.q-bubble,
blockquote[data-llm="llama"] .chat-bubble.q-bubble {
  background-color: rgba(220, 200, 255, 0.9) !important;
}

blockquote[data-llm="DeepSeek"] .chat-bubble.q-bubble,
blockquote[data-llm="Deepseek"] .chat-bubble.q-bubble,
blockquote[data-llm="deepseek"] .chat-bubble.q-bubble {
  background-color: rgba(200, 210, 240, 0.9) !important;
}

blockquote[data-llm="Generic"] .chat-bubble.q-bubble,
blockquote[data-llm="generic"] .chat-bubble.q-bubble {
  background-color: rgba(210, 210, 225, 0.9) !important;
}

/* Code block styling for each LLM - case insensitive */
blockquote[data-llm="ChatGPT"] .chat-bubble pre,
blockquote[data-llm="Chatgpt"] .chat-bubble pre,
blockquote[data-llm="chatgpt"] .chat-bubble pre {
  background-color: rgba(240, 240, 240, 0.7) !important;
  border-color: rgba(200, 200, 200, 0.8) !important;
}

blockquote[data-llm="Claude"] .chat-bubble pre,
blockquote[data-llm="claude"] .chat-bubble pre {
  background-color: rgba(245, 242, 240, 0.7) !important;
  border-color: rgba(218, 119, 86, 0.2) !important;
}

blockquote[data-llm="Mistral"] .chat-bubble pre,
blockquote[data-llm="mistral"] .chat-bubble pre {
  background-color: rgba(250, 240, 240, 0.7) !important;
  border-color: rgba(209, 69, 59, 0.2) !important;
}

blockquote[data-llm="Gemini"] .chat-bubble pre,
blockquote[data-llm="gemini"] .chat-bubble pre {
  background-color: rgba(240, 245, 250, 0.7) !important;
  border-color: rgba(75, 135, 226, 0.2) !important;
}

blockquote[data-llm="Llama"] .chat-bubble pre,
blockquote[data-llm="llama"] .chat-bubble pre {
  background-color: rgba(245, 240, 255, 0.7) !important;
  border-color: rgba(153, 102, 255, 0.2) !important;
}

blockquote[data-llm="DeepSeek"] .chat-bubble pre,
blockquote[data-llm="Deepseek"] .chat-bubble pre,
blockquote[data-llm="deepseek"] .chat-bubble pre {
  background-color: rgba(240, 245, 255, 0.7) !important;
  border-color: rgba(87, 112, 199, 0.2) !important;
}

blockquote[data-llm="Generic"] .chat-bubble pre,
blockquote[data-llm="generic"] .chat-bubble pre {
  background-color: rgba(245, 245, 250, 0.7) !important;
  border-color: rgba(200, 200, 230, 0.4) !important;
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

// Debug helper function
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

    // Check header position
    const headerWrapper = chat.querySelector(".header-wrapper.q-first");
    console.log(
      `Header position: ${headerWrapper ? "Q-first (floating)" : "Standard"}`
    );

    // Check chat container
    const container = chat.querySelector(".chat-container");
    console.log(`Chat container: ${container ? "Found" : "MISSING"}`);

    // Count and check bubbles
    if (container) {
      const qBubbles = container.querySelectorAll(".q-bubble");
      const aBubbles = container.querySelectorAll(".a-bubble");

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

      if (aBubbles.length > 0) {
        const firstA = aBubbles[0];
        const aStyle = window.getComputedStyle(firstA);
        console.log("A bubble styles:", {
          "background-color": aStyle.backgroundColor,
          "align-self": aStyle.alignSelf,
          "max-width": aStyle.maxWidth,
          width: aStyle.width,
        });
      }

      // Check code blocks
      const codeBlocks = container.querySelectorAll("pre");
      console.log(`Code blocks: ${codeBlocks.length}`);

      if (codeBlocks.length > 0) {
        // Verify each code block is in a bubble
        codeBlocks.forEach((code, i) => {
          const inBubble = code.closest(".chat-bubble") !== null;
          const hasButton = code.querySelector(".copy-code-btn") !== null;
          console.log(
            `Code block #${i + 1} in bubble: ${inBubble}, has copy button: ${hasButton}`
          );
        });
      }
    }

    console.groupEnd();
  });

  console.groupEnd();

  return "Debug complete. Check console for details.";
}

// Expose debug function globally
window.debugLLMChats = debugLLMChats;

// Add this to ensure original copy buttons stay hidden
setInterval(() => {
  document
    .querySelectorAll("blockquote[data-llm] .chat-bubble pre .copy-code")
    .forEach(btn => {
      btn.style.display = "none";
    });
}, 1000);
