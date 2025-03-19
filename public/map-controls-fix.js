// This script ensures the map projection controls are visible
// It should be placed in your public folder, for example as /public/map-controls-fix.js

document.addEventListener("DOMContentLoaded", function () {
  ensureControlsVisible();

  // Also run after a slight delay to catch any late-loading components
  setTimeout(ensureControlsVisible, 1000);
  setTimeout(ensureControlsVisible, 3000);
});

// This function runs when the view transitions occur in Astro
document.addEventListener("astro:page-load", function () {
  ensureControlsVisible();
  setTimeout(ensureControlsVisible, 1000);
});

// The main function that ensures controls are visible
function ensureControlsVisible() {
  console.log("Checking map controls visibility...");

  // Try to find the projection controls container
  const controlsContainers = document.querySelectorAll(".projection-controls");

  if (controlsContainers.length > 0) {
    console.log(
      `Found ${controlsContainers.length} projection control containers`
    );

    controlsContainers.forEach((container, index) => {
      // Force the container to be visible
      container.style.display = "block";
      container.style.visibility = "visible";
      container.style.opacity = "1";
      container.style.position = "relative";
      container.style.zIndex = "10";

      // Log the computed style to check if it's actually visible
      const computedStyle = window.getComputedStyle(container);
      console.log(
        `Control container ${index} - display: ${computedStyle.display}, visibility: ${computedStyle.visibility}`
      );

      // If there's a parent with hidden overflow, fix it
      let parent = container.parentElement;
      while (parent && parent !== document.body) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.overflow === "hidden") {
          console.log("Found parent with overflow:hidden, fixing...");
          parent.style.overflow = "visible";
        }
        parent = parent.parentElement;
      }
    });
  } else {
    console.log("No projection control containers found yet");
  }

  // Ensure the map container has enough height
  const mapWrappers = document.querySelectorAll(".map-wrapper");
  if (mapWrappers.length > 0) {
    mapWrappers.forEach(wrapper => {
      wrapper.style.minHeight = "800px";
      wrapper.style.overflow = "visible";
    });
  }

  // Also check the main content area
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.style.minHeight = "900px";
    mainContent.style.overflow = "visible";
    mainContent.style.paddingBottom = "200px";
  }
}
