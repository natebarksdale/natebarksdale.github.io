// map-diagnostics.js - Add to your public directory
(function () {
  console.log("🗺️ Map diagnostics script loaded");

  // Function to check if map elements are properly rendered
  function checkMapRendering() {
    console.log("🗺️ Checking map rendering...");

    // Check if map container exists
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) {
      console.warn("❌ Map container not found");
      return;
    }

    // Check if map projection controls exist
    const projectionControls = document.getElementById(
      "map-projection-controls"
    );
    if (!projectionControls) {
      console.warn("❌ Map projection controls not found");

      // Try to find the React-rendered map component
      const mapComponent = document.querySelector(".map-component-container");
      if (mapComponent) {
        console.log("✅ Found map component container");

        // Check for the controls inside the component
        const controlsInComponent = mapComponent.querySelector(".map-controls");
        if (!controlsInComponent) {
          console.warn("❌ Map controls not found within component");

          // Attempt to fix the issue by forcing UI visibility
          fixMapControlsVisibility();
        } else {
          console.log("✅ Found map controls inside component");
        }
      } else {
        console.warn("❌ Map component container not found");

        // Try to find the mapboxgl canvas
        const mapCanvas = document.querySelector(".mapboxgl-canvas-container");
        if (mapCanvas) {
          console.log(
            "✅ Found mapboxgl canvas, but component structure is incomplete"
          );
          fixMapComponentStructure();
        }
      }
    } else {
      console.log("✅ Map projection controls found");
    }

    // Check for stacking context issues
    checkStackingContext();
  }

  // Function to check for stacking context issues
  function checkStackingContext() {
    console.log("🗺️ Checking for stacking context issues...");

    // Find main content container
    const mainContent = document.getElementById("main-content");
    if (!mainContent) {
      console.warn("❌ Main content container not found");
      return;
    }

    // Check if any elements might be creating stacking context issues
    const potentialIssues = Array.from(mainContent.children).filter(el => {
      const style = window.getComputedStyle(el);
      // Check for properties that create new stacking contexts
      return (
        style.position === "absolute" ||
        style.position === "fixed" ||
        style.zIndex !== "auto" ||
        style.opacity !== "1" ||
        style.transform !== "none" ||
        style.filter !== "none"
      );
    });

    if (potentialIssues.length > 0) {
      console.warn(
        "⚠️ Found elements that may create stacking context issues:",
        potentialIssues
      );

      // Try to fix stacking context issues
      fixStackingContext(potentialIssues);
    } else {
      console.log("✅ No obvious stacking context issues found");
    }
  }

  // Function to fix map controls visibility
  function fixMapControlsVisibility() {
    console.log("🔧 Attempting to fix map controls visibility...");

    // Find the map container
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    // Check if MapView was rendered at all
    const mapCanvas = document.querySelector(".mapboxgl-canvas-container");
    if (!mapCanvas) {
      console.warn(
        "❌ MapBox canvas not found, component may not have rendered"
      );
      return;
    }

    // Create a new div for projection controls if they don't exist
    let projectionControls = document.getElementById("map-projection-controls");
    if (!projectionControls) {
      console.log("🔧 Creating projection controls container");
      projectionControls = document.createElement("div");
      projectionControls.id = "map-projection-controls";
      projectionControls.className = "map-controls mt-4 pt-4 text-center";

      // Add a heading
      const heading = document.createElement("h2");
      heading.className = "text-lg font-semibold mb-3";
      heading.textContent = "Map Projections";
      projectionControls.appendChild(heading);

      // Add a temporary message
      const message = document.createElement("p");
      message.className = "italic text-sm";
      message.textContent =
        "Map controls are being reconstructed. Please reload the page if needed.";
      projectionControls.appendChild(message);

      // Add the controls container after the map
      mapContainer.appendChild(projectionControls);
    }

    // Force visibility on the controls
    projectionControls.style.display = "block";
    projectionControls.style.visibility = "visible";
    projectionControls.style.opacity = "1";
    projectionControls.style.zIndex = "20";
    projectionControls.style.position = "relative";

    console.log("✅ Applied visibility fixes to map controls");
  }

  // Function to fix component structure issues
  function fixMapComponentStructure() {
    console.log("🔧 Attempting to fix map component structure...");

    // Find the map container
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    // Find the mapboxgl canvas
    const mapCanvas = document.querySelector(".mapboxgl-canvas-container");
    if (!mapCanvas) return;

    // Find the closest parent that might be the React component container
    let componentContainer =
      mapCanvas.closest(".map-component-container") ||
      mapCanvas.closest('div[style*="position: relative"]');

    if (!componentContainer) {
      console.log("🔧 Creating component container");
      // Create a wrapper
      componentContainer = document.createElement("div");
      componentContainer.className = "map-component-container";

      // Find the parent of the canvas that we can wrap
      const canvasParent =
        mapCanvas.closest(".mapboxgl-map") || mapCanvas.parentElement;
      if (canvasParent && canvasParent.parentElement) {
        // Insert the new container where the canvas parent is
        canvasParent.parentElement.insertBefore(
          componentContainer,
          canvasParent
        );
        // Move the canvas parent into our new container
        componentContainer.appendChild(canvasParent);
      }
    }

    // Now fix the controls by calling our other fix function
    fixMapControlsVisibility();

    console.log("✅ Applied structural fixes to map component");
  }

  // Function to fix stacking context issues
  function fixStackingContext(problematicElements) {
    console.log("🔧 Attempting to fix stacking context issues...");

    // Find the map container
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    // Adjust z-index and position to establish proper stacking
    mapContainer.style.position = "relative";
    mapContainer.style.zIndex = "10";

    // Add margin below the map container to ensure content below is visible
    mapContainer.style.marginBottom = "300px";

    // Force the main content to establish a stacking context
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.style.position = "relative";
      mainContent.style.zIndex = "1";
    }

    console.log("✅ Applied stacking context fixes");
  }

  // Run the checks when the page is fully loaded
  if (document.readyState === "complete") {
    checkMapRendering();
  } else {
    window.addEventListener("load", checkMapRendering);
  }

  // Also run after a short delay to catch any React-rendered components
  setTimeout(checkMapRendering, 1000);

  // Add a global function that can be called from console for debugging
  window.debugMap = function () {
    console.log("🔍 Manual map debugging triggered");
    checkMapRendering();
    return {
      mapContainer: document.getElementById("map-container"),
      mapComponent: document.querySelector(".map-component-container"),
      mapCanvas: document.querySelector(".mapboxgl-canvas-container"),
      mapControls:
        document.getElementById("map-projection-controls") ||
        document.querySelector(".map-controls"),
      mainContent: document.getElementById("main-content"),
    };
  };
})();
