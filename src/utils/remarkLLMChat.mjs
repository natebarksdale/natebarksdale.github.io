// src/utils/remarkLLMChat.mjs
import { visit } from 'unist-util-visit';

export function remarkLLMChat() {
  return function transformer(tree) {
    visit(tree, 'blockquote', node => {
      if (node.children && node.children.length > 0) {
        // Check if the first paragraph contains an LLM identifier
        const firstChild = node.children[0];
        
        if (firstChild.type === 'paragraph' && 
            firstChild.children && 
            firstChild.children.length === 1 &&
            firstChild.children[0].type === 'text') {
          
          const match = firstChild.children[0].value.match(/^\s*{([^}]+)}\s*$/);
          
          if (match) {
            const llmName = match[1];
            
            // Add data-llm attribute to the blockquote
            node.data = node.data || {};
            node.data.hProperties = node.data.hProperties || {};
            node.data.hProperties['data-llm'] = llmName;
            
            // Remove the first paragraph
            node.children.shift();
            
            // Process remaining paragraphs for Q/A format
            node.children.forEach(child => {
              if (child.type === 'paragraph' && 
                  child.children && 
                  child.children.length === 1 &&
                  child.children[0].type === 'text') {
                
                const qaMatch = child.children[0].value.match(/^\s*{([QA])}\s*(.*)$/);
                
                if (qaMatch) {
                  const role = qaMatch[1];
                  const text = qaMatch[2];
                  
                  // Update the content and add data-role attribute
                  child.children[0].value = text;
                  child.data = child.data || {};
                  child.data.hProperties = child.data.hProperties || {};
                  child.data.hProperties['data-role'] = role;
                }
              }
            });
          }
        }
      }
    });
  };
}