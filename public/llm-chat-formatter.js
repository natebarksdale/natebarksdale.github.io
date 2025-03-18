// Complete LLM Chat Formatter with Forced Styling
// This is a single file you can include in your project

document.addEventListener("DOMContentLoaded", function () {
  formatLLMChats();
  document.addEventListener("astro:page-load", formatLLMChats);
});

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
    let llmName = "Generic";

    // Look for LLM markers
    const paragraphs = blockquote.querySelectorAll("p");

    // Check first paragraph for LLM name
    if (paragraphs.length > 0) {
      const firstPText = paragraphs[0].textContent.trim();
      const llmMatch = firstPText.match(/^{([^}]+)}$/);

      if (llmMatch) {
        llmName = llmMatch[1];
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

    // Mark as LLM chat
    blockquote.setAttribute("data-llm", llmName);
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

    // Add header
    const header = document.createElement("div");
    header.className = "llm-header";
    header.textContent = llmName;
    blockquote.appendChild(header);

    // Create chat container
    const chatContainer = document.createElement("div");
    chatContainer.className = "chat-container";
    blockquote.appendChild(chatContainer);

    // Step 3: Parse content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalHTML;

    let currentRole = null;
    let currentBubble = null;

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
        currentBubble.appendChild(el.cloneNode(true));
      }
    }

    // Step 4: Handle loose code blocks
    // Find all pre elements in the chat container
    const processedCodeBlocks = chatContainer.querySelectorAll("pre");

    // Check if any code blocks weren't processed
    for (const block of savedCodeBlocks) {
      let wasProcessed = false;

      for (const processedBlock of processedCodeBlocks) {
        if (processedBlock.innerHTML === block.element.innerHTML) {
          wasProcessed = true;
          break;
        }
      }

      if (!wasProcessed && currentBubble) {
        // Add this code block to the most recent bubble
        currentBubble.appendChild(block.element);
      }
    }

    console.log("Completed formatting chat");
  });
}

// Style injector function
function injectLLMChatStyles() {
  const styleEl = document.createElement("style");
  styleEl.id = "llm-chat-forced-styles";

  styleEl.textContent = `
  /* Forced Chat Styles with !important flags */
  
  /* Foundation styles for the chat container */
  blockquote[data-llm] {
    padding: 0 !important;
    margin: 1.5rem 0 !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
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
  
  blockquote[data-llm="Generic"] {
    background-color: rgba(240, 240, 245, 0.25) !important;
  }
  
  /* Header styling */
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
  
  blockquote[data-llm="Generic"] .llm-header {
    color: rgb(80, 80, 95) !important;
  }
  
  /* Critical: chat container must be flex */
  blockquote[data-llm] .chat-container {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    padding: 8px !important;
  }
  
  /* Basic chat bubble styles */
  blockquote[data-llm] .chat-bubble {
    display: block !important;
    position: relative !important;
    margin: 8px 0 !important;
    padding: 12px 16px !important;
    border-radius: 18px !important;
    max-width: 70% !important;
    box-sizing: border-box !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
  }
  
  /* Q bubbles - RIGHT aligned */
  blockquote[data-llm] .chat-bubble.q-bubble {
    align-self: flex-end !important;
    margin-left: auto !important; 
    margin-right: 16px !important;
    background-color: rgba(229, 231, 235, 0.9) !important;
    border-radius: 18px 18px 4px 18px !important;
    color: rgb(30, 30, 30) !important;
    width: auto !important;
  }
  
  /* A bubbles - LEFT aligned */
  blockquote[data-llm] .chat-bubble.a-bubble {
    align-self: flex-start !important;
    margin-right: auto !important;
    margin-left: 16px !important;
    background-color: white !important;
    border-radius: 18px 18px 18px 4px !important;
    color: rgb(30, 30, 30) !important;
    width: auto !important;
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
    border: 1px solid rgba(30, 30, 30, 0.1) !important;
    width: 100% !important;
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
          console.log(`Code block #${i + 1} in bubble: ${inBubble}`);
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
