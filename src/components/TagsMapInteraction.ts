// This script adds hover interactivity between the tag list and the map

// Extend the Window interface to include our custom property
declare global {
  interface Window {
    tagsMapSetActiveTag?: (tagName: string | null) => void;
  }
}

export function initTagMapInteractions() {
  // Run after the page has loaded
  document.addEventListener("DOMContentLoaded", () => {
    let currentTimeout: number | null = null;
    let currentTag: string | null = null;

    // Get all tag elements on the page
    const tagElements = document.querySelectorAll("[data-tag-name]");

    // Set up hover interactions for each tag
    tagElements.forEach(tagElement => {
      const tagName = tagElement.getAttribute("data-tag-name");
      if (!tagName) return;

      // When mouse enters the tag element
      tagElement.addEventListener("mouseenter", () => {
        // Clear any existing timeout
        if (currentTimeout !== null) {
          window.clearTimeout(currentTimeout);
          currentTimeout = null;
        }

        // Set this tag as active
        currentTag = tagName;

        // Find the map component and update its state
        const tagsMapControls = document.getElementById("tagsmap-controls");
        if (tagsMapControls) {
          // Create and dispatch a custom event to set the active tag
          const event = new CustomEvent("setActiveTag", {
            detail: { tagName },
          });
          tagsMapControls.dispatchEvent(event);
        }
      });

      // When mouse leaves the tag element
      tagElement.addEventListener("mouseleave", () => {
        // Only clear after a short delay (to handle moving between tags)
        currentTimeout = window.setTimeout(() => {
          currentTag = null;

          // Find the map and clear the active tag
          const tagsMapControls = document.getElementById("tagsmap-controls");
          if (tagsMapControls) {
            const event = new CustomEvent("setActiveTag", {
              detail: { tagName: null },
            });
            tagsMapControls.dispatchEvent(event);
          }

          currentTimeout = null;
        }, 300);
      });
    });
  });
}

export default initTagMapInteractions;
